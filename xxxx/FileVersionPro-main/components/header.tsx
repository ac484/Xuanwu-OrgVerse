import { UploadDialog } from './upload-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground font-headline">
          FileVersionPro
        </h1>
        <UploadDialog />
      </div>
    </header>
  );
}
