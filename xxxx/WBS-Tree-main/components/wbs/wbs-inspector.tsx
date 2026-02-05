'use client';
import { useWbs } from '@/hooks/use-wbs';
import { flattenTaskTree } from '@/lib/wbs-helpers';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

export function WbsInspector() {
  const { selectedTaskId, selectTask, taskTree, deleteTask } = useWbs();

  const flattenedTasks = flattenTaskTree(taskTree);
  const selectedTask = selectedTaskId ? flattenedTasks.find(t => t.id === selectedTaskId) : null;

  const handleClose = () => {
    selectTask(null);
  };
  
  const handleDelete = () => {
    if (selectedTask) {
        deleteTask(selectedTask.id);
        handleClose();
    }
  };

  const renderField = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 items-start gap-4 py-2">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="col-span-2 text-sm">{value || '-'}</div>
    </div>
  );

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-y-auto">
        {selectedTask && (
          <>
            <SheetHeader className="pr-12 text-left">
              <SheetTitle className="truncate">{selectedTask.name}</SheetTitle>
              <SheetDescription>
                {selectedTask.no} &bull; {selectedTask.type}
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
                <div className='space-y-2'>
                    <h4 className="font-semibold">General</h4>
                    <Separator />
                    {renderField('Description', <p className="whitespace-pre-wrap">{selectedTask.description}</p>)}
                    {renderField('Status', <Badge variant={selectedTask.status === 'Done' ? 'default' : 'outline'}>{selectedTask.status}</Badge>)}
                    {renderField('Priority', <Badge variant={selectedTask.priority === 'High' || selectedTask.priority === 'Urgent' ? 'destructive' : 'secondary'}>{selectedTask.priority}</Badge>)}
                    {renderField('Locked', selectedTask.locked ? 'Yes' : 'No')}
                </div>
                <div className='space-y-2'>
                    <h4 className="font-semibold">People & Tags</h4>
                    <Separator />
                    {renderField('Owner', selectedTask.owner)}
                    {renderField('Assignees', <div className="flex flex-wrap gap-1">{selectedTask.assignees.map(a => <Badge key={a} variant="outline">{a}</Badge>)}</div>)}
                    {renderField('Tags', <div className="flex flex-wrap gap-1">{selectedTask.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>)}
                </div>

                <div className='space-y-2'>
                    <h4 className="font-semibold">Schedule</h4>
                    <Separator />
                    {renderField('Planned Start', selectedTask.startTime ? format(new Date(selectedTask.startTime), 'PPpp') : null)}
                    {renderField('Planned End', selectedTask.endTime ? format(new Date(selectedTask.endTime), 'PPpp') : null)}
                    {renderField('Actual Start', selectedTask.actualStartTime ? format(new Date(selectedTask.actualStartTime), 'PPpp') : null)}
                    {renderField('Actual End', selectedTask.actualEndTime ? format(new Date(selectedTask.actualEndTime), 'PPpp') : null)}
                </div>

                <div className='space-y-2'>
                    <h4 className="font-semibold">Cost</h4>
                    <Separator />
                    {renderField('Quantity', selectedTask.quantity)}
                    {renderField('Unit', selectedTask.unit)}
                    {renderField('Unit Price', `${selectedTask.unitPrice.toFixed(2)} ${selectedTask.currency}`)}
                    {renderField('Tax Rate', `${selectedTask.taxRate}%`)}
                    {renderField('Subtotal', `${selectedTask.subtotal.toFixed(2)} ${selectedTask.currency}`)}
                    {renderField('Total', `${selectedTask.total.toFixed(2)} ${selectedTask.currency}`)}
                </div>
                
                 <div className='space-y-2'>
                    <h4 className="font-semibold">Progress & Context</h4>
                    <Separator />
                    {renderField('Progress', `${selectedTask.progress}%`)}
                    {renderField('Weight', `${selectedTask.weight}%`)}
                    {renderField('Location', selectedTask.location)}
                    {renderField('Space', selectedTask.space)}
                 </div>

                 <div className='space-y-2'>
                    <h4 className="font-semibold">Relationships</h4>
                    <Separator />
                    {renderField('Dependencies', selectedTask.dependencies.join(', ') || 'None')}
                 </div>
            </div>
            <SheetFooter className='mt-4 flex-row justify-end gap-2'>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            task and all of its child tasks.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleClose} variant="outline">Close</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
