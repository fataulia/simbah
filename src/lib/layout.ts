import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

const PERSON_WIDTH = 120;
const PERSON_HEIGHT = 160;
const UNION_WIDTH = 40;
const UNION_HEIGHT = 40;

// Vertical distance between generations
const GENERATION_GAP = 250; 

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const g = new dagre.graphlib.Graph();
  
  // We use nodesep to keep siblings apart horizontally
  g.setGraph({ 
    rankdir: direction, 
    nodesep: 100,
    ranksep: 100, // Dagre's ranksep will handle the initial ranking
  });
  
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const width = node.type === 'union' ? UNION_WIDTH : PERSON_WIDTH;
    const height = node.type === 'union' ? UNION_HEIGHT : PERSON_HEIGHT;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    const width = node.type === 'union' ? UNION_WIDTH : PERSON_WIDTH;
    const height = node.type === 'union' ? UNION_HEIGHT : PERSON_HEIGHT;
    
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    // FORCED Y POSITION based on generation to ensure alignment
    // Person nodes use their generation. 
    // Union nodes should be slightly below the parents.
    let forcedY = (nodeWithPosition.y); // Default from dagre

    if (node.type === 'person') {
       const gen = node.data.generation || 1;
       forcedY = (gen - 1) * GENERATION_GAP;
    } else if (node.type === 'union') {
       // Union nodes are usually between parents and children
       // We'll place them slightly lower than the parents' generation
       const gen = node.data.generation || 1;
       forcedY = (gen - 1) * GENERATION_GAP + 80; 
    }

    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: forcedY,
    };
  });

  return { nodes, edges };
};
