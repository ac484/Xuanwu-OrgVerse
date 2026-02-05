'use client';
import {
  createContext,
  useReducer,
  useMemo,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react';
import type { Task, TaskId, TaskNode } from '@/lib/types';
import { initialTasks } from '@/lib/wbs-data';
import { processTaskTree } from '@/lib/wbs-helpers';
import { useToast } from '@/hooks/use-toast';

// State and Reducer
type WbsState = {
  tasks: Task[];
  expandedIds: Set<TaskId>;
  history: Task[][];
  historyIndex: number;
  visibleColumns: Set<string>;
  selectedTaskId: TaskId | null;
};

type WbsAction =
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; fromImport?: boolean } }
  | { type: 'ADD_TASK'; payload: { parentId: TaskId | null; newTask: Task } }
  | { type: 'UPDATE_TASK'; payload: { taskId: TaskId; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: TaskId } }
  | { type: 'TOGGLE_EXPAND'; payload: { taskId: TaskId } }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_COLUMN'; payload: { columnKey: string } }
  | { type: 'SELECT_TASK'; payload: { taskId: TaskId | null } };

function findAndApply(
  tasks: Task[],
  parentId: TaskId | null,
  applyFn: (tasks: Task[]) => Task[]
): Task[] {
  if (parentId === null) {
    return applyFn(tasks);
  }

  return tasks.map(task => {
    if (task.id === parentId) {
      const children = task.children || [];
      return { ...task, children: applyFn(children) };
    }
    if (task.children && task.children.length > 0) {
      const newChildren = findAndApply(task.children, parentId, applyFn);
      if (newChildren !== task.children) {
        return { ...task, children: newChildren };
      }
    }
    return task;
  });
}

function findAndManipulate(
  tasks: Task[],
  taskId: TaskId,
  manipulateFn: (tasks: Task[], index: number) => Task[]
): Task[] {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return manipulateFn(tasks, i);
    }
    if (tasks[i].children && tasks[i].children.length > 0) {
      const newChildren = findAndManipulate(
        tasks[i].children,
        taskId,
        manipulateFn
      );
      if (newChildren !== tasks[i].children) {
        const newTasks = [...tasks];
        newTasks[i] = { ...newTasks[i], children: newChildren };
        return newTasks;
      }
    }
  }
  return tasks;
}

const wbsReducer = (state: WbsState, action: WbsAction): WbsState => {
  const updateHistory = (newTasks: Task[]): Pick<WbsState, 'tasks' | 'history' | 'historyIndex'> => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newTasks);
    return {
      tasks: newTasks,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  };

  switch (action.type) {
    case 'SET_TASKS': {
      const newTasks = action.payload.tasks;
      if (action.payload.fromImport) {
        return { ...state, tasks: newTasks, history: [newTasks], historyIndex: 0 };
      }
      return { ...state, tasks: newTasks };
    }

    case 'ADD_TASK': {
      const { parentId, newTask } = action.payload;
      const newTasks = findAndApply(state.tasks, parentId, (tasks) => [...tasks, newTask]);
      return { ...state, ...updateHistory(newTasks) };
    }

    case 'UPDATE_TASK': {
      const { taskId, updates } = action.payload;
      const newTasks = findAndManipulate(state.tasks, taskId, (tasks, index) => {
        const newArr = [...tasks];
        newArr[index] = { ...newArr[index], ...updates };
        return newArr;
      });
      return { ...state, ...updateHistory(newTasks) };
    }

    case 'DELETE_TASK': {
      const { taskId } = action.payload;
      const newTasks = findAndManipulate(state.tasks, taskId, (tasks, index) => {
        const newArr = [...tasks];
        newArr.splice(index, 1);
        return newArr;
      });
      return { ...state, ...updateHistory(newTasks) };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newHistoryIndex = state.historyIndex - 1;
        return {
          ...state,
          tasks: state.history[newHistoryIndex],
          historyIndex: newHistoryIndex,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newHistoryIndex = state.historyIndex + 1;
        return {
          ...state,
          tasks: state.history[newHistoryIndex],
          historyIndex: newHistoryIndex,
        };
      }
      return state;
    }

    case 'TOGGLE_EXPAND': {
      const newExpandedIds = new Set(state.expandedIds);
      if (newExpandedIds.has(action.payload.taskId)) {
        newExpandedIds.delete(action.payload.taskId);
      } else {
        newExpandedIds.add(action.payload.taskId);
      }
      return { ...state, expandedIds: newExpandedIds };
    }

    case 'EXPAND_ALL': {
      const allIds = new Set<TaskId>();
      const collectIds = (tasks: Task[]) => {
        tasks.forEach(t => {
          if (t.children.length > 0) {
            allIds.add(t.id);
            collectIds(t.children);
          }
        });
      };
      collectIds(state.tasks);
      return { ...state, expandedIds: allIds };
    }

    case 'COLLAPSE_ALL':
      return { ...state, expandedIds: new Set() };
      
    case 'TOGGLE_COLUMN': {
      const newVisibleColumns = new Set(state.visibleColumns);
      if (newVisibleColumns.has(action.payload.columnKey)) {
        newVisibleColumns.delete(action.payload.columnKey);
      } else {
        newVisibleColumns.add(action.payload.columnKey);
      }
      return { ...state, visibleColumns: newVisibleColumns };
    }

    case 'SELECT_TASK': {
        return { ...state, selectedTaskId: action.payload.taskId };
    }

    default:
      return state;
  }
};

