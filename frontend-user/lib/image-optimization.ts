/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Utilitaire d'optimisation d'images via Supabase CDN
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/**
 * Transforme une URL Supabase Storage en URL optimisée via le service de transformation d'image.
 * Nécessite que le bucket soit public et que le plan Supabase supporte la transformation d'image.
 * 
 * @param url URL de l'image originale
 * @param options Options de redimensionnement (width, height, quality, resize)
 * @returns URL optimisée ou l'URL originale si non compatible
 */
export function getOptimizedImageUrl(
    url: string | undefined | null, 
    options: { 
        width?: number; 
        height?: number; 
        quality?: number; 
        resize?: 'cover' | 'contain' | 'fill' 
    } = {}
): string {
    if (!url) return "";
    
    // Vérifier si c'est une URL Supabase Storage standard
    if (!url.includes('supabase.co/storage/v1/object/public/')) {
        return url;
    }

    // N'utiliser la transformation d'image CDN que si elle est activée en variable d'env
    if (process.env.NEXT_PUBLIC_ENABLE_SUPABASE_IMAGE_TRANSFORM !== 'true') {
        return url;
    }

    const { width, height, quality = 80, resize = 'cover' } = options;
    
    // Remplacer /object/public/ par /render/image/public/ pour activer la transformation
    const transformedBaseUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('resize', resize);
    
    // Forcer le format webp pour de meilleures performances
    params.append('format', 'webp');
    
    return `${transformedBaseUrl}?${params.toString()}`;
}
