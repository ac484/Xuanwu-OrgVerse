'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FirestagramLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PostForm } from './post-form';

export function Header() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <FirestagramLogo className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline sm:inline-block">
                Firestagram
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="New Post">
                  <PlusSquare className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a new post</DialogTitle>
                </DialogHeader>
                <PostForm onPostCreated={() => setIsUploadDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </>
  );
}
