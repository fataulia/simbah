import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';

const elk = new ELK();

// DIMENSIONS
const PERSON_WIDTH = 130;
const PERSON_HEIGHT = 90;
const FAMILY_SIZE = 30;

export async function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const elkNodes: any[] = [];
  const elkEdges: any[] = [];

  // Calculate layout using ELK's Layered algorithm
  nodes.forEach((node) => {
    const isFamily = node.type === 'family';
    elkNodes.push({
      id: node.id,
      width: isFamily ? FAMILY_SIZE : PERSON_WIDTH,
      height: isFamily ? FAMILY_SIZE : PERSON_HEIGHT,
      layoutOptions: {
        // Higher priority for marriage partners to stay together
        'elk.priority': node.type === 'person' ? '10' : '1',
      }
    });
  });

  edges.forEach((edge) => {
    const isMarriage = edge.id.includes('e-p1') || edge.id.includes('e-p2');
    elkEdges.push({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      layoutOptions: {
        // EXTREME priority for marriage edges
        'elk.layered.priority': isMarriage ? '500' : '1',
        'elk.weight': isMarriage ? '100' : '1',
      }
    });
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.spacing.edgeNode': '40',
      'elk.spacing.edgeEdge': '20',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.nodePlacement.favorStraightEdges': 'true',

      // CRITICAL: Respect the order we defined in graphBuilder (Partner-Family-Partner)
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.crossingMinimization.semiInteractive': 'true',

      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
      'elk.separateConnectedComponents': 'false'
    },
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    const layoutedNodes = nodes.map((node) => {
      const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
      if (elkNode) {
        node.position = { x: elkNode.x || 0, y: elkNode.y || 0 };
      }
      return node;
    });
    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('ELK Layout Error:', error);
    return { nodes, edges };
  }
}
