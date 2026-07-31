import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../models/product.dart';
import '../services/catalog_service.dart';
import 'product_detail_screen.dart';

// PlayScreen — a reels-style vertical feed of product videos.
// Each product that has a video becomes one full-screen page. The video for
// the currently visible page autoplays and loops; others are paused.
class PlayScreen extends StatefulWidget {
  const PlayScreen({super.key});

  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  final PageController _pageController = PageController();
  List<Product> _reels = [];
  bool _loading = true;
  String? _error;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final reels = await CatalogService.getReels(limit: 20);
      if (!mounted) return;
      setState(() {
        _reels = reels;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off, size: 44, color: Colors.white54),
            const SizedBox(height: 10),
            Text(_error!, style: const TextStyle(color: Colors.white54)),
            const SizedBox(height: 14),
            ElevatedButton(onPressed: _load, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_reels.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'No product videos yet.\nCheck back soon!',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54, fontSize: 16),
          ),
        ),
      );
    }

    // Vertical, one product video per page (like reels).
    return PageView.builder(
      controller: _pageController,
      scrollDirection: Axis.vertical,
      itemCount: _reels.length,
      onPageChanged: (i) => setState(() => _currentPage = i),
      itemBuilder: (context, index) {
        return _ReelPage(
          product: _reels[index],
          isActive: index == _currentPage,
        );
      },
    );
  }
}

// _ReelPage — a single full-screen video page with a product info overlay.
// Owns its own VideoPlayerController and plays only while [isActive].
class _ReelPage extends StatefulWidget {
  final Product product;
  final bool isActive;

  const _ReelPage({required this.product, required this.isActive});

  @override
  State<_ReelPage> createState() => _ReelPageState();
}

class _ReelPageState extends State<_ReelPage> {
  VideoPlayerController? _controller;
  bool _initialized = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initVideo();
  }

  @override
  void didUpdateWidget(covariant _ReelPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Play/pause as this page becomes the visible one or leaves the screen.
    if (widget.isActive != oldWidget.isActive) {
      _syncPlayback();
    }
  }

  Future<void> _initVideo() async {
    final url = widget.product.videoUrl;
    if (url == null || url.isEmpty) {
      setState(() => _hasError = true);
      return;
    }
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    _controller = controller;
    try {
      await controller.initialize();
      await controller.setLooping(true);
      if (!mounted) return;
      setState(() => _initialized = true);
      _syncPlayback();
    } catch (_) {
      if (!mounted) return;
      setState(() => _hasError = true);
    }
  }

  // Start playing when this is the active page, pause otherwise.
  void _syncPlayback() {
    final c = _controller;
    if (c == null || !_initialized) return;
    if (widget.isActive) {
      c.play();
    } else {
      c.pause();
      c.seekTo(Duration.zero);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _togglePlay() {
    final c = _controller;
    if (c == null || !_initialized) return;
    setState(() {
      c.value.isPlaying ? c.pause() : c.play();
    });
  }

  Future<void> _openDetail() async {
    // Pause the reel while the details page is open, resume on return.
    _controller?.pause();
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ProductDetailScreen(product: widget.product),
      ),
    );
    if (mounted) _syncPlayback();
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    return GestureDetector(
      onTap: _togglePlay,
      // Swipe right-to-left (finger moves left) opens the product details.
      onHorizontalDragEnd: (details) {
        if ((details.primaryVelocity ?? 0) < -100) {
          _openDetail();
        }
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          // ---- Video (or fallback image / error) ----
          _buildVideoLayer(),

          // ---- Dark gradient at the bottom for text legibility ----
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              height: 220,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black87],
                ),
              ),
            ),
          ),

          // ---- Product info + actions ----
          Positioned(
            left: 16,
            right: 16,
            bottom: 24,
            child: _buildOverlay(product),
          ),

          // ---- Center play icon when paused ----
          if (_initialized && _controller != null && !_controller!.value.isPlaying)
            const Center(
              child: Icon(Icons.play_arrow_rounded,
                  size: 74, color: Colors.white70),
            ),
        ],
      ),
    );
  }

  Widget _buildVideoLayer() {
    if (_hasError) {
      // Fall back to the product image if the video failed.
      final img = widget.product.imageUrl;
      if (img.isNotEmpty) {
        return Image.network(img, fit: BoxFit.cover,
            errorBuilder: (_, _, _) => _blackFallback());
      }
      return _blackFallback();
    }
    if (!_initialized || _controller == null) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
    // Cover the whole screen while keeping the video's aspect ratio.
    return FittedBox(
      fit: BoxFit.cover,
      child: SizedBox(
        width: _controller!.value.size.width,
        height: _controller!.value.size.height,
        child: VideoPlayer(_controller!),
      ),
    );
  }

  Widget _blackFallback() {
    return Container(
      color: Colors.black,
      child: const Center(
        child: Icon(Icons.videocam_off, color: Colors.white38, size: 48),
      ),
    );
  }

  Widget _buildOverlay(Product product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Product name only.
        Text(
          product.name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 6),
        // Price row (price + optional MRP/discount).
        Row(
          children: [
            Text(
              '₹${product.price.toStringAsFixed(0)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (product.mrp != null) ...[
              const SizedBox(width: 8),
              Text(
                '₹${product.mrp!.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
              const SizedBox(width: 8),
              if (product.discountPercent > 0)
                Text(
                  '${product.discountPercent}% OFF',
                  style: const TextStyle(
                    color: Colors.greenAccent,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ],
        ),
        const SizedBox(height: 10),
        // Hint: swipe left to open the full product details.
        Row(
          children: const [
            Text(
              'Swipe left for details',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_left, color: Colors.white70, size: 18),
          ],
        ),
      ],
    );
  }
}
