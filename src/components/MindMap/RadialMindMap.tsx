import React from 'react';
import { MindMapNode } from '../../types/mindmap';

interface RadialMindMapProps {
  nodes: MindMapNode[];
  onToggleExpand: (nodeId: string) => void;
  searchQuery?: string;
  highlightedNodes?: Set<string>;
}

interface PositionedNode extends MindMapNode {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export const RadialMindMap: React.FC<RadialMindMapProps> = ({
  nodes,
  onToggleExpand,
  searchQuery,
  highlightedNodes
}) => {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-lg font-medium">Enter some text to generate your mind map</p>
          <p className="text-sm mt-2">Use indentation or bullet points to create hierarchy</p>
        </div>
      </div>
    );
  }

  const calculateRadialPositions = (nodes: MindMapNode[]): PositionedNode[] => {
    const positioned: PositionedNode[] = [];
    const centerX = 400;
    const centerY = 300;
    const baseRadius = 120;
    const radiusIncrement = 100;

    const processNode = (
      node: MindMapNode, 
      level: number, 
      angle: number, 
      parentX: number = centerX, 
      parentY: number = centerY
    ) => {
      const radius = level === 0 ? 0 : baseRadius + (level - 1) * radiusIncrement;
      const x = level === 0 ? centerX : parentX + Math.cos(angle) * radius;
      const y = level === 0 ? centerY : parentY + Math.sin(angle) * radius;

      const positionedNode: PositionedNode = {
        ...node,
        x,
        y,
        angle,
        radius
      };

      positioned.push(positionedNode);

      if (node.children.length > 0 && node.isExpanded) {
        const angleStep = (2 * Math.PI) / Math.max(node.children.length, 1);
        const startAngle = level === 0 ? 0 : angle - (angleStep * (node.children.length - 1)) / 2;

        node.children.forEach((child, index) => {
          const childAngle = startAngle + index * angleStep;
          processNode(child, level + 1, childAngle, x, y);
        });
      }
    };

    // Process root nodes
    if (nodes.length === 1) {
      processNode(nodes[0], 0, 0);
    } else {
      const angleStep = (2 * Math.PI) / nodes.length;
      nodes.forEach((node, index) => {
        const angle = index * angleStep;
        processNode(node, 1, angle, centerX, centerY);
      });
    }

    return positioned;
  };

  const positionedNodes = calculateRadialPositions(nodes);
  
  const getNodeColor = (level: number) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-teal-500 text-white', 
      'bg-orange-500 text-white',
      'bg-purple-500 text-white',
      'bg-green-500 text-white',
      'bg-pink-500 text-white'
    ];
    return colors[level % colors.length];
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 text-gray-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Calculate SVG dimensions
  const minX = Math.min(...positionedNodes.map(n => n.x)) - 100;
  const maxX = Math.max(...positionedNodes.map(n => n.x)) + 100;
  const minY = Math.min(...positionedNodes.map(n => n.y)) - 100;
  const maxY = Math.max(...positionedNodes.map(n => n.y)) + 100;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div className="p-6 overflow-auto">
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <svg 
          width={width} 
          height={height} 
          className="absolute inset-0"
          style={{ transform: `translate(${-minX}px, ${-minY}px)` }}
        >
          {/* Draw connections */}
          {positionedNodes.map(node => 
            node.children
              .filter(child => node.isExpanded)
              .map(child => {
                const childNode = positionedNodes.find(p => p.id === child.id);
                if (!childNode) return null;
                
                return (
                  <line
                    key={`${node.id}-${child.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={childNode.x}
                    y2={childNode.y}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                );
              })
          )}
        </svg>

        {/* Render nodes */}
        {positionedNodes.map(node => (
          <div
            key={node.id}
            className={`
              absolute transform -translate-x-1/2 -translate-y-1/2 
              px-3 py-2 rounded-lg shadow-md cursor-pointer select-none
              transition-all duration-300 hover:shadow-lg hover:scale-105
              ${getNodeColor(node.level)}
              ${highlightedNodes?.has(node.id) ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
              ${node.children.length > 0 ? 'cursor-pointer' : ''}
            `}
            style={{
              left: `${node.x - minX}px`,
              top: `${node.y - minY}px`,
              minWidth: '80px',
              maxWidth: '200px'
            }}
            onClick={() => node.children.length > 0 && onToggleExpand(node.id)}
          >
            <div className="flex items-center gap-2">
              {node.children.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-white opacity-60">
                  {node.isExpanded ? '−' : '+'}
                </div>
              )}
              <span className="font-medium text-sm leading-tight text-center">
                {highlightText(node.label, searchQuery || '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};