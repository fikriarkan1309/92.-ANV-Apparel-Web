import { createClient } from '@sanity/client';
import { FabricMaterial, ProductCatalogItem, PortfolioItem } from '../types';

const projectId = (import.meta as any).env.VITE_SANITY_PROJECT_ID || '';
const dataset = (import.meta as any).env.VITE_SANITY_DATASET || 'production';

export const isSanityConfigured = 
  projectId && 
  !projectId.includes('your-sanity-project-id');

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      useCdn: true,
      apiVersion: '2023-01-01', // Use current date for stable versioning
    })
  : null;

/**
 * Sanity schemas setup description for the user:
 * 
 * 1. fabricMaterial
 *    {
 *      name: 'fabricMaterial',
 *      type: 'document',
 *      fields: [
 *        { name: 'id', type: 'string' },
 *        { name: 'name', type: 'string' },
 *        { name: 'description', type: 'string' },
 *        { name: 'fullDescription', type: 'string' },
 *        { name: 'characteristics', type: 'array', of: [{ type: 'string' }] },
 *        { name: 'image', type: 'image' }, // or url string
 *        { name: 'suitability', type: 'string' }
 *      ]
 *    }
 * 
 * 2. productCatalog
 *    {
 *      name: 'productCatalog',
 *      type: 'document',
 *      fields: [
 *        { name: 'id', type: 'string' },
 *        { name: 'name', type: 'string' },
 *        { name: 'category', type: 'string' },
 *        { name: 'image', type: 'image' }, // or url string
 *        { name: 'description', type: 'string' },
 *        { name: 'priceEstimate', type: 'string' }
 *      ]
 *    }
 * 
 * 3. portfolioItem
 *    {
 *      name: 'portfolioItem',
 *      type: 'document',
 *      fields: [
 *        { name: 'id', type: 'string' },
 *        { name: 'title', type: 'string' },
 *        { name: 'category', type: 'string' },
 *        { name: 'image', type: 'image' }, // or url string
 *        { name: 'collarDetail', type: 'string' },
 *        { name: 'stitchDetail', type: 'string' },
 *        { name: 'sharpnessDetail', type: 'string' }
 *      ]
 *    }
 */

// Helper function to resolve Sanity images
// Depending on whether user sets a simple string URL or Sanity Image Asset
function resolveSanityImage(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img.asset && img.asset._ref) {
    // Standard Sanity Image URL builder pattern without needing full library:
    // e.g. image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
    const ref = img.asset._ref;
    const parts = ref.split('-');
    if (parts.length >= 4) {
      const id = parts[1];
      const dimensions = parts[2];
      const ext = parts[3];
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}`;
    }
  }
  return '';
}

export async function fetchSanityFabrics(): Promise<FabricMaterial[] | null> {
  if (!sanityClient) return null;
  try {
    const data = await sanityClient.fetch(`*[_type == "fabricMaterial"]`);
    return data.map((item: any) => ({
      id: item.id || item._id,
      name: item.name,
      description: item.description,
      fullDescription: item.fullDescription,
      characteristics: item.characteristics || [],
      image: resolveSanityImage(item.image) || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80',
      suitability: item.suitability,
    }));
  } catch (err) {
    console.warn('Graceful Sanity fallback: could not reach fabrics, using offline mock data.', err);
    return null;
  }
}

export async function fetchSanityCatalog(): Promise<ProductCatalogItem[] | null> {
  if (!sanityClient) return null;
  try {
    const data = await sanityClient.fetch(`*[_type == "productCatalog"]`);
    return data.map((item: any) => ({
      id: item.id || item._id,
      name: item.name,
      category: item.category,
      image: resolveSanityImage(item.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
      description: item.description,
      priceEstimate: item.priceEstimate,
    }));
  } catch (err) {
    console.warn('Graceful Sanity fallback: could not reach catalog space, using offline mock data.', err);
    return null;
  }
}

export async function fetchSanityPortfolio(): Promise<PortfolioItem[] | null> {
  if (!sanityClient) return null;
  try {
    const data = await sanityClient.fetch(`*[_type == "portfolioItem"]`);
    return data.map((item: any) => ({
      id: item.id || item._id,
      title: item.title,
      category: item.category,
      image: resolveSanityImage(item.image) || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
      collarDetail: item.collarDetail,
      stitchDetail: item.stitchDetail,
      sharpnessDetail: item.sharpnessDetail,
    }));
  } catch (err) {
    console.warn('Graceful Sanity fallback: could not reach portfolio items, using offline mock data.', err);
    return null;
  }
}
