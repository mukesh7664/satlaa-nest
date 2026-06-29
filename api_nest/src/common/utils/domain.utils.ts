export function generateSlug(storeName: string): string {
    return storeName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')         // space → dash
        .replace(/-+/g, '-');         // multiple dash fix
}

export function generateSubdomain(slug: string): string {
    const baseDomain = process.env.BASE_DOMAIN || 'localhost';
    return `${slug}.${baseDomain}`;
}
