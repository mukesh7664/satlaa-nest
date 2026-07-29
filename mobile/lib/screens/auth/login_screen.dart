import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import 'signup_screen.dart';

// LoginScreen — email + password form that calls the backend.
// StatefulWidget because it has changing data: the text fields, a loading
// flag, and any error message. Web analogy: a form component with useState.
class LoginScreen extends StatefulWidget {
  // Called after a successful login so the app can show the main screens.
  final VoidCallback onLoggedIn;

  const LoginScreen({super.key, required this.onLoggedIn});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // formKey lets us run validation on all fields at once.
  final _formKey = GlobalKey<FormState>();

  // Controllers hold the text typed in each field.
  // Web analogy: like the value of a controlled <input>.
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _loading = false; // true while the API call is in progress
  bool _obscurePassword = true; // hide/show password text

  // Always free controllers when the screen is destroyed (avoids memory leaks).
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // 1. Run field validation. If anything is invalid, stop.
    if (!_formKey.currentState!.validate()) return;

    // 2. Show the loading spinner.
    setState(() => _loading = true);

    try {
      // 3. Call the backend.
      await AuthService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      // 4. Success -> tell the app to move on.
      if (mounted) widget.onLoggedIn();
    } catch (e) {
      // 5. Show the error from the backend (e.g. wrong password).
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      // 6. Always hide the spinner.
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // SafeArea keeps content away from the notch / status bar.
      body: SafeArea(
        child: Center(
          // Scrollable so the keyboard doesn't overflow the layout.
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  // ---- Brand / heading ----
                  const Icon(Icons.shopping_bag,
                      size: 64, color: Colors.deepPurple),
                  const SizedBox(height: 16),
                  const Text(
                    'Welcome to Satlaa',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Login to continue',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 32),

                  // ---- Email field ----
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                      border: OutlineInputBorder(),
                    ),
                    // validator returns an error string, or null if valid.
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // ---- Password field ----
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline),
                      border: const OutlineInputBorder(),
                      // Eye button to toggle password visibility.
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // ---- Login button ----
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        foregroundColor: Colors.white,
                      ),
                      child: _loading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Login',
                              style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ---- Link to signup ----
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? "),
                      GestureDetector(
                        onTap: _loading
                            ? null
                            : () {
                                // Open the signup screen.
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SignupScreen(
                                        onLoggedIn: widget.onLoggedIn),
                                  ),
                                );
                              },
                        child: const Text(
                          'Sign Up',
                          style: TextStyle(
                            color: Colors.deepPurple,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
