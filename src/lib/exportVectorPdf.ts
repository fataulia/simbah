import { jsPDF } from 'jspdf';
import { Node, Edge } from 'reactflow';

// Helper to load image as base64 so jsPDF can embed it
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw round crop
        ctx.beginPath();
        ctx.arc(img.width / 2, img.height / 2, Math.min(img.width, img.height) / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
};

export async function exportToVectorPDF(nodes: Node[], edges: Edge[]) {
  if (nodes.length === 0) return;

  // 1. Calculate boundaries
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    const w = node.width || 200;
    const h = node.height || 150;
    if (node.position.x < minX) minX = node.position.x;
    if (node.position.y < minY) minY = node.position.y;
    if (node.position.x + w > maxX) maxX = node.position.x + w;
    if (node.position.y + h > maxY) maxY = node.position.y + h;
  });

  const padding = 150;
  const width = Math.max(maxX - minX + padding * 2, 800);
  const height = Math.max(maxY - minY + padding * 2, 600);

  // 2. Initialize jsPDF
  const doc = new (jsPDF as any)({
    orientation: width > height ? 'l' : 'p',
    unit: 'px',
    format: [width, height],
  });

  // Background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(0, 0, width, height, 'F');

  // Title
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.text("Silsilah Keluarga", padding, 60);

  // Helper coordinate mapper
  const mapX = (x: number) => x - minX + padding;
  const mapY = (y: number) => y - minY + padding;

  // 3. Draw Edges
  doc.setDrawColor(161, 161, 170); // zinc-400
  doc.setLineWidth(3);

  // Collect the exact SVG paths from the rendered DOM for perfect curves!
  // This is a brilliant hack: read the DOM of react-flow to get bezier curves.
  const edgePaths = document.querySelectorAll('.react-flow__edge-path');
  const pathMap = new Map();
  edgePaths.forEach((pathNode) => {
    const parentId = pathNode.closest('.react-flow__edge')?.getAttribute('data-id');
    const d = pathNode.getAttribute('d');
    if (parentId && d) {
      pathMap.set(parentId, d);
    }
  });

  // Parse and draw simple SVG 'd' paths in jsPDF
  // jsPDF supports lines. For cubic beziers (C), we approximate with straight lines or just connect centers if DOM not available.
  const drawStepLine = (x1: number, y1: number, x2: number, y2: number) => {
    // Step path (used in react flow for simple structures)
    const midY = (y1 + y2) / 2;
    doc.lines([[0,0], [0, midY - y1], [x2 - x1, 0], [0, y2 - midY]], mapX(x1), mapY(y1));
  };

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceW = sourceNode.width || (sourceNode.type === 'family' ? 30 : 200);
    const sourceH = sourceNode.height || (sourceNode.type === 'family' ? 30 : 150);
    const targetW = targetNode.width || (targetNode.type === 'family' ? 30 : 200);
    // const targetH = targetNode.height || (targetNode.type === 'family' ? 30 : 150);

    const sX = sourceNode.position.x + sourceW / 2;
    let sY = sourceNode.position.y + sourceH;

    const tX = targetNode.position.x + targetW / 2;
    const tY = targetNode.position.y;

    if (sourceNode.type === 'person' && targetNode.type === 'family') {
        // Connect spouse to family node (horizontal-ish)
        sY = sourceNode.position.y + sourceH / 2;
        doc.setLineWidth(3);
        doc.setDrawColor(161, 161, 170);
        // Draw direct line
        doc.line(mapX(sX), mapY(sY), mapX(tX), mapY(tY + 15));
    } else {
        // Connect family to child (step line down)
        doc.setLineWidth(3);
        doc.setDrawColor(161, 161, 170);
        drawStepLine(sX, sY, tX, tY);
    }
  });

  // 4. Draw Nodes
  // Sort so persons are on top of families
  const sortedNodes = [...nodes].sort((a,b) => a.type === 'person' ? 1 : -1);

  for (const node of sortedNodes) {
    const x = mapX(node.position.x);
    const y = mapY(node.position.y);
    const w = node.width || 200;
    // const h = node.height || 150;

    if (node.type === 'family') {
      const isMarriage = node.data.partner1Id && node.data.partner2Id;
      doc.setFillColor(isMarriage ? 244 : 228, isMarriage ? 63 : 84, isMarriage ? 94 : 210); // pink/emerald
      doc.circle(x + 15, y + 15, 12, 'F');
      
      // Heart icon or plus
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(isMarriage ? "M" : "+", x + 15, y + 19, { align: 'center' });
    } 
    else if (node.type === 'person') {
      const data = node.data;
      const isDeceased = !!data.isDeceased;
      const gender = data.gender;
      
      const centerX = x + w / 2;

      // Photo circle
      const r = 35; // radius
      const cy = y + 45;

      // Border
      if (isDeceased) doc.setDrawColor(231, 229, 228);
      else if (gender === 'MALE') doc.setDrawColor(14, 165, 233);
      else doc.setDrawColor(236, 72, 153);
      
      doc.setLineWidth(4);
      doc.setFillColor(255, 255, 255);
      doc.circle(centerX, cy, r, 'FD');

      if (data.photoUrl) {
          const imgData = await loadImage(data.photoUrl);
          if (imgData) {
             // Add image into circle area. 
             // jsPDF doesn't natively clip images to circle easily unless we clip the context.
             // We cropped it in our loadImage helper using canvas!
             doc.addImage(imgData, 'PNG', centerX - r, cy - r, r*2, r*2);
          }
      } else {
          // Placeholder initials
          doc.setTextColor(isDeceased ? 214 : 148, isDeceased ? 211 : 163, isDeceased ? 209 : 184); // light gray text
          doc.setFontSize(24);
          doc.setFont("helvetica", "bold");
          const init = data.name.substring(0, 2).toUpperCase();
          doc.text(init, centerX, cy + 8, { align: 'center' });
      }

      // Deceased tag
      if (isDeceased && data.deathYear) {
           doc.setFillColor(41, 37, 36);
           doc.roundedRect(centerX + 15, cy - 35, 30, 14, 7, 7, 'F');
           doc.setTextColor(255, 255, 255);
           doc.setFontSize(8);
           doc.text(String(data.deathYear), centerX + 30, cy - 26, { align: 'center' });
      }

      // Name label
      const nameWidth = 160;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(1);
      doc.roundedRect(centerX - nameWidth/2, y + 90, nameWidth, 26, 13, 13, 'FD');

      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(10);
      doc.setFont("helvetica", isDeceased ? "italic" : "bold");
      
      let displayName = data.name;
      if (displayName.length > 22) displayName = displayName.substring(0, 20) + "...";
      
      if (isDeceased) doc.setTextColor(100, 116, 139); // slate-500
      
      doc.text(displayName, centerX, y + 106, { align: 'center' });
    }
  }

  // 5. Save the PDF
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`Silsilah_Simbah_${dateStr}.pdf`);
}
