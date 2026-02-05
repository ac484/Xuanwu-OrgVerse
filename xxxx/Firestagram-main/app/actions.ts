'use server';

import { generateImageCaption, GenerateImageCaptionInput } from "@/ai/flows/generate-image-caption";
import { mockPosts } from "@/lib/mock-data";
import { Post } from "@/lib/types";

// NOTE: In a real application, you would replace mockPosts with a Firestore query.
// Example using Firebase Admin SDK (for server-side):
/*
import { firestore } from '@/lib/firebase-admin'; // Assuming you have this setup

export async function fetchPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
  let query = firestore.collection('posts').orderBy('createdAt', 'desc').limit(limit);

  if (page > 1) {
    const lastVisibleDocId = await getLastDocIdForPage(page - 1, limit);
    if(lastVisibleDocId) {
        const lastVisibleDoc = await firestore.collection('posts').doc(lastVisibleDocId).get();
        query = query.startAfter(lastVisibleDoc);
    }
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    return [];
  }

  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  return posts;
}
*/

export async function fetchPosts(
  page: number = 1,
  limit: number = 10
): Promise<Post[]> {
  const start = (page - 1) * limit;
  const end = start + limit;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return mockPosts.slice(start, end);
}

export async function generateCaptionAction(input: GenerateImageCaptionInput) {
  try {
    const result = await generateImageCaption(input);
    return { success: true, caption: result.caption };
  } catch (error) {
    console.error("Error generating caption:", error);
    return { success: false, error: "Failed to generate caption. Please try again." };
  }
}
