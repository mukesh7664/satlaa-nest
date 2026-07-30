export function getFullS3Url(key?: string): string {
    if (!key) return key;
    if (key.startsWith('http://') || key.startsWith('https://')) {
        return key;
    }

    const bucket = process.env.AWS_S3_BUCKET || 'prefyn-saas';
    const region = process.env.AWS_REGION || 'ap-south-1';
    
    // Fallback URL pattern if logic is missing from .env
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function getS3KeyFromUrl(url?: string): string {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return url; // It's already a key
    }
    
    try {
        const parsedUrl = new URL(url);
        // Amazon S3 URLs usually look like: https://bucket.s3.region.amazonaws.com/key
        // The pathname includes the leading slash, e.g., '/stores/123/img.png'
        // We want to return 'stores/123/img.png'
        if (parsedUrl.hostname.includes('amazonaws.com')) {
            return parsedUrl.pathname.substring(1);
        }
    } catch (e) {
        // Fallback for invalid URLs
    }
    return url;
}
