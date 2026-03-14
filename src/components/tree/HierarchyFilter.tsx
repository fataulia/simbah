'use client';

import React from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HierarchyFilterProps {
  currentGeneration: number;
  onGenerationChange: (gen: number) => void;
}

export default function HierarchyFilter({ currentGeneration, onGenerationChange }: HierarchyFilterProps) {
  const generations = [
    { value: 0, label: 'Semua Generasi' },
    { value: 1, label: 'Generasi 1 (Simbah)' },
    { value: 2, label: 'Generasi 2 (Bapak/Ibu)' },
    { value: 3, label: 'Generasi 3 (Cucu)' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-11 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 shadow-sm transition-all hover:bg-zinc-50">
        <Layers size={18} className="text-zinc-400" />
        <select
          value={currentGeneration}
          onChange={(e) => onGenerationChange(Number(e.target.value))}
          className="bg-transparent text-sm font-semibold text-zinc-900 outline-none cursor-pointer"
        >
          {generations.map((gen) => (
            <option key={gen.value} value={gen.value}>
              {gen.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="text-zinc-400" />
      </div>
    </div>
  );
}
