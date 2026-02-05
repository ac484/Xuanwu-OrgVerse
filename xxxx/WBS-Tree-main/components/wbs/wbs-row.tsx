'use client';
import type { TaskNode } from '@/lib/types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useWbs } from '@/hooks/use-wbs';
import { cn } from '@/lib/utils';
import { EditableCell } from './editable-cell';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Progress } from '../ui/progress';
import { WBS_COLUMN_DEFS } from './wbs-table';

export function WbsRow({ task }: { task: TaskNode }) {
  const { dispatch, addTask, visibleColumns, selectTask, selectedTaskId } = useWbs();

  const isViolating = task.budgetMeta?.isViolating;
  const isDescendantOfViolating = task.isAnscestorViolating;

  const rowClasses = cn(
    'group',
    isViolating ? 'bg-destructive/10' : '',
    !isViolating && isDescendantOfViolating ? 'bg-destructive/5' : '',
    'transition-colors duration-300 cursor-pointer'
  );

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Done':
        return 'default';
      case 'In Progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const visibleCols = WBS_COLUMN_DEFS.filter(c => visibleColumns.has(c.key as string));

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Only select row if not clicking on an interactive element inside it
    if ((e.target as HTMLElement).closest('button, [role="button"], a, input, select, textarea')) {
        return;
    }
    selectTask(task.id);
  }

  const renderCellContent = (key: (keyof TaskNode)) => {
    switch (key) {
        case 'no':
            return <div
                className="flex items-center gap-1"
                style={{ paddingLeft: `${task.level * 1.5}rem` }}
                >
                {task.children.length > 0 ? (
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'TOGGLE_EXPAND', payload: { taskId: task.id } })
                    }}
                    >
                    {task.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                ) : (
                    <span className="w-6" />
                )}
                <span>{task.no}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); addTask(task.id) }}>
                    <Plus className="h-4 w-4" />
                </Button>
                </div>;
        case 'name':
            return <EditableCell task={task} field="name" />;
        case 'description':
            return <EditableCell task={task} field="description" />;
        case 'owner':
            return <EditableCell task={task} field="owner" />;
        case 'tags':
            return <EditableCell task={task} field="tags">
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {task.tags.map(t => <Badge key={t} variant="secondary" className='whitespace-nowrap'>{t}</Badge>)}
                </div>
            </EditableCell>;
        case 'assignees':
            return <EditableCell task={task} field="assignees">
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {task.assignees.map(a => <Badge key={a} variant="outline" className='whitespace-nowrap'>{a}</Badge>)}
                </div>
            </EditableCell>;
        case 'dependencies':
            return task.dependencies.join(', ');
        case 'priority':
            return <EditableCell task={task} field="priority">
                <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
            </EditableCell>;
        case 'status':
            return <EditableCell task={task} field="status">
                <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
            </EditableCell>;
        case 'startTime':
            return <EditableCell task={task} field="startTime">
                {task.startTime ? format(new Date(task.startTime), 'MMM d, yyyy') : 'N/A'}
            </EditableCell>;
        case 'endTime':
            return <EditableCell task={task} field="endTime">
                {task.endTime ? format(new Date(task.endTime), 'MMM d, yyyy') : 'N/A'}
            </EditableCell>;
        case 'actualStartTime':
            return <EditableCell task={task} field="actualStartTime">
                {task.actualStartTime ? format(new Date(task.actualStartTime), 'MMM d, yyyy') : 'N/A'}
            </EditableCell>;
        case 'actualEndTime':
            return <EditableCell task={task} field="actualEndTime">
                {task.actualEndTime ? format(new Date(task.actualEndTime), 'MMM d, yyyy') : 'N/A'}
            </EditableCell>;
        case 'quantity':
            return <EditableCell task={task} field="quantity" className="justify-end" />;
        case 'unitPrice':
            return <EditableCell task={task} field="unitPrice" className="justify-end" />;
        case 'subtotal':
            return <div className={cn("text-right font-mono", isViolating && 'text-destructive font-bold')}>
                {task.subtotal.toFixed(2)}
                {isViolating && (
                    <div className="text-xs font-normal">Over: {task.budgetMeta?.overBudgetBy.toFixed(2)}</div>
                )}
                </div>;
        case 'progress':
            return <EditableCell task={task} field="progress">
                <div className='flex items-center gap-2'>
                    <Progress value={task.progress} className="h-2" />
                    <span className='text-xs text-muted-foreground'>{task.progress}%</span>
                </div>
            </EditableCell>;
        case 'total':
             return <div className="text-right font-mono">{task.total.toFixed(2)}</div>;
        default:
            // @ts-ignore
            return <EditableCell task={task} field={key}>{task[key]?.toString()}</EditableCell>;
    }
  }

  return (
    <TableRow 
        className={rowClasses}
        onClick={handleRowClick}
        data-state={selectedTaskId === task.id ? 'selected' : 'unselected'}
    >
        {visibleCols.map(col => (
            <TableCell key={col.key} className={col.className}>
                {renderCellContent(col.key as any)}
            </TableCell>
        ))}
    </TableRow>
  );
}
