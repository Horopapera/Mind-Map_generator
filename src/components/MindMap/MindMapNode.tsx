import React from 'react';
import { ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { MindMapNode } from '../../types/mindmap';

interface MindMapNodeProps {
  node: MindMapNode;
  onToggleExpand: (nodeId: string) => void;
  searchQuery?: string;
  isHighlighted?: boolean;
}

export const MindMapNodeComponent: React.FC<MindMapNodeProps> = ({
  node,
  onToggleExpand,
  searchQuery,
  isHighlighted
}) => {
  const hasChildren = node.children.length > 0;
  
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
  
  return (
    <div className="relative">
      <div 
        className={`
          flex items-center gap-2 p-3 rounded-lg shadow-md transition-all duration-200
          hover:shadow-lg hover:scale-105 cursor-pointer select-none
          ${getNodeColor(node.level)}
          ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
        `}
        onClick={() => hasChildren && onToggleExpand(node.id)}
      >
        {hasChildren ? (
          node.isExpanded ? (
            <ChevronDown size={16} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="flex-shrink-0" />
          )
        ) : (
          <Circle size={8} className="flex-shrink-0 opacity-60" />
        )}
        
        <span className="font-medium text-sm leading-tight">
          {highlightText(node.label, searchQuery || '')}
        </span>
      </div>
      
      {hasChildren && node.isExpanded && (
        <div className="ml-6 mt-3 space-y-2 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
          {node.children.map((child, index) => (
            <div key={child.id} className="relative pl-4">
              <div className="absolute left-0 top-4 w-3 h-px bg-gray-300"></div>
              <MindMapNodeComponent
                node={child}
                onToggleExpand={onToggleExpand}
                searchQuery={searchQuery}
                isHighlighted={isHighlighted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};