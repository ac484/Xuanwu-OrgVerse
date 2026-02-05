import type { Task, TaskNode, TaskId } from './types';

/**
 * Calculates the subtotal for a given task.
 * @param task - A task object with quantity and unitPrice.
 * @returns The calculated subtotal.
 */
function calculateSubtotal(task: Pick<Task, 'quantity' | 'unitPrice'>): number {
  return task.quantity * task.unitPrice;
}

/**
 * Calculates the total for a given task, including tax.
 * @param subtotal - The subtotal of the task.
 * @param taxRate - The tax rate as a percentage (e.g., 5 for 5%).
 * @returns The calculated total.
 */
function calculateTotal(subtotal: number, taxRate: number): number {
  return subtotal * (1 + taxRate / 100);
}


/**
 * Recursively processes a tree of tasks to calculate derived properties for UI display.
 * This function is the core of the budget constraint logic.
 *
 * For each task, it:
 * 1. Calculates its own `subtotal` and `total`.
 * 2. Recursively processes its children.
 * 3. Calculates `descendantSubtotal`, which is the sum of all subtotals in its subtree.
 * 4. Determines if a budget violation has occurred. A violation happens if `descendantSubtotal`
 *    is greater than the task's own `subtotal` (which acts as the budget cap).
 * 5. Sets `isViolating` and `overBudgetBy` flags on a `budgetMeta` object.
 * 6. Propagates a `isAnscestorViolating` flag down the tree so that children of a violating
 *    task can be styled differently.
 *
 * @param tasks - The array of tasks to process.
 * @param expandedIds - A set of task IDs that are currently expanded in the UI.
 * @param level - The current depth in the tree (used for indentation).
 * @param isAnscestorViolating - A flag indicating if any parent in the hierarchy is already violating its budget.
 * @returns An array of processed TaskNode objects, ready for rendering.
 */
export function processTaskTree(
  tasks: Task[],
  expandedIds: Set<TaskId>,
  level = 0,
  isAnscestorViolating = false
): TaskNode[] {
  return tasks.map((task) => {
    const subtotal = calculateSubtotal(task);
    const total = calculateTotal(subtotal, task.taxRate);
    const isExpanded = expandedIds.has(task.id);

    // Recursively process children, passing down the current violation status
    const processedChildren = task.children
      ? processTaskTree(task.children, expandedIds, level + 1, isAnscestorViolating)
      : [];

    // Sum up the subtotals of all descendants to check against the current task's budget
    const descendantSubtotal = processedChildren.reduce(
      (acc, child) => acc + child.subtotal + (child.budgetMeta?.descendantSubtotal ?? 0),
      0
    );

    // A task's subtotal acts as the budget for its children.
    // Violation occurs if the sum of children's costs exceeds this budget.
    const overBudgetBy = subtotal > 0 ? descendantSubtotal - subtotal : descendantSubtotal;
    const isViolating = overBudgetBy > 0;
    
    const node: TaskNode = {
      ...task,
      children: processedChildren,
      level,
      subtotal,
      total,
      isExpanded,
      budgetMeta: {
        descendantSubtotal,
        overBudgetBy,
        isViolating,
      },
      // The node is affected if its own budget is violated or if an ancestor's budget is violated.
      isAnscestorViolating: isAnscestorViolating || isViolating
    };

    // If this node is violating, all its descendants are considered affected.
    if (isViolating) {
        node.children.forEach(child => {
            // This ensures the property is correctly passed down the entire violating branch.
            child.isAnscestorViolating = true;
        });
    }
    
    return node;
  });
}

/**
 * Flattens a tree of TaskNode objects into a flat array for rendering in a table.
 * It only includes children of nodes that are marked as `isExpanded`.
 *
 * @param taskTree - The hierarchical array of TaskNode objects.
 * @returns A flat array of TaskNode objects representing the visible rows.
 */
export function flattenTaskTree(taskTree: TaskNode[]): TaskNode[] {
    const flattened: TaskNode[] = [];
    function traverse(nodes: TaskNode[]) {
        for (const node of nodes) {
            flattened.push(node);
            if (node.isExpanded && node.children) {
                traverse(node.children);
            }
        }
    }
    traverse(taskTree);
    return flattened;
}
