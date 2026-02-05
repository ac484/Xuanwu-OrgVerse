'use client';

import Image from 'next/image';
import { Post } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Skeleton } from './ui/skeleton';

interface PostCardProps {
  post: Post;
  onPostClick: (post: Post) => void;
}

export function PostCard({ post, onPostClick }: PostCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="break-inside-avoid"
    >
      <Card
        className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        onClick={() => onPostClick(post)}
      >
        <CardContent className="p-0">
          <div className="relative">
            {!isImageLoaded && (
              <Skeleton 
                className="w-full"
                style={{ aspectRatio: `${post.width} / ${post.height}` }}
              />
            )}
            <Image
              src={post.imageUrl}
              width={post.width}
              height={post.height}
              alt={post.caption}
              data-ai-hint={post.imageHint}
              className={cn(
                "w-full h-auto object-cover transition-opacity duration-500",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-1 cursor-pointer" onClick={handleLikeClick}>
                  <Heart className={cn("w-5 h-5 transition-colors", isLiked && "fill-red-500 text-red-500")} />
                  <span>{likeCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