const defaultVisibleColumns = new Set(['no', 'name', 'status', 'owner', 'priority', 'subtotal']);

const initialState: WbsState = {
  tasks: initialTasks,
  expandedIds: new Set(['proj-1', 'proj-1.1']),
  history: [initialTasks],
  historyIndex: 0,
  visibleColumns: defaultVisibleColumns,
  selectedTaskId: null,
};

type WbsContextType = {
  taskTree: TaskNode[];
  dispatch: React.Dispatch<WbsAction>;
  addTask: (parentId: TaskId | null) => void;
  updateTask: (taskId: TaskId, updates: Partial<Task>) => void;
  deleteTask: (taskId: TaskId) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  visibleColumns: Set<string>;
  selectedTaskId: TaskId | null;
  selectTask: (taskId: TaskId | null) => void;
};

const WbsContext = createContext<WbsContextType | undefined>(undefined);

export function WbsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wbsReducer, initialState);
  const { toast } = useToast();

  const taskTree = useMemo(
    () => processTaskTree(state.tasks, state.expandedIds),
    [state.tasks, state.expandedIds]
  );

  useEffect(() => {
    const violations: { taskName: string; overage: number }[] = [];
    const checkViolations = (nodes: TaskNode[]) => {
      nodes.forEach(node => {
        if (node.budgetMeta?.isViolating) {
          violations.push({ taskName: node.name, overage: node.budgetMeta.overBudgetBy });
        }
        if (node.children) {
          checkViolations(node.children);
        }
      });
    };
    checkViolations(taskTree);
    if (violations.length > 0) {
      toast({
        variant: 'destructive',
        title: `Budget Constraint Violated`,
        description: `${violations.map(v => `${v.taskName} is over budget by ${v.overage.toFixed(2)}`).join(', ')}`,
      });
    }
  }, [taskTree, toast]);

  const addTask = useCallback(
    (parentId: TaskId | null) => {
      let parent: Task | undefined;
      let newNo: string;
      const newId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      if (parentId) {
        // Adding a child task
        const findParent = (tasks: Task[], id: TaskId): Task | undefined => {
          for (const task of tasks) {
            if (task.id === id) return task;
            if (task.children.length > 0) {
              const found = findParent(task.children, id);
              if (found) return found;
            }
          }
          return undefined;
        };
        parent = findParent(state.tasks, parentId);
        
        if (parent) {
            if (parent.children.length > 0) {
                const childNos = parent.children.map(c => parseInt(c.no.split('.').pop() || '0'));
                const maxChildNo = Math.max(...childNos);
                newNo = `${parent.no}.${maxChildNo + 1}`;
            } else {
                newNo = `${parent.no}.1`;
            }
        } else {
            console.error("Parent not found for ID:", parentId);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add child task: Parent not found.',
            });
            return;
        }
      } else {
        // Adding a root task
        if (state.tasks.length > 0) {
            const rootNos = state.tasks.map(t => parseInt(t.no.split('.')[0]) || 0);
            const maxRootNo = Math.max(...rootNos);
            newNo = (maxRootNo + 1).toString();
        } else {
            newNo = '1';
        }
      }
      
      const newTask: Task = {
        id: newId,
        no: newNo,
        name: 'New Task',
        description: '',
        type: 'Task',
        priority: 'None',
        owner: '',
        assignees: [],
        tags: [],
        quantity: 0,
        unit: 'unit',
        unitPrice: 0,
        currency: parent?.currency || 'USD',
        taxRate: parent?.taxRate || 0,
        progress: 0,
        weight: 0,
        location: parent?.location || '',
        space: parent?.space || '',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        actualStartTime: null,
        actualEndTime: null,
        status: 'To Do',
        dependencies: [],
        attachments: [],
        locked: false,
        completedBy: null,
        completedAt: null,
        children: [],
      };

      dispatch({ type: 'ADD_TASK', payload: { parentId, newTask } });
      if (parentId && !state.expandedIds.has(parentId)) {
        dispatch({ type: 'TOGGLE_EXPAND', payload: { taskId: parentId } });
      }
    },
    [state.tasks, state.expandedIds, toast]
  );

  const updateTask = useCallback((taskId: TaskId, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  }, []);

  const deleteTask = useCallback((taskId: TaskId) => {
    dispatch({ type: 'DELETE_TASK', payload: { taskId } });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const selectTask = useCallback((taskId: TaskId | null) => {
    dispatch({ type: 'SELECT_TASK', payload: { taskId } });
  }, []);

  const value = useMemo(
    () => ({
      taskTree,
      dispatch,
      addTask,
      updateTask,
      deleteTask,
      undo,
      redo,
      canUndo,
      canRedo,
      visibleColumns: state.visibleColumns,
      selectedTaskId: state.selectedTaskId,
      selectTask,
    }),
    [taskTree, addTask, updateTask, deleteTask, undo, redo, canUndo, canRedo, state.visibleColumns, state.selectedTaskId, selectTask]
  );

  return <WbsContext.Provider value={value}>{children}</WbsContext.Provider>;
}

export { WbsContext };
