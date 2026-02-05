'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DAYS_OF_WEEK,
  memberFormSchema,
  type MemberFormValues,
} from '@/lib/types';

interface CreateMemberModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateMember: (memberData: MemberFormValues) => void;
  locationName: string;
}

export function CreateMemberModal({
  isOpen,
  onOpenChange,
  onCreateMember,
  locationName,
}: CreateMemberModalProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      role: '',
      maxHoursPerWeek: 40,
      unavailableDays: [],
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    onCreateMember(data);
    form.reset();
  };

  // When opening, reset the form to clear previous validation errors
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Member</DialogTitle>
          <DialogDescription>
            Add a new team member to the {locationName} location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Barista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Hours/Week</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unavailableDays"
              render={() => (
                <FormItem>
                  <FormLabel>Unavailable Days</FormLabel>
                  <div className="grid grid-cols-4 gap-2 rounded-lg border p-4 sm:grid-cols-7">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <FormField
                        key={index}
                        control={form.control}
                        name="unavailableDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={index}
                              className="flex flex-row items-center justify-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(index)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          index,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== index
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {day.substring(0, 3)}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    Select the days the member cannot work.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Member</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
