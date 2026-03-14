'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

export default function UnionNode() {
  return (
    <div className="relative flex items-center justify-center">
      {/* A tiny dot that acts as the merge point between parents and source for children */}
      <div className="h-2 w-2 rounded-full bg-zinc-300 shadow-sm border border-white" />
      
      <Handle type="target" position={Position.Top} className="!top-1/2 !bg-transparent !border-none !h-0 !w-0" />
      <Handle type="target" position={Position.Left} className="!left-0 !bg-transparent !border-none !h-0 !w-0" />
      <Handle type="target" position={Position.Right} className="!right-0 !bg-transparent !border-none !h-0 !w-0" />
      
      <Handle type="source" position={Position.Bottom} className="!bottom-0 !bg-zinc-300 !h-2 !w-2 !border-none" />
    </div>
  );
}
