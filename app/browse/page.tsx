import { Suspense } from 'react';
import BrowsePage from './BrowsePage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <BrowsePage />
    </Suspense>
  );
}
