'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/actions';

const formSchema = z.object({
  file: z.any().refine((files) => files?.length === 1, 'File is required.'),
  changeDescription: z
    .string()
    .min(3, 'Description must be at least 3 characters.')
    .max(100, 'Description must be less than 100 characters.'),
});

export function UploadDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        changeDescription: '',
    }
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', values.file[0]);
    formData.append('changeDescription', values.changeDescription);

    try {
      await uploadFile(formData);
      toast({
        title: 'Upload Successful',
        description: `File "${values.file[0].name}" has been uploaded.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description:
          'An error occurred while uploading the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New File or Version</DialogTitle>
          <DialogDescription>
            Select a file and describe the changes. If a file with the same name
            exists, a new version will be created.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="changeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Changes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Added new section for Q4 projections."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps generate a useful version name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
