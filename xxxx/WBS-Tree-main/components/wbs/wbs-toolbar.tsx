'use client';

import { Button } from '@/components/ui/button';
import { useWbs } from '@/hooks/use-wbs';
import {
    Plus,
    Expand,
    ListCollapse,
    FileDown,
    FileUp,
    Undo2,
    Redo2,
    View,
  } from 'lucide-react';
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { WBS_COLUMN_DEFS } from './wbs-table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function WbsToolbar() {
  const { dispatch, addTask, taskTree, undo, redo, canUndo, canRedo, visibleColumns } = useWbs();

  const handleExport = () => {
    const dataStr = JSON.stringify(taskTree, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'wbs-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                try {
                    const importedTasks = JSON.parse(result);
                    // Add validation here before dispatching
                    dispatch({ type: 'SET_TASKS', payload: { tasks: importedTasks, fromImport: true } });
                } catch (error) {
                    console.error("Failed to parse imported JSON", error);
                }
            }
        };
    }
  }

  return (
    <TooltipProvider>
    <div className="flex items-center gap-2">
       <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => addTask(null)}>
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Root Task</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'EXPAND_ALL' })}>
                <Expand className="h-4 w-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Expand All</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}>
                <ListCollapse className="h-4 w-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Collapse All</p>
        </TooltipContent>
      </Tooltip>
      
      <div className="h-6 border-l mx-2"></div>
      
       <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 border-l mx-2"></div>
      
      <DropdownMenu>
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <View className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
                <p>View Options</p>
            </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WBS_COLUMN_DEFS.filter(col => col.key !== 'no' && col.key !== 'name').map(col => (
                <DropdownMenuCheckboxItem
                    key={col.key}
                    className="capitalize"
                    checked={visibleColumns.has(col.key)}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_COLUMN', payload: { columnKey: col.key }})}
                    onSelect={(e) => e.preventDefault()}
                >
                    {col.header}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleExport}>
                <FileDown className="h-4 w-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export JSON</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
                <label htmlFor="import-file" className='flex items-center justify-center h-10 w-10 cursor-pointer'>
                    <FileUp className="h-4 w-4" />
                    <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Import JSON</p>
        </TooltipContent>
      </Tooltip>

    </div>
    </TooltipProvider>
  );
}
