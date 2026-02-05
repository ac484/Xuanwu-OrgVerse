import { getFiles } from '@/lib/actions';
import { FileBrowser } from '@/components/file-browser';
import { Header } from '@/components/header';

export default async function Home() {
  const files = await getFiles();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <FileBrowser initialFiles={files} />
      </main>
    </div>
  );
}
