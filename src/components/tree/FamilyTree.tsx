'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import PersonNode from './PersonNode';
import FamilyNode from './FamilyNode';
import PersonDetail from './PersonDetail';
import { buildGraph } from '@/lib/graphBuilder';
import { getLayoutedElements } from '@/lib/layoutEngine';
import { deletePerson } from '@/app/actions/tree';

const nodeTypes = {
  person: PersonNode,
  family: FamilyNode,
};

interface FamilyTreeProps {
  initialPeople: any[];
  initialFamilies: any[];
  initialChildren: any[];
  isAdmin?: boolean;
  onEdit?: (person: any) => void;
  onAddSpouse?: (id: string) => void;
  onAddChild?: (personId: string) => void;
  onRefresh?: () => void;
}

export default function FamilyTree({ 
  initialPeople, 
  initialFamilies, 
  initialChildren, 
  isAdmin, 
  onEdit,
  onAddSpouse,
  onAddChild,
  onRefresh
}: FamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  }, []);

  // Filter people and families based on collapse state
  const visibleData = useMemo(() => {
    const hiddenPersonIds = new Set<string>();
    const hiddenFamilyIds = new Set<string>();

    const hideDescendants = (personId: string, isRoot = true) => {
        // Find families where this person is a parent
        const parentFamilies = initialFamilies.filter(f => f.partner1Id === personId || f.partner2Id === personId);
        
        parentFamilies.forEach(fam => {
            // We hide the family node ONLY if we want to hide everything below it
            hiddenFamilyIds.add(fam.id);
            
            // Hide the spouse to clean up the view
            const spouseId = fam.partner1Id === personId ? fam.partner2Id : fam.partner1Id;
            if (spouseId) {
                hiddenPersonIds.add(spouseId);
            }

            // Hide children of this family and recurse
            const familyChildren = initialChildren.filter(c => c.familyId === fam.id);
            familyChildren.forEach(childRel => {
                const childId = childRel.childId;
                if (!hiddenPersonIds.has(childId)) {
                    hiddenPersonIds.add(childId);
                    hideDescendants(childId, false); // Carry isRoot=false down
                }
            });
        });
    };

    collapsedIds.forEach(id => hideDescendants(id, true));
    return {
        people: initialPeople.filter(p => !hiddenPersonIds.has(p.id)),
        families: initialFamilies.filter(f => !hiddenFamilyIds.has(f.id)),
        children: initialChildren.filter(c => !hiddenFamilyIds.has(c.familyId) && !hiddenPersonIds.has(c.childId))
    };
  }, [collapsedIds, initialPeople, initialFamilies, initialChildren]);

  const performLayout = useCallback(async () => {
    setIsLoading(true);
    const { nodes: rawNodes, edges: rawEdges } = buildGraph(
      visibleData.people, 
      visibleData.families, 
      visibleData.children
    );

    const nodesWithData = rawNodes.map(node => {
        if (node.type === 'person') {
            const personId = node.data.id;
            // Only show hide/collapse for "Bloodline" members
            // Logic: 
            // 1. They are a child of someone in the tree
            const isChild = initialChildren.some(c => c.childId === personId);
            // 2. OR they are a "Root" (no parents) AND they are the primary partner (partner1) in their family
            // and their spouse is also not a child (to avoid in-laws who are partner1 getting it)
            const isRootPrimary = !isChild && initialFamilies.some(f => 
                f.partner1Id === personId && 
                (!f.partner2Id || !initialChildren.some(c => c.childId === f.partner2Id))
            );
            
            const isBloodline = isChild || isRootPrimary;
            
            const hasDescendants = isBloodline && initialFamilies.some(f => 
                (f.partner1Id === personId || f.partner2Id === personId) && 
                initialChildren.some(c => c.familyId === f.id)
            );

            return {
                ...node,
                data: {
                    ...node.data,
                    hasDescendants,
                    isCollapsed: collapsedIds.has(personId),
                    onToggleCollapse: toggleCollapse,
                    onAddSpouse,
                    onAddChild,
                    onDelete: async (id: string) => {
                      const p = initialPeople.find(x => x.id === id);
                      if (!p) return;
                      if (!confirm(`Hapus ${p.name} dari silsilah?`)) return;
                      const res = await deletePerson(id);
                      if (res.success) onRefresh?.();
                      else alert(res.error);
                    },
                    onEdit: (nodeData: any) => {
                      const person = initialPeople.find(p => p.id === nodeData.id);
                      if (person) onEdit?.(person);
                    },
                    isAdmin // Pass the role flag
                }
            };
        }
        return node;
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
      nodesWithData, 
      rawEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setIsLoading(false);
  }, [visibleData, initialPeople, initialFamilies, toggleCollapse, collapsedIds, onAddSpouse, onAddChild, onEdit, onRefresh, setNodes, setEdges]);

  useEffect(() => {
    performLayout();
  }, [performLayout]);

  return (
    <div className="h-[calc(100vh-84px)] w-full relative overflow-hidden transition-colors duration-500">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background 
            gap={40} 
            color={document.documentElement.getAttribute('data-theme') === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
            variant={BackgroundVariant.Dots} 
            className="transition-colors duration-500"
        />
        <Controls showInteractive={false} className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !fill-zinc-600 dark:!fill-zinc-400 !shadow-xl" />
        <MiniMap 
            zoomable 
            pannable 
            className="!rounded-2xl !bg-[var(--card)] !border-[var(--border)] !shadow-2xl overflow-hidden" 
            maskColor={document.documentElement.getAttribute('data-theme') === 'dark' ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)"}
            nodeColor={document.documentElement.getAttribute('data-theme') === 'dark' ? "#334155" : "#e2e8f0"}
            nodeStrokeColor="transparent"
            nodeBorderRadius={4}
        />
      </ReactFlow>

      <AnimatePresence>
        {isLoading && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] flex items-center justify-center bg-[#0c0a09]/60 backdrop-blur-md pointer-events-none"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-[0.3em]">Menata Ulang Silsilah...</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <PersonDetail 
        person={selectedPerson} 
        isAdmin={isAdmin}
        onEdit={(p) => {
          setSelectedPerson(null);
          onEdit?.(p);
        }}
        onClose={() => setSelectedPerson(null)} 
        onRefresh={() => {
            onRefresh?.();
            setSelectedPerson(null);
        }}
      />

      {/* Re-add Framer Motion for AnimatePresence */}
      <style jsx global>{`
        .react-flow__edge-path {
          stroke: #a1a1aa;
          stroke-width: 3;
          transition: all 0.3s ease;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #10b981 !important;
          stroke-width: 5 !important;
        }
        .react-flow__edge-marker path {
          fill: #a1a1aa;
        }
        .react-flow__edge:hover .react-flow__edge-marker path {
          fill: #10b981 !important;
        }
      `}</style>
    </div>
  );
}

// Missing imports fix
import { AnimatePresence, motion } from 'framer-motion';
