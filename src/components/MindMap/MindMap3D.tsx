'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { MindMapNode } from '../../types/mindmap';

interface MindMap3DProps {
  nodes: MindMapNode[];
  onToggleExpand: (nodeId: string) => void;
  searchQuery?: string;
  highlightedNodes?: Set<string>;
}

interface GraphNode {
  id: string;
  name: string;
  level: number;
  color: string;
  size: number;
  isHighlighted: boolean;
  originalNode: MindMapNode;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const MindMap3D: React.FC<MindMap3DProps> = ({
  nodes,
  onToggleExpand,
  searchQuery,
  highlightedNodes
}) => {
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = fgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(600, container.clientHeight)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convert tree structure to graph data
  const graphData = useMemo((): GraphData => {
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];

    const getNodeColor = (level: number, isHighlighted: boolean, isSelected: boolean) => {
      if (isSelected) return '#ff6b6b';
      if (isHighlighted) return '#ffd93d';
      
      const colors = [
        '#3b82f6', // blue
        '#14b8a6', // teal
        '#f97316', // orange
        '#a855f7', // purple
        '#22c55e', // green
        '#ec4899'  // pink
      ];
      return colors[level % colors.length];
    };

    const getNodeSize = (level: number, hasChildren: boolean) => {
      const baseSize = hasChildren ? 8 : 5;
      return Math.max(baseSize - level * 1, 3);
    };

    const processNode = (node: MindMapNode, parentId?: string) => {
      const isHighlighted = highlightedNodes?.has(node.id) || false;
      const isSelected = selectedNode === node.id;
      
      const graphNode: GraphNode = {
        id: node.id,
        name: node.label,
        level: node.level,
        color: getNodeColor(node.level, isHighlighted, isSelected),
        size: getNodeSize(node.level, node.children.length > 0),
        isHighlighted,
        originalNode: node
      };

      graphNodes.push(graphNode);

      // Add link to parent
      if (parentId) {
        graphLinks.push({
          source: parentId,
          target: node.id
        });
      }

      // Process children if expanded
      if (node.isExpanded && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, node.id);
        });
      }
    };

    // Process all root nodes
    nodes.forEach(rootNode => {
      processNode(rootNode);
    });

    return { nodes: graphNodes, links: graphLinks };
  }, [nodes, highlightedNodes, selectedNode]);

  const handleNodeClick = (node: any) => {
    const graphNode = node as GraphNode;
    setSelectedNode(graphNode.id);
    
    // Toggle expand if node has children
    if (graphNode.originalNode.children.length > 0) {
      onToggleExpand(graphNode.id);
    }

    // Center camera on clicked node
    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: node.x + 100, y: node.y + 100, z: node.z + 100 },
        node,
        1000
      );
    }
  };

  const handleNodeHover = (node: any) => {
    if (fgRef.current) {
      fgRef.current.nodeLabel(node ? `${node.name}` : '');
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    return text.toLowerCase().includes(query.toLowerCase()) ? `🔍 ${text}` : text;
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🌐</div>
          <p className="text-lg font-medium">Enter some text to generate your 3D mind map</p>
          <p className="text-sm mt-2">Use indentation or bullet points to create hierarchy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div>🖱️ Click: Select/Expand nodes</div>
          <div>🔄 Drag: Rotate view</div>
          <div>🔍 Scroll: Zoom in/out</div>
          <div>📍 Nodes: {graphData.nodes.length}</div>
          {selectedNode && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-yellow-300">Selected:</div>
              <div className="truncate max-w-48">
                {graphData.nodes.find(n => n.id === selectedNode)?.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search indicator */}
      {searchQuery && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black p-2 rounded-lg text-sm font-medium">
          🔍 Searching: "{searchQuery}"
        </div>
      )}

      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => {
          const graphNode = node as GraphNode;
          return highlightText(graphNode.name, searchQuery || '');
        }}
        nodeColor={(node: any) => (node as GraphNode).color}
        nodeVal={(node: any) => (node as GraphNode).size}
        linkColor={() => '#64748b'}
        linkWidth={2}
        linkOpacity={0.6}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        controlType="orbit"
        enableNodeDrag={true}
        enableNavigationControls={true}
        nodeThreeObject={(node: any) => {
          const graphNode = node as GraphNode;
          
          // Create a sphere geometry for the node
          const geometry = new (window as any).THREE.SphereGeometry(graphNode.size);
          const material = new (window as any).THREE.MeshLambertMaterial({ 
            color: graphNode.color,
            transparent: true,
            opacity: graphNode.isHighlighted ? 1 : 0.8
          });
          const sphere = new (window as any).THREE.Mesh(geometry, material);

          // Add text label
          if (typeof (window as any).THREE !== 'undefined') {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = 256;
              canvas.height = 64;
              context.fillStyle = 'white';
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.fillStyle = 'black';
              context.font = '16px Arial';
              context.textAlign = 'center';
              context.fillText(
                graphNode.name.length > 20 ? graphNode.name.substring(0, 20) + '...' : graphNode.name,
                canvas.width / 2,
                canvas.height / 2 + 6
              );

              const texture = new (window as any).THREE.CanvasTexture(canvas);
              const spriteMaterial = new (window as any).THREE.SpriteMaterial({ map: texture });
              const sprite = new (window as any).THREE.Sprite(spriteMaterial);
              sprite.scale.set(20, 5, 1);
              sprite.position.set(0, graphNode.size + 8, 0);
              
              const group = new (window as any).THREE.Group();
              group.add(sphere);
              group.add(sprite);
              return group;
            }
          }

          return sphere;
        }}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.08}
        warmupTicks={100}
        cooldownTicks={200}
      />
    </div>
  );
};