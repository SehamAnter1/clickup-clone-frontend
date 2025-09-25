import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay
} from "@dnd-kit/core";

// 1️⃣ Draggable item component
function TaskCard({ id, task}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({ id });
  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    transform: `rotateZ(${isDragging ? "-6deg" : "0deg"})`,
    // transition: "transform 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="grid text-start  p-2 my-2 rounded shadow cursor-pointer"
    >
      <h2 className="text-lg font-semibold line-clamp-1">{task?.title}</h2>
      <span className="text-gray-500 line-clamp-2">{task?.description}</span>

        <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                          {task.title}
                        </h4>
                        {/* <GripVertical className="w-5 h-5 text-neutral-500 dark:text-neutral-400 cursor-move" /> */}
                      </div>
                      {task.description && (
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.tags && (
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-neutral-100/60 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/30 dark:border-neutral-700/30">
                        <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              {/* <Calendar className="w-4 h-4" /> */}
                              <span className="text-xs font-medium">Jan 15</span>
                            </div>
                          )}
                          {task.comments && (
                            <div className="flex items-center gap-1">
                              {/* <MessageCircle className="w-4 h-4" /> */}
                              <span className="text-xs font-medium">{task.comments}</span>
                            </div>
                          )}
                          {task.attachments && (
                            <div className="flex items-center gap-1">
                              {/* <Paperclip className="w-4 h-4" /> */}
                              <span className="text-xs font-medium">{task.attachments}</span>
                            </div>
                          )}
                        </div>
                        {task.assignee && (
                          <div className="w-8 h-8 ring-2 ring-white/50 dark:ring-neutral-700/50">
                            <img src={task.assignee.avatar} />
                            <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                              {task.assignee.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

    </div>
  );
}

// 2️⃣ Droppable column component
function DroppableColumn({ columnId, title, children }) {
  // Use the columnId as the droppable ID
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      className="bg-background border border-gray-300 p-4 w-64 min-h-[300px] rounded"
    >
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}

// 3️⃣ Main Kanban Board
export default function KanbanBoard() {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      color: '#8B7355',
      name: "To Do",
      tasks: [
        { id: "task-1", title: "Employee onboarding", description: "Complete the onboarding process for new hires." },
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

  // Track which item is currently dragging
  const [activeId, setActiveId] = useState(null);

  // 🔹 When dragging starts
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = (event) => {
    const { active, over } = event;
  console.log("event",event)
    if (!over) return; // If dropped outside, do nothing
  
    const sourceColumnId = findColumnByTaskId(columns, active.id);
    const destinationColumnId = findColumnByTaskId(columns, over.id) || over.id;
  
    if (!sourceColumnId || !destinationColumnId) return;
  
    setColumns((prev) => {
    // Clone columns to avoid mutation
    const newColumns = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));

    // Find source & destination
    const sourceCol = newColumns.find((col) => col.id === sourceColumnId);
    const destCol = newColumns.find((col) => col.id === destinationColumnId);
    if (!sourceCol || !destCol) return prev;

    // Find task
    const taskIndex = sourceCol.tasks.findIndex((t) => t.id === active.id);
    if (taskIndex === -1) return prev;

    // Move task
    const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);
    destCol.tasks.push(movedTask);

    return newColumns;
  });
  };
  
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4">
        {/* Render columns */}
          {columns.map((col) => (
        <DroppableColumn columnId={col.id} title={col.name} key={col.id}>
          {col.tasks.map((task) => (
            <TaskCard key={task.id}  id={task.id}  task={task} />
          ))}
        </DroppableColumn>
          ))}
      </div>
{console.log("activeId",activeId)

}
      {/* DragOverlay: shows the item being dragged above everything else */}
      <DragOverlay>
        {activeId ? (
 <div className=" -rotate-z-6 transition -all duration- 750">

<TaskCard key={activeId}  id={activeId}  task={getTaskContentById(columns, activeId)} />
          </div>        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// 4️⃣ Utility: find the column ID by a task ID
function findColumnByTaskId(columns, taskId) {
  return columns.find((col) =>
    col.tasks.some((task) => task.id === taskId)
  )?.id;
}

// 5️⃣ Utility: get a task's content by ID
function getTaskContentById(columns, taskId) {
  for (const col of columns) {
    const task = col.tasks.find((task) => task.id === taskId);
    console.log("task",task)
    if (task) return task;
  }
  return null;
}
