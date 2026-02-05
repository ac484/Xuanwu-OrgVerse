'use client';

import { WbsProvider } from '@/components/wbs/wbs-provider';
import { WbsTable } from '@/components/wbs/wbs-table';
import { WbsToolbar } from '@/components/wbs/wbs-toolbar';
import { Card, CardContent, CardHeader } from '../ui/card';
import { WbsInspector } from './wbs-inspector';

export function Wbs() {
  return (
    <WbsProvider>
      <div className="flex h-screen w-full flex-col p-4 md:p-6 lg:p-8">
        <main className="flex flex-1 flex-col overflow-hidden">
          <Card className="flex flex-1 flex-col overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-end border-b p-4">
              <WbsToolbar />
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <WbsTable />
            </CardContent>
          </Card>
        </main>
        <WbsInspector />
      </div>
    </WbsProvider>
  );
}
