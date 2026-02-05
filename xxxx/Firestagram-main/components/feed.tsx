'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '@/lib/types';
import { fetchPosts } from '@/app/actions';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useOnScreen } from '@/hooks/use-on-screen';
import { PostCard } from '@/components/post-card';
import { ImageDialog } from '@/components/image-dialog';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const getNumColumns = (breakpoint: string | undefined): number => {
  if (!breakpoint) return 1;
  switch (breakpoint) {
    case 'xs':
      return 1;
    case 'sm':
      return 2;
    case 'md':
      return 3;
    default:
      return 4;
  }
};

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [columns, setColumns] = useState<Post[][]>([[]]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoaderVisible = useOnScreen(loaderRef, '200px');

  const breakpoint = useBreakpoint();
  const numColumns = getNumColumns(breakpoint);

  // Listen for new posts created by the user
  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const customEvent = event as CustomEvent<Post>;
      const newPost = customEvent.detail;
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    window.addEventListener('post-created', handlePostCreated);
    return () => {
      window.removeEventListener('post-created', handlePostCreated);
    };
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const newPosts = await fetchPosts(page);
    if (newPosts.length > 0) {
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    if (isLoaderVisible && hasMore) {
      loadMorePosts();
    }
  }, [isLoaderVisible, hasMore, loadMorePosts]);

  useEffect(() => {
    if (posts.length === 0) {
      loadMorePosts();
    }
  }, [loadMorePosts, posts.length]);
  
  useEffect(() => {
    if (numColumns === 0) return;
    const newColumns: Post[][] = Array.from({ length: numColumns }, () => []);
    const columnHeights = Array(numColumns).fill(0);

    posts.forEach((post) => {
      let shortestColumnIndex = 0;
      for (let i = 1; i < columnHeights.length; i++) {
        if (columnHeights[i] < columnHeights[shortestColumnIndex]) {
          shortestColumnIndex = i;
        }
      }
      
      if (newColumns[shortestColumnIndex]) {
        newColumns[shortestColumnIndex].push(post);
        const aspectRatio = post.height / post.width;

        if (isFinite(aspectRatio)) {
          columnHeights[shortestColumnIndex] += aspectRatio;
        } else {
          columnHeights[shortestColumnIndex] += 1;
        }
      }
    });

    setColumns(newColumns);
  }, [posts, numColumns]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleDialogClose = () => {
    setSelectedPost(null);
  };

  return (
    <>
      <div
        className="flex items-start gap-2 sm:gap-4"
        style={{ '--num-columns': numColumns } as React.CSSProperties}
      >
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-1 flex-col gap-2 sm:gap-4 w-full">
            {column.map((post) => (
              <PostCard key={post.id} post={post} onPostClick={handlePostClick} />
            ))}
          </div>
        ))}
      </div>

      <div ref={loaderRef} className="h-20 flex items-center justify-center">
        {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
        {!hasMore && posts.length > 0 && <p className="text-muted-foreground">You've reached the end!</p>}
      </div>
      
      <AnimatePresence>
        {selectedPost && (
          <ImageDialog
            post={selectedPost}
            isOpen={!!selectedPost}
            onClose={handleDialogClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
