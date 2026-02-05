'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { TaskNode, Priority, Status } from '@/lib/types';
import { PRIORITIES, STATUSES } from '@/lib/types';
import { useWbs } from '@/hooks/use-wbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from './date-picker';
import { cn } from '@/lib/utils';

type EditableCellProps = {
  task: TaskNode;
  field: keyof TaskNode;
  children?: React.ReactNode;
  className?: string;
};

export function EditableCell({ task, field, children, className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTask } = useWbs();
  const [currentValue, setCurrentValue] = useState(task[field]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const value = task[field];

  useEffect(() => {
    setCurrentValue(task[field]);
  }, [task, field]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if(isEditing) {
            handleSave();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef, isEditing]);


  const handleSave = () => {
    if (currentValue !== task[field]) {
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate' || field === 'progress' || field === 'weight') {
            updateTask(task.id, { [field]: Number(currentValue) });
        } else if (field === 'tags' || field === 'assignees') {
            const tags = (currentValue as string).split(',').map(t => t.trim()).filter(Boolean);
            updateTask(task.id, { [field]: tags });
        } else {
            // @ts-ignore
            updateTask(task.id, { [field]: currentValue });
        }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(task[field]);
      setIsEditing(false);
    }
  };

  const renderEditingView = () => {
    switch (field) {
      case 'name':
      case 'owner':
      case 'unit':
      case 'currency':
        return (
          <Input
            ref={inputRef}
            type="text"
            value={currentValue as string}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
        );
      case 'description':
        return (
            <Textarea
                value={currentValue as string}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="text-sm"
            />
        );
      case 'tags':
      case 'assignees':
        return (
            <Input
              ref={inputRef}
              type="text"
              value={(currentValue as string[]).join(', ')}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8"
            />
        );
      case 'quantity':
      case 'unitPrice':
      case 'taxRate':
      case 'progress':
      case 'weight':
        return (
            <Input
              ref={inputRef}
              type="number"
              value={currentValue as number}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-right"
            />
          );
      case 'priority':
        return (
          <Select
            value={currentValue as Priority}
            onValueChange={(val) => {
              updateTask(task.id, { [field]: val });
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'status':
        return (
          <Select
            value={currentValue as Status}
            onValueChange={(val) => {
              updateTask(task.id, { [field]: val });
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        case 'startTime':
        case 'endTime':
        case 'actualStartTime':
        case 'actualEndTime':
        case 'completedAt':
            return (
                <DatePicker 
                    date={currentValue ? new Date(currentValue as string) : undefined} 
                    setDate={(date) => {
                        updateTask(task.id, { [field]: date?.toISOString() ?? null })
                        setIsEditing(false);
                    }}
                />
            )
      default:
        return <span>Unsupported field</span>;
    }
  };

  return (
    <div ref={wrapperRef} className={cn("flex items-center min-h-8 w-full", className)} onClick={() => setIsEditing(true)}>
      {isEditing ? renderEditingView() : (
        children ?? <span className='truncate w-full block'>{value?.toString()}</span>
      )}
    </div>
  );
}
