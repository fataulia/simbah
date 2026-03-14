'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Heart, Baby } from 'lucide-react';

export default function FamilyNode({ data }: { data?: any }) {
  return (
    <div className="group relative flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-md transition-all hover:scale-125">
       <div className="h-3 w-3 rounded-full bg-zinc-50 flex items-center justify-center">
          <Heart size={6} className="text-zinc-400 fill-zinc-400" />
       </div>
       
       <Handle type="target" position={Position.Top} className="!opacity-0" />
       <Handle type="target" position={Position.Left} className="!left-[-1px] !h-1 !w-1 !bg-zinc-300" />
       <Handle type="target" position={Position.Right} className="!right-[-1px] !h-1 !w-1 !bg-zinc-300" />
       <Handle type="source" position={Position.Bottom} className="!bottom-[-1px] !h-1 !w-1 !bg-zinc-300" />
       
       <button 
           onClick={(e) => { 
               e.stopPropagation(); 
               if (data?.onAddChildToFamily) {
                   data.onAddChildToFamily(data.id);
               }
           }}
           title="Tambah Anak ke Keluarga Ini"
           className="absolute -right-8 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-sky-600 shadow-md z-50 pointer-events-auto"
       >
           <Baby size={12} />
       </button>
    </div>
  );
}
