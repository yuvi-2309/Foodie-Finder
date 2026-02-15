/**
 * Generates a consistent restaurant image URL based on the restaurant name.
 * Uses a curated set of high-quality Unsplash food/restaurant images.
 * The same name always produces the same image.
 */

const RESTAURANT_IMAGES = [
  // Fine dining / elegant interiors
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800',
  // Casual dining / cafes
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  // Food focused
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  // Indian / Asian cuisine
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800',
  'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
  // Street food / casual
  'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
];

/**
 * Simple string hash function that produces a consistent numeric hash.
 */
function hashString(str: string): number {
  let hash = 0;
  const normalized = str.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a consistent restaurant image URL based on the restaurant name.
 * Same name always returns the same image.
 */
export function getRestaurantImage(name: string): string {
  if (!name) return RESTAURANT_IMAGES[0];
  const index = hashString(name) % RESTAURANT_IMAGES.length;
  return RESTAURANT_IMAGES[index];
}
