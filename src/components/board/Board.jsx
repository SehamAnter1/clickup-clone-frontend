import { useState } from "react";
import {
  DndContext, closestCenter
} from "@dnd-kit/core";
import BoardUI from "./BoardUI";

export default function KanbanBoard() {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      color: '#8B7355',
      name: "To Do",
      tasks: [
        {
          id: "task-1",
          img: 'https://cdn.dribbble.com/userupload/5571579/file/original-3833e52e567db7ee9f164120068854b0.png?resize=1504x1253&vertical=center',
          title: "Employee onboarding", description: "Complete the onboarding process for new hires."
        },
        { id: "task-2", title: "Task 2", description: "Description for Task 2 three lines content goes here. say something" },
        {
          id: '1',
          title: 'Design System Audit',
          description: 'Review and update component library',
          priority: 'high',
          assignee: { name: 'Sarah Chen', avatar: 'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png' },
          tags: ['Design', 'System'],
          dueDate: '2024-01-15',
          attachments: 3,
          comments: 7,
        },
        {
          id: '2',
          title: 'User Research Analysis',
          description: 'Analyze feedback from recent user interviews',
          priority: 'medium',
          assignee: { name: 'Alex Rivera', avatar: 'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png' },
          tags: ['Research', 'UX'],
          dueDate: '2024-01-18',
          comments: 4,
        }]
    },

    {
      id: "inProgress",
      name: "In Progress",
      tasks: [
        { id: "task-3", title: "Task 3" }
      ]
    },
    {
      id: "done",
      name: "Done",
      tasks: []
    }
  ]);

  // currently dragging item
  const [activeId, setActiveId] = useState(null);

  // dragging starts
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
   // dragging end

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    const sourceColumnId = findColumnByTaskId(columns, active.id);
    let destinationColumnId;

    // Check if over is a task or column
    const overTask = columns
      .flatMap(col => col.tasks)
      .find(t => t.id === over.id);

    if (overTask) {
      destinationColumnId = findColumnByTaskId(columns, overTask.id);
    } else {
      destinationColumnId = over.id; // empty column
    }

    if (!sourceColumnId || !destinationColumnId) return;

    setColumns(prev => {
      const newColumns = prev.map(c => ({ ...c, tasks: [...c.tasks] }));
      const sourceCol = newColumns.find(c => c.id === sourceColumnId);
      const destCol = newColumns.find(c => c.id === destinationColumnId);

      if (!sourceCol || !destCol) return prev;

      const taskIndex = sourceCol.tasks.findIndex(t => t.id === active.id);
      if (taskIndex === -1) return prev;

      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      // Calculate insert index
      let insertIndex;
      if (overTask) {
        const overEl = document.getElementById(overTask.id); // get DOM
        const overRect = overEl.getBoundingClientRect();
        const pointerY = event.activatorEvent.clientY;

        const overIndex = destCol.tasks.findIndex(t => t.id === overTask.id);
        insertIndex = pointerY < overRect.top + overRect.height / 2
          ? overIndex      // insert before
          : overIndex + 1; // insert after
      } else {
        insertIndex = destCol.tasks.length; // empty column
      }

      destCol.tasks.splice(insertIndex, 0, movedTask);

      // Recalculate order
      destCol.tasks = destCol.tasks.map((t, i) => ({ ...t, order: i }));
      sourceCol.tasks = sourceCol.tasks.map((t, i) => ({ ...t, order: i }));

      return newColumns;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[]}
      dragStartDelay={150} 
      activationConstraint={{
        distance: 10, // only start dragging if pointer moves 10px
      }} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <BoardUI
        columns={columns}
        activeId={activeId}
        getTaskContentById={getTaskContentById}
      />
    </DndContext>

  );
}
// get col ID by task ID
function findColumnByTaskId(columns, taskId) {
  return columns.find((col) =>
    col.tasks.some((task) => task.id === taskId)
  )?.id;
}

// get task by ID
function getTaskContentById(columns, taskId) {
  for (const col of columns) {
    const task = col.tasks.find((task) => task.id === taskId);
    console.log("task", task)
    if (task) return task;
  }
  return null;
}
