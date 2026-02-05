'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from '@/components/ui/table';
import { useWbs } from '@/hooks/use-wbs';
import { WbsRow } from './wbs-row';
import { flattenTaskTree } from '@/lib/wbs-helpers';

export const WBS_COLUMN_DEFS: { key: string, header: string, className?: string }[] = [
    { key: 'no', header: 'No.', className: "w-40" },
    { key: 'name', header: 'Name', className: "w-1/4 min-w-48" },
    { key: 'description', header: 'Description', className: 'w-1/4 min-w-48' },
    { key: 'owner', header: 'Owner' },
    { key: 'assignees', header: 'Assignees' },
    { key: 'tags', header: 'Tags' },
    { key: 'dependencies', header: 'Dependencies' },
    { key: 'priority', header: 'Priority' },
    { key: 'status', header: 'Status' },
    { key: 'progress', header: 'Progress'},
    { key: 'startTime', header: 'Planned Start' },
    { key: 'endTime', header: 'Planned End' },
    { key: 'actualStartTime', header: 'Actual Start' },
    { key: 'actualEndTime', header: 'Actual End' },
    { key: 'quantity', header: 'Qty', className: "text-right" },
    { key: 'unit', header: 'Unit'},
    { key: 'unitPrice', header: 'Unit Price', className: "text-right" },
    { key: 'currency', header: 'Currency', className: "text-right" },
    { key: 'taxRate', header: 'Tax %', className: "text-right" },
    { key: 'subtotal', header: 'Subtotal', className: "text-right" },
    { key: 'total', header: 'Total', className: "text-right" },
    { key: 'location', header: 'Location' },
    { key: 'space', header: 'Space' },
    { key: 'attachments', header: 'Attachments' },
];


export function WbsTable() {
  const { taskTree, visibleColumns } = useWbs();
  const flattenedTasks = flattenTaskTree(taskTree);

  const visibleColumnDefs = WBS_COLUMN_DEFS.filter(col => visibleColumns.has(col.key));

  return (
    <div className="w-full h-full overflow-auto">
    <Table className="whitespace-nowrap">
      <TableHeader className="sticky top-0 bg-card z-10">
        <TableRow>
            {visibleColumnDefs.map(col => (
                <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {flattenedTasks.map((task) => (
          <WbsRow key={task.id} task={task} />
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
