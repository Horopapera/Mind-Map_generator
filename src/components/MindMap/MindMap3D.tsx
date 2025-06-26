'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { MindMapNode } from '../../types/mindmap';
import { Search, Home, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface MindMap3DProps {
  nodes: MindMapNode[];
  onToggleExpand: (nodeId: string) => void;
  searchQuery?: string;
  highlightedNodes?: Set<string>;
  onRendererReady?: (renderer: any) => void;
}

interface GraphNode {
  id: string;
  name: string;
  level: number;
  color: string;
  size: number;
  isHighlighted: boolean;
  originalNode: MindMapNode;
  childCount: number;
  isRoot: boolean;
  branchColor: string;
}

interface GraphLink {
  source: string;
  target: string;
  isHighlighted: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

type LayoutMode = 'force' | 'radial';

export const MindMap3D: React.FC<MindMap3DProps> = ({
  nodes,
  onToggleExpand,
  searchQuery,
  highlightedNodes,
  onRendererReady
}) => {
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<MindMapNode[]>([]);
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  // Expose renderer for export functionality
  useEffect(() => {
    if (fgRef.current && onRendererReady) {
      const renderer = fgRef.current.renderer();
      if (renderer) {
        onRendererReady(renderer);
      }
    }
  }, [onRendererReady]);

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

  // Monitor zoom level for performance optimization
  useEffect(() => {
    const checkZoomLevel = () => {
      if (fgRef.current) {
        const camera = fgRef.current.camera();
        const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        setIsZoomedOut(distance > 500);
      }
    };

    const interval = setInterval(checkZoomLevel, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get branch colors for first-level nodes
  const getBranchColors = useMemo(() => {
    // Sophisticated color palette with better contrast and visual appeal
    const branchColors = [
      { primary: '#3b82f6', secondary: '#1d4ed8', tertiary: '#93c5fd' }, // Blue family
      { primary: '#14b8a6', secondary: '#0f766e', tertiary: '#5eead4' }, // Teal family
      { primary: '#f97316', secondary: '#c2410c', tertiary: '#fed7aa' }, // Orange family
      { primary: '#a855f7', secondary: '#7c3aed', tertiary: '#c4b5fd' }, // Purple family
      { primary: '#22c55e', secondary: '#15803d', tertiary: '#86efac' }, // Green family
      { primary: '#ec4899', secondary: '#be185d', tertiary: '#f9a8d4' }, // Pink family
      { primary: '#8b5cf6', secondary: '#6d28d9', tertiary: '#c4b5fd' }, // Violet family
      { primary: '#06b6d4', secondary: '#0891b2', tertiary: '#67e8f9' }, // Cyan family
      { primary: '#84cc16', secondary: '#65a30d', tertiary: '#bef264' }, // Lime family
      { primary: '#f59e0b', secondary: '#d97706', tertiary: '#fcd34d' }, // Amber family
      { primary: '#ef4444', secondary: '#dc2626', tertiary: '#fca5a5' }, // Red family
      { primary: '#6366f1', secondary: '#4f46e5', tertiary: '#a5b4fc' }, // Indigo family
      { primary: '#10b981', secondary: '#059669', tertiary: '#6ee7b7' }, // Emerald family
      { primary: '#f472b6', secondary: '#e879f9', tertiary: '#f0abfc' }, // Fuchsia family
      { primary: '#06b6d4', secondary: '#0284c7', tertiary: '#7dd3fc' }, // Sky family
    ];
    
    const branchMap = new Map<string, string>();
    const levelColorMap = new Map<string, { level: number; branchIndex: number }>();
    
    nodes.forEach((rootNode, index) => {
      const branchIndex = index % branchColors.length;
      const assignBranchColor = (node: MindMapNode, level: number = 0) => {
        levelColorMap.set(node.id, { level, branchIndex });
        branchMap.set(node.id, branchColors[branchIndex].primary);
        node.children.forEach(child => assignBranchColor(child));
      };
      assignBranchColor(rootNode);
    });
    
    return { branchMap, levelColorMap, branchColors };
  }, [nodes]);

  // Find breadcrumb path to selected node
  const findBreadcrumbPath = useCallback((nodeId: string): MindMapNode[] => {
    const path: MindMapNode[] = [];
    
    const findPath = (nodeList: MindMapNode[], targetId: string): boolean => {
      for (const node of nodeList) {
        path.push(node);
        if (node.id === targetId) {
          return true;
        }
        if (node.children.length > 0 && findPath(node.children, targetId)) {
          return true;
        }
        path.pop();
      }
      return false;
    };
    
    findPath(nodes, nodeId);
    return path;
  }, [nodes]);

  // Update breadcrumbs when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setBreadcrumbs(findBreadcrumbPath(selectedNode));
    } else {
      setBreadcrumbs([]);
    }
  }, [selectedNode, findBreadcrumbPath]);

  // Convert tree structure to graph data
  const graphData = useMemo((): GraphData => {
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];

    const getNodeColor = (node: MindMapNode, isHighlighted: boolean, isSelected: boolean, isHovered: boolean) => {
      if (isSelected) return '#ff6b6b';
      if (isHovered) return '#ffd93d';
      if (isHighlighted) return '#ffd93d';
      
      const levelInfo = getBranchColors.levelColorMap.get(node.id);
      if (!levelInfo) return '#64748b';
      
      const colorFamily = getBranchColors.branchColors[levelInfo.branchIndex];
      
      // Use different shades based on level for visual hierarchy
      switch (levelInfo.level) {
        case 0: return colorFamily.primary;   // Root nodes - primary color
        case 1: return colorFamily.secondary; // First level - darker shade
        case 2: return colorFamily.tertiary;  // Second level - lighter shade
        default: 
          // For deeper levels, create a gradient effect
          const depth = Math.min(levelInfo.level - 2, 3);
          const opacity = Math.max(0.6 - (depth * 0.1), 0.3);
          return `${colorFamily.secondary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      }
    };

    const getNodeSize = (node: MindMapNode) => {
      const childCount = node.children.length;
      const baseSize = node.level === 0 ? 12 : 8;
      const childBonus = Math.min(childCount * 2, 8);
      const levelPenalty = Math.max(node.level * 1, 0);
      return Math.max(baseSize + childBonus - levelPenalty, 4);
    };

    const countAllChildren = (node: MindMapNode): number => {
      let count = node.children.length;
      node.children.forEach(child => {
        count += countAllChildren(child);
      });
      return count;
    };

    const processNode = (node: MindMapNode, parentId?: string) => {
      const isHighlighted = highlightedNodes?.has(node.id) || 
                           (searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase())) || false;
      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
      const childCount = countAllChildren(node);
      
      const graphNode: GraphNode = {
        id: node.id,
        name: node.label,
        level: node.level,
        color: getNodeColor(node, isHighlighted, isSelected, isHovered),
        size: getNodeSize(node),
        isHighlighted,
        originalNode: node,
        childCount,
        isRoot: node.level === 0,
        branchColor: getBranchColors.branchMap.get(node.id) || '#64748b'
      };

      graphNodes.push(graphNode);

      // Add link to parent
      if (parentId) {
        const isLinkHighlighted = isSelected || selectedNode === parentId;
        graphLinks.push({
          source: parentId,
          target: node.id,
          isHighlighted: isLinkHighlighted
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
  }, [nodes, highlightedNodes, selectedNode, hoveredNode, searchTerm, getBranchColors]);

  const handleNodeClick = useCallback((node: any) => {
    const graphNode = node as GraphNode;
    setSelectedNode(graphNode.id);
    
    // Center camera on clicked node with smooth animation
    if (fgRef.current) {
      const distance = 150;
      fgRef.current.cameraPosition(
        { 
          x: node.x + distance, 
          y: node.y + distance, 
          z: node.z + distance 
        },
        node,
        1500
      );
    }
  }, []);

  const handleNodeDoubleClick = useCallback((node: any) => {
    const graphNode = node as GraphNode;
    if (graphNode.originalNode.children.length > 0) {
      onToggleExpand(graphNode.id);
    }
  }, [onToggleExpand]);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node ? node.id : null);
  }, []);

  const handleSearch = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    setSearchTerm('');
    
    // Find the node in graph data and center on it
    const targetNode = graphData.nodes.find(n => n.id === nodeId);
    if (targetNode && fgRef.current) {
      // Simulate node position for centering
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.cameraPosition(
            { x: 100, y: 100, z: 100 },
            { x: 0, y: 0, z: 0 },
            1500
          );
        }
      }, 100);
    }
  }, [graphData.nodes]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return graphData.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [graphData.nodes, searchTerm]);

  const resetView = useCallback(() => {
    setSelectedNode(null);
    setSearchTerm('');
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000);
    }
  }, []);

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
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Search */}
        <div className="relative">
          <div className="flex items-center bg-black bg-opacity-70 rounded-lg">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-transparent text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-black bg-opacity-90 border border-gray-600 rounded-lg max-h-48 overflow-y-auto z-20">
              {searchResults.map(node => (
                <button
                  key={node.id}
                  onClick={() => handleSearch(node.id)}
                  className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                >
                  <div className="truncate">{node.name}</div>
                  <div className="text-xs text-gray-400">Level {node.level} • {node.childCount} children</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layout and View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black bg-opacity-70 rounded-lg p-1">
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                layoutMode === 'force' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Force
            </button>
            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                layoutMode === 'radial' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Radial
            </button>
          </div>
          
          <button
            onClick={resetView}
            className="p-2 bg-black bg-opacity-70 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="Reset View"
          >
            <Home size={16} />
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="absolute top-16 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg max-w-md">
          <div className="flex items-center gap-1 text-sm">
            <Home size={12} />
            {breadcrumbs.map((node, index) => (
              <React.Fragment key={node.id}>
                {index > 0 && <ChevronRight size={12} className="text-gray-400" />}
                <button
                  onClick={() => handleSearch(node.id)}
                  className="hover:text-blue-400 transition-colors truncate max-w-24"
                  title={node.label}
                >
                  {node.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Node Info Panel */}
      {(selectedNode || hoveredNode) && (
        <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-xs">
          {(() => {
            const node = graphData.nodes.find(n => n.id === (selectedNode || hoveredNode));
            if (!node) return null;
            
            return (
              <div>
                <div className="font-medium text-lg mb-2 break-words">{node.name}</div>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>Level: {node.level}</div>
                  <div>Children: {node.originalNode.children.length}</div>
                  <div>Total descendants: {node.childCount}</div>
                  {node.isRoot && <div className="text-yellow-400">Root Node</div>}
                </div>
                {selectedNode === node.id && (
                  <div className="mt-3 text-xs text-gray-400">
                    Click: Select • Double-click: Expand/Collapse
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div>📍 Nodes: {graphData.nodes.length}</div>
          <div>🔗 Links: {graphData.links.length}</div>
          <div>🎯 Layout: {layoutMode}</div>
          {isZoomedOut && <div className="text-yellow-400">⚡ Performance mode</div>}
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div>🖱️ Click: Select node</div>
          <div>🖱️ Double-click: Expand/Collapse</div>
          <div>🔄 Drag: Rotate view</div>
          <div>🔍 Scroll: Zoom</div>
        </div>
      </div>

      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => {
          const graphNode = node as GraphNode;
          return `<div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; max-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${graphNode.name}</div>
            <div style="font-size: 12px; color: #ccc;">
              Level: ${graphNode.level}<br/>
              Children: ${graphNode.originalNode.children.length}<br/>
              Total descendants: ${graphNode.childCount}
            </div>
          </div>`;
        }}
        nodeColor={(node: any) => (node as GraphNode).color}
        nodeVal={(node: any) => {
          const graphNode = node as GraphNode;
          return isZoomedOut && !graphNode.isRoot ? Math.max(graphNode.size * 0.5, 2) : graphNode.size;
        }}
        linkColor={(link: any) => (link as GraphLink).isHighlighted ? '#ffd93d' : '#64748b'}
        linkColor={(link: any) => {
          if ((link as GraphLink).isHighlighted) return '#ffd93d';
          
          // Use branch color for links to create visual continuity
          const sourceNode = graphData.nodes.find(n => n.id === link.source);
          if (sourceNode) {
            const levelInfo = getBranchColors.levelColorMap.get(sourceNode.id);
            if (levelInfo) {
              const colorFamily = getBranchColors.branchColors[levelInfo.branchIndex];
              return colorFamily.tertiary;
            }
          }
          return '#64748b';
        }}
        linkWidth={(link: any) => (link as GraphLink).isHighlighted ? 4 : 2}
        linkOpacity={(link: any) => (link as GraphLink).isHighlighted ? 1 : 0.6}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeDoubleClick}
        onNodeHover={handleNodeHover}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        controlType="orbit"
        enableNodeDrag={true}
        enableNavigationControls={true}
        nodeThreeObject={(node: any) => {
          const graphNode = node as GraphNode;
          
          // Create main sphere with glow effect
          const geometry = new THREE.SphereGeometry(graphNode.size);
          const material = new THREE.MeshLambertMaterial({ 
            color: graphNode.color,
            transparent: true,
            opacity: graphNode.isHighlighted || selectedNode === graphNode.id ? 1 : 0.8
          });
          const sphere = new THREE.Mesh(geometry, material);

          // Add glow effect for selected/hovered nodes
          if (selectedNode === graphNode.id || hoveredNode === graphNode.id) {
            const glowGeometry = new THREE.SphereGeometry(graphNode.size * 1.5);
            
            // Use complementary color for glow effect
            let glowColor = graphNode.color;
            const levelInfo = getBranchColors.levelColorMap.get(graphNode.id);
            if (levelInfo) {
              const colorFamily = getBranchColors.branchColors[levelInfo.branchIndex];
              glowColor = selectedNode === graphNode.id ? colorFamily.tertiary : colorFamily.secondary;
            }
            
            const glowMaterial = new THREE.MeshBasicMaterial({
              color: glowColor,
              transparent: true,
              opacity: selectedNode === graphNode.id ? 0.4 : 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            sphere.add(glow);
            
            // Add pulsing animation for selected node
            if (selectedNode === graphNode.id) {
              const pulseGlow = new THREE.Mesh(
                new THREE.SphereGeometry(graphNode.size * 2),
                new THREE.MeshBasicMaterial({
                  color: glowColor,
                  transparent: true,
                  opacity: 0.1
                })
              );
              sphere.add(pulseGlow);
            }
          }

          // Add text label for root nodes or selected node
          if (graphNode.isRoot || selectedNode === graphNode.id || (!isZoomedOut && graphNode.level <= 2)) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = 512;
              canvas.height = 128;
              
              // Background
              const levelInfo = getBranchColors.levelColorMap.get(graphNode.id);
              let bgColor = 'rgba(0, 0, 0, 0.8)';
              let textColor = 'white';
              
              if (levelInfo && graphNode.isRoot) {
                const colorFamily = getBranchColors.branchColors[levelInfo.branchIndex];
                bgColor = `${colorFamily.primary}dd`; // Add transparency
                textColor = 'white';
              }
              
              context.fillStyle = bgColor;
              context.fillRect(0, 0, canvas.width, canvas.height);
              
              // Text
              context.fillStyle = textColor;
              context.font = `${graphNode.isRoot ? '24' : '18'}px Arial`;
              context.textAlign = 'center';
              context.textBaseline = 'middle';
              
              const maxWidth = canvas.width - 20;
              const text = graphNode.name.length > 30 ? graphNode.name.substring(0, 30) + '...' : graphNode.name;
              context.fillText(text, canvas.width / 2, canvas.height / 2);

              const texture = new THREE.CanvasTexture(canvas);
              const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                opacity: isZoomedOut && !graphNode.isRoot ? 0.7 : 1
              });
              const sprite = new THREE.Sprite(spriteMaterial);
              
              const scale = graphNode.isRoot ? 40 : 30;
              sprite.scale.set(scale, scale * 0.25, 1);
              sprite.position.set(0, graphNode.size + 15, 0);
              
              const group = new THREE.Group();
              group.add(sphere);
              group.add(sprite);
              return group;
            }
          }

          return sphere;
        }}
        d3AlphaDecay={layoutMode === 'radial' ? 0.05 : 0.01}
        d3VelocityDecay={layoutMode === 'radial' ? 0.15 : 0.08}
        d3Force={layoutMode === 'radial' ? 'radial' : undefined}
        d3AlphaMin={0.001}
        d3ReheatSimulation={false}
        warmupTicks={100}
        cooldownTicks={200}
        onEngineStop={() => {
          // Ensure simulation stops completely to prevent bounce
          if (fgRef.current) {
            const simulation = fgRef.current.d3Force('simulation');
            if (simulation) {
              simulation.alpha(0);
            }
          }
        }}
      />
    </div>
  );
};