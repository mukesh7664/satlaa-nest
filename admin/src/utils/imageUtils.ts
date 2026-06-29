export const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Clean the URL
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

    // Check if it's an uploads path (served from S3)
    if (cleanUrl.startsWith("uploads/")) {
        const s3Root =
            process.env.NEXT_PUBLIC_S3_ROOT ||
            "https://your-bucket.s3.amazonaws.com";
        return `${s3Root}/${cleanUrl}`;
    }

    // Default to API URL for other local paths if any
    const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"
    ).replace(/\/api\/v1\/?$/, "");
    return `${baseUrl}/${cleanUrl}`;
};
