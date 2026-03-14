'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { User, Eye, EyeOff, UserPlus, Baby, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PersonNode({ data }: { data: any }) {
  const isDeceased = !!data.isDeceased;
  const deathYear = data.deathYear ? data.deathYear : (data.deathDate ? new Date(data.deathDate).getFullYear() : null);
  const isAdmin = data.isAdmin;

  // Manual theme detection to ensure NO system overlap
  // We use style properties to strictly follow the data-theme attribute via CSS variables
  return (
    <div className="group relative flex flex-col items-center">
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} className="!opacity-0 shadow-none !border-none" />
      
      {/* Profile Frame - Pure Variable Based */}
      <div 
        style={{ backgroundColor: 'var(--node-bg)' }}
        onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.(data);
        }}
        className={cn(
        "relative h-24 w-24 rounded-[2.5rem] border-[4px] p-1.5 transition-all duration-500 z-10 cursor-pointer hover:scale-110 active:scale-95",
        isDeceased 
            ? "border-stone-200 grayscale shadow-sm" 
            : (data.gender === 'MALE' 
                ? "border-sky-500 shadow-xl shadow-sky-500/10" 
                : "border-pink-500 shadow-xl shadow-pink-500/10")
      )}>
        <div 
          style={{ backgroundColor: 'var(--background)' }}
          className="h-full w-full rounded-[2rem] overflow-hidden flex items-center justify-center relative"
        >
          {data.photoUrl ? (
            <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" />
          ) : (
            <User className={cn(
              isDeceased ? "text-stone-200" : (data.gender === 'MALE' ? "text-sky-100 dark:text-sky-900/40" : "text-pink-100 dark:text-pink-900/40")
            )} size={48} />
          )}
        </div>
        
        {isDeceased && (
            <div className="absolute -top-1 -right-1 bg-stone-800 text-stone-50 text-[9px] px-2 py-0.5 rounded-full font-medium shadow-lg border border-white/20 z-20">
                {deathYear}
            </div>
        )}

        {/* Hide Button */}
        {data.hasDescendants && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    data.onToggleCollapse?.(data.id);
                }}
                style={{ backgroundColor: 'var(--node-bg)', color: 'var(--node-text)' }}
                className={cn(
                    "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 shadow-lg flex items-center justify-center transition-all duration-300 z-30",
                    data.isCollapsed 
                        ? "bg-orange-500 text-white animate-pulse border-white" 
                        : "border-white hover:text-orange-500 hover:scale-110"
                )}
            >
                {data.isCollapsed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        )}
      </div>

      {/* Name Plaque - CRISP WHITE ON LIGHT MODE */}
      <div className="mt-4 flex flex-col items-center w-[200px]">
        <div 
          style={{ backgroundColor: 'var(--node-bg)', borderColor: 'var(--border)', color: 'var(--node-text)' }}
          className={cn(
            "px-6 py-2.5 max-w-full rounded-2xl border transition-all duration-500 pointer-events-none shadow-xl shadow-stone-200/40 dark:shadow-none",
            isDeceased && "opacity-60 italic"
          )}
        >
          <h3 className="text-[12px] font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis text-center leading-tight">
            {data.name}
          </h3>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!opacity-0 shadow-none !border-none" />

      {/* Action Menu */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0 z-50">
          <button 
              onClick={(e) => { e.stopPropagation(); data.onAddSpouse?.(data.id); }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 shadow-xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
          >
              <UserPlus size={16} />
          </button>
          <button 
              onClick={(e) => { e.stopPropagation(); data.onAddChild?.(data.id); }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 shadow-xl hover:bg-sky-600 transition-all hover:scale-110 active:scale-95"
          >
              <Baby size={16} />
          </button>
          <button 
              onClick={(e) => { e.stopPropagation(); data.onDelete?.(data.id); }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500 text-stone-50 shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95"
          >
              <Trash2 size={16} />
          </button>
      </div>
    </div>
  );
}
