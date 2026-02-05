'use client';

import { useState, useTransition, FormEvent } from 'react';
import Image from 'next/image';
import { Post, Comment } from '@/lib/types';
import { generateCaptionAction } from '@/app/actions';
import { toDataURL } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface ImageDialogProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageDialog({ post, isOpen, onClose }: ImageDialogProps) {
  const [tags, setTags] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState('');

  const handleGenerateCaption = async () => {
    if (!post.imageUrl) return;

    startTransition(async () => {
      try {
        const dataUri = await toDataURL(post.imageUrl);
        
        const result = await generateCaptionAction({
          photoDataUri: dataUri,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        });

        if (result.success && result.caption) {
          setGeneratedCaption(result.caption);
          toast({
            title: "Caption Generated!",
            description: "A new caption has been created by AI.",
          });
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Caption generation failed:", error);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "Could not generate a caption. Please check CORS policy on image storage and try again.",
        });
      }
    });
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObject: Comment = {
      id: `new-comment-${Date.now()}`,
      text: newComment,
      author: {
        name: 'Current User', // Mocked user
        avatarUrl: 'https://picsum.photos/seed/avatar/40/40',
      },
    };

    setComments(prev => [...prev, newCommentObject]);
    setNewComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 !gap-0">
        <motion.div
          layoutId={`card-${post.id}`}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          <div className="relative min-h-[50vh] md:min-h-0 md:h-[90vh]">
            <Image
              src={post.imageUrl}
              alt={post.caption}
              fill
              className="object-cover rounded-l-lg"
              sizes="(max-width: 768px) 90vw, 50vw"
            />
          </div>
          <div className="p-6 flex flex-col h-full max-h-[50vh] sm:max-h-[70vh] md:max-h-[90vh] md:h-[90vh]">
            <div className="flex-shrink-0 flex items-start space-x-3 pb-4 border-b">
               <Avatar>
                <AvatarImage
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm flex-grow">
                <p className="font-bold">{post.author.name}</p>
                <p className="text-foreground/80 mt-1">{post.caption}</p>
              </div>
            </div>
            
            <ScrollArea className="flex-grow my-4 pr-4 -mr-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <span className="font-semibold">{comment.author.name}</span>{' '}
                      <span>{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex-shrink-0 mt-auto">
              <div className="space-y-4 py-4 border-t">
                  <h3 className="text-base font-semibold flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary" />
                    AI Tools
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Add tags to improve caption</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., nature, sunset, happy"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleGenerateCaption} disabled={isPending} className="w-full">
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate New Caption
                  </Button>
                  {generatedCaption && (
                    <div className="p-3 bg-accent/50 rounded-md">
                      <p className="text-sm font-medium text-accent-foreground">{generatedCaption}</p>
                    </div>
                  )}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 py-4 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="Current User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" size="sm" disabled={!newComment.trim()}>Post</Button>
              </form>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
