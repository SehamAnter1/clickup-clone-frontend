import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay
} from "@dnd-kit/core";

// 1️⃣ Draggable item component
function DraggableItem({ id, content }) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-red=600 p-2 my-2 rounded shadow cursor-pointer"
    >
      {content}
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
      className="bg-gray-200 p-4 w-64 min-h-[300px] rounded"
    >
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}

// 3️⃣ Main Kanban Board
export default function KanbanBoard() {
  // Example columns
  const [columns, setColumns] = useState({
    todo: [
      { id: "task-1", content: "Task 1" },
      { id: "task-2", content: "Task 2" },
    ],
    inProgress: [{ id: "task-3", content: "Task 3" }],
    done: [],
  });

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
      const newColumns = { ...prev };
  
      // Remove from source column
      const sourceTasks = [...newColumns[sourceColumnId]];
      const taskIndex = sourceTasks.findIndex((t) => t.id === active.id);
      if (taskIndex === -1) return prev; // Prevent accidental duplicates
  
      const [movedTask] = sourceTasks.splice(taskIndex, 1);
  
      // Add to destination column
      newColumns[sourceColumnId] = sourceTasks;
      newColumns[destinationColumnId] = [...newColumns[destinationColumnId], movedTask];
  
      return newColumns;
    });
  };
  
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4">
        {/* Render columns */}
        <DroppableColumn columnId="todo" title="To Do">
          {columns.todo.map((task) => (
            <DraggableItem key={task.id} id={task.id} content={task.content} />
          ))}
        </DroppableColumn>

        <DroppableColumn columnId="inProgress" title="In Progress">
          {columns.inProgress.map((task) => (
            <DraggableItem key={task.id} id={task.id} content={task.content} />
          ))}
        </DroppableColumn>

        <DroppableColumn columnId="done" title="Done">
          {columns.done.map((task) => (
            <DraggableItem key={task.id} id={task.id} content={task.content} />
          ))}
        </DroppableColumn>
      </div>

      {/* DragOverlay: shows the item being dragged above everything else */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-2 rounded shadow">
            {getTaskContentById(columns, activeId)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// 4️⃣ Utility: find the column ID by a task ID
function findColumnByTaskId(columns, taskId) {
  return Object.keys(columns).find((colId) =>
    columns[colId].some((task) => task.id === taskId)
  );
}

// 5️⃣ Utility: get a task's content by ID
function getTaskContentById(columns, taskId) {
  const columnId = findColumnByTaskId(columns, taskId);
  if (!columnId) return null;
  return columns[columnId].find((task) => task.id === taskId)?.content;
}
