import { Header } from '@/components/header';
import { Feed } from '@/components/feed';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-6">
        <Suspense fallback={<FeedSkeleton />}>
          <Feed />
        </Suspense>
      </main>
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className={`h-64 md:h-80 lg:h-96 rounded-lg ${i % 3 === 0 ? 'h-80' : i % 3 === 1 ? 'h-96' : 'h-64'}`} />
      ))}
    </div>
  )
}
