'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Loader2 } from 'lucide-react';
import { DialogFooter } from './ui/dialog';

interface PostFormProps {
  onPostCreated: () => void;
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 4MB.",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile || !previewUrl) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please select an image to upload.",
      });
      return;
    }
    if (!caption.trim()) {
      toast({
        variant: "destructive",
        title: "No caption",
        description: "Please write a caption for your post.",
      });
      return;
    }
    setIsSubmitting(true);

    // Mock post creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const image = document.createElement('img');
    image.src = previewUrl;
    await new Promise(resolve => {
      image.onload = resolve;
      // Handle image load error
      image.onerror = () => {
        resolve(null); // Resolve to continue, but width/height will be fallback
      };
    });

    const newPost: Post = {
      id: `new-${Date.now()}`,
      imageUrl: previewUrl,
      imageHint: 'custom upload',
      width: image.naturalWidth || 1080,
      height: image.naturalHeight || 1080,
      caption: caption,
      likes: 0,
      comments: 0,
      author: {
        name: 'Current User', // Mocked user
        avatarUrl: 'https://picsum.photos/seed/avatar/40/40',
      },
    };

    window.dispatchEvent(new CustomEvent('post-created', { detail: newPost }));

    toast({
      title: "Post Created!",
      description: "Your new post has been added to the feed.",
    });

    setIsSubmitting(false);
    onPostCreated(); // Close dialog
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          {previewUrl ? (
            <div className="relative aspect-square w-full">
              <Image
                src={previewUrl}
                alt="Image preview"
                fill
                className="rounded-md object-cover"
              />
               <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreviewUrl(null);
                  setImageFile(null);
                  if(fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-background/50 hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload an image
              </p>
              <p className="text-xs text-muted-foreground">(Max 4MB)</p>
            </div>
          )}
          <Input
            id="image-upload"
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post
        </Button>
      </DialogFooter>
    </form>
  );
}
