import { Post, Comment } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Helper to get dimensions from image URL
const getDimensionsFromUrl = (url: string): { width: number, height: number } => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'picsum.photos') {
      const parts = urlObj.pathname.split('/');
      const height = parseInt(parts[parts.length - 1], 10);
      const width = parseInt(parts[parts.length - 2], 10);
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    } else if (urlObj.hostname === 'images.unsplash.com') {
      // For unsplash, we can get width from query params, but height is unknown.
      // We'll generate a deterministic height based on the photo ID for variety.
      const idMatch = urlObj.pathname.match(/\/photo-([a-zA-Z0-9-]+)/);
      if (idMatch && idMatch[1]) {
        const hash = idMatch[1].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // This creates varied but consistent heights for the masonry layout
        const height = 800 + (hash % 800); // Height between 800 and 1600
        const width = parseInt(urlObj.searchParams.get('w') || '1080', 10);
        return { width, height };
      }
    }
  } catch (e) {
    // Fallthrough to default if URL parsing fails
  }

  // Fallback for any other URL or if parsing fails
  return { width: 1080, height: 1350 };
};

const authors = [
    { name: 'Alice', avatarUrl: 'https://picsum.photos/seed/author1/40/40' },
    { name: 'Bob', avatarUrl: 'https://picsum.photos/seed/author2/40/40' },
    { name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/author3/40/40' },
    { name: 'Diana', avatarUrl: 'https://picsum.photos/seed/author4/40/40' },
    { name: 'Eve', avatarUrl: 'https://picsum.photos/seed/author5/40/40' },
    { name: 'Frank', avatarUrl: 'https://picsum.photos/seed/author6/40/40' },
];

const mockComments: Omit<Comment, 'id'>[] = [
    { author: authors[1], text: "Wow, amazing shot!" },
    { author: authors[2], text: "Love the colors in this." },
    { author: authors[3], text: "Where was this taken?" },
    { author: authors[0], text: "Incredible! I need to visit." },
    { author: authors[4], text: "This is so beautiful." },
    { author: authors[5], text: "Great composition!" },
    { author: authors[0], text: "I'm speechless." },
    { author: authors[2], text: "Can't wait to see more from you." },
];

export const mockPosts: Post[] = PlaceHolderImages.map((image, index) => {
  const { width, height } = getDimensionsFromUrl(image.imageUrl);
  const numComments = Math.floor(Math.random() * 5) + 1;
  const postComments: Comment[] = Array.from({ length: numComments }, (_, i) => ({
      ...mockComments[(index + i) % mockComments.length],
      id: `comment-${image.id}-${i}`
  }));

  return {
    id: image.id,
    imageUrl: image.imageUrl,
    imageHint: image.imageHint,
    width: width,
    height: height,
    caption: `A beautiful photo of ${image.description.toLowerCase()}.`,
    likes: Math.floor(Math.random() * 2000),
    comments: postComments,
    author: authors[index % authors.length],
  };
});
