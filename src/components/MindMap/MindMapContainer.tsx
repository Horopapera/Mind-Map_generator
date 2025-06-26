import React, { useState, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import { parseTextToMindMap, searchNodes, flattenNodes } from '../../lib/parser';
import { MindMapNode, ViewMode, LayoutType, VisualizationType } from '../../types/mindmap';
import { Controls } from './Controls';
import { TextInput } from './TextInput';
import { MindMapVisualization } from './MindMapVisualization';
import { MindMap3D } from './MindMap3D';

export const MindMapContainer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [layoutType, setLayoutType] = useState<LayoutType>('tree');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('2d');
  const mindMapRef = useRef<HTMLDivElement>(null);
  const [threejsRenderer, setThreejsRenderer] = useState<any>(null);
  
  // Parse text to mind map
  useEffect(() => {
    if (inputText.trim()) {
      const parsedNodes = parseTextToMindMap(inputText);
      setNodes(parsedNodes);
    } else {
      setNodes([]);
    }
  }, [inputText]);
  
  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const results = searchNodes(nodes, searchQuery);
    return new Set(results.map(node => node.id));
  }, [nodes, searchQuery]);
  
  const handleToggleExpand = (nodeId: string) => {
    const toggleNode = (nodeList: MindMapNode[]): MindMapNode[] => {
      return nodeList.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    
    setNodes(prevNodes => toggleNode(prevNodes));
  };
  
  const handleExport = () => {
    const dataStr = JSON.stringify(nodes, (key, value) => {
      if (key === 'parent') {
        return undefined;
      }
      return value;
    }, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };
  
  const handleReset = () => {
    setInputText('');
    setSearchQuery('');
    setNodes([]);
  };
  
  const nodeCount = flattenNodes(nodes).length;
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Controls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        onCopy={handleCopy}
        onReset={handleReset}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        layoutType={layoutType}
        onLayoutChange={setLayoutType}
        visualizationType={visualizationType}
        onVisualizationChange={setVisualizationType}
        nodeCount={nodeCount}
        nodes={nodes}
        inputText={inputText}
        mindMapRef={mindMapRef}
        threejsRenderer={threejsRenderer}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'split' || viewMode === 'input') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200 bg-white`}>
            <TextInput
              value={inputText}
              onChange={setInputText}
            />
          </div>
        )}
        
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div 
            ref={mindMapRef}
            className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-white overflow-auto`}
          >
            {visualizationType === '2d' ? (
              <MindMapVisualization
                nodes={nodes}
                onToggleExpand={handleToggleExpand}
                searchQuery={searchQuery}
                highlightedNodes={searchResults}
                layoutType={layoutType}
              />
            ) : (
              <MindMap3D
                nodes={nodes}
                onToggleExpand={handleToggleExpand}
                searchQuery={searchQuery}
                highlightedNodes={searchResults}
                onRendererReady={setThreejsRenderer}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};