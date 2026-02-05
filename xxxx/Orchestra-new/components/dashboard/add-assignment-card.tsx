'use client';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface AddAssignmentCardProps {
  onClick: () => void;
}

export function AddAssignmentCard({ onClick }: AddAssignmentCardProps) {
  return (
    <Card
      onClick={onClick}
      className="h-9 w-9 cursor-pointer flex-shrink-0 rounded-full border-2 border-dashed border-muted-foreground/50 bg-muted/50 transition-colors hover:border-primary hover:bg-primary/10"
    >
      <CardContent className="flex h-full items-center justify-center p-0">
        <Plus className="h-4 w-4 text-muted-foreground/80" />
      </CardContent>
    </Card>
  );
}
