import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React from 'react'
import TaskCard from '../ui/TaskCard';

export default function DroppableColumn({ columnId, title, tasks }) {
   const { setNodeRef } = useDroppable({ id: columnId });
 
   return (
     <div
       ref={setNodeRef}
       className="bg-background !mb-[200px] border border-gray-300 p-4 w-64 min-h-[300px] rounded"
     >
       <h2 className="text-lg font-bold mb-2">{title}</h2>
       <SortableContext
         items={tasks.map((t) => t.id)} 
         strategy={verticalListSortingStrategy}
       >
         {tasks.map((task) => (
           <TaskCard key={task.id} id={task.id} task={task} />
         ))}
       </SortableContext>
     </div>
   );
 }
