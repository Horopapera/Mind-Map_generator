import React from 'react';
import { MindMapNode } from '../../types/mindmap';
import { MindMapNodeComponent } from './MindMapNode';
import { RadialMindMap } from './RadialMindMap';

interface MindMapVisualizationProps {
  nodes: MindMapNode[];
  onToggleExpand: (nodeId: string) => void;
  searchQuery?: string;
  highlightedNodes?: Set<string>;
  layoutType?: 'tree' | 'radial';
}

export const MindMapVisualization: React.FC<MindMapVisualizationProps> = ({
  nodes,
  onToggleExpand,
  searchQuery,
  highlightedNodes,
  layoutType = 'tree'
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
  
  if (layoutType === 'radial') {
    return (
      <RadialMindMap
        nodes={nodes}
        onToggleExpand={onToggleExpand}
        searchQuery={searchQuery}
        highlightedNodes={highlightedNodes}
      />
    );
  }
  
  return (
    <div className="p-6 space-y-4">
      {nodes.map((node) => (
        <MindMapNodeComponent
          key={node.id}
          node={node}
          onToggleExpand={onToggleExpand}
          searchQuery={searchQuery}
          isHighlighted={highlightedNodes?.has(node.id)}
        />
      ))}
    </div>
  );
};