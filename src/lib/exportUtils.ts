import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import { MindMapNode } from '../types/mindmap';

export interface ExportOptions {
  filename?: string;
  format?: 'png' | 'svg' | 'json' | 'html';
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * Generate a timestamped filename
 */
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}-${timestamp}.${extension}`;
};

/**
 * Export mind map as PNG using html2canvas
 */
export const exportToPNG = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap', 'png');
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      width: options.width,
      height: options.height,
      logging: false
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
        showSuccessMessage(`PNG exported as ${filename}`);
      }
    }, 'image/png', options.quality || 0.9);
  } catch (error) {
    console.error('PNG export failed:', error);
    showErrorMessage('Failed to export PNG. Please try again.');
  }
};

/**
 * Export mind map as SVG using dom-to-image
 */
export const exportToSVG = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap', 'svg');
    
    const svgDataUrl = await domtoimage.toSvg(element, {
      backgroundColor: '#ffffff',
      width: options.width,
      height: options.height,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });

    // Convert data URL to blob
    const response = await fetch(svgDataUrl);
    const blob = await response.blob();
    
    saveAs(blob, filename);
    showSuccessMessage(`SVG exported as ${filename}`);
  } catch (error) {
    console.error('SVG export failed:', error);
    showErrorMessage('Failed to export SVG. Please try again.');
  }
};

/**
 * Export 3D mind map as PNG using Three.js renderer
 */
export const export3DToPNG = async (
  renderer: any,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap-3d', 'png');
    
    // Get the canvas from the Three.js renderer
    const canvas = renderer.domElement;
    
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        saveAs(blob, filename);
        showSuccessMessage(`3D PNG exported as ${filename}`);
      }
    }, 'image/png', options.quality || 0.9);
  } catch (error) {
    console.error('3D PNG export failed:', error);
    showErrorMessage('Failed to export 3D PNG. Please try again.');
  }
};

/**
 * Export mind map data as JSON
 */
export const exportToJSON = (
  nodes: MindMapNode[],
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename || generateFilename('mindmap', 'json');
    
    const dataStr = JSON.stringify(nodes, (key, value) => {
      // Exclude parent references to avoid circular dependencies
      if (key === 'parent') {
        return undefined;
      }
      return value;
    }, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    saveAs(dataBlob, filename);
    showSuccessMessage(`JSON exported as ${filename}`);
  } catch (error) {
    console.error('JSON export failed:', error);
    showErrorMessage('Failed to export JSON. Please try again.');
  }
};

/**
 * Generate standalone interactive HTML file
 */
export const exportToInteractiveHTML = (
  nodes: MindMapNode[],
  inputText: string,
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename || generateFilename('mindmap-interactive', 'html');
    
    const htmlContent = generateStandaloneHTML(nodes, inputText);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    saveAs(htmlBlob, filename);
    showSuccessMessage(`Interactive HTML exported as ${filename}`);
  } catch (error) {
    console.error('Interactive HTML export failed:', error);
    showErrorMessage('Failed to export interactive HTML. Please try again.');
  }
};

/**
 * Generate standalone HTML with embedded mind map
 */
const generateStandaloneHTML = (nodes: MindMapNode[], inputText: string): string => {
  const nodesJson = JSON.stringify(nodes, (key, value) => {
    if (key === 'parent') return undefined;
    return value;
  });

  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nodeCount = nodes.reduce((count, node) => {
    const countChildren = (n: MindMapNode): number => {
      return 1 + n.children.reduce((sum, child) => sum + countChildren(child), 0);
    };
    return count + countChildren(node);
  }, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Map Viewer - ${exportDate}</title>
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/force-graph@1.43.0/dist/force-graph.min.js"></script>
    <script src="https://unpkg.com/3d-force-graph@1.70.0/dist/3d-force-graph.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
            min-height: 100vh;
            overflow: hidden;
            color: #1f2937;
        }
        
        .container {
            width: 100vw;
            height: 100vh;
            background: white;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 16px 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            position: relative;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header-title {
            display: flex;
            flex-direction: column;
        }
        
        .header-title h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(45deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-subtitle {
            font-size: 0.875rem;
            opacity: 0.8;
            font-weight: 400;
        }
        
        .header-stats {
            display: flex;
            gap: 24px;
            font-size: 0.875rem;
            opacity: 0.9;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .controls-bar {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            z-index: 999;
        }
        
        .view-switcher {
            display: flex;
            background: white;
            border-radius: 8px;
            padding: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .view-btn {
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .view-btn:hover {
            color: #3b82f6;
            background: #f1f5f9;
        }
        
        .view-btn.active {
            background: #3b82f6;
            color: white;
            box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
        }
        
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-input {
            width: 280px;
            padding: 8px 12px 8px 36px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
            background: white;
            transition: all 0.2s ease;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 12px;
            color: #9ca3af;
            pointer-events: none;
        }
        
        .action-buttons {
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .action-btn:hover {
            background: #f9fafb;
            border-color: #9ca3af;
        }
        
        .mindmap-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #ffffff;
        }
        
        .mindmap-2d {
            width: 100%;
            height: 100%;
            overflow: auto;
            padding: 24px;
        }
        
        .mindmap-3d {
            width: 100%;
            height: 100%;
            background: #0f172a;
            position: relative;
        }
        
        .tree-view {
            padding: 24px;
            overflow: auto;
        }
        
        .node {
            margin-bottom: 16px;
            position: relative;
        }
        
        .node-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
            font-size: 0.875rem;
            border: 2px solid transparent;
        }
        
        .node-content:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-color: rgba(255,255,255,0.3);
        }
        
        .node-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .children {
            margin-left: 32px;
            margin-top: 12px;
            position: relative;
        }
        
        .children::before {
            content: '';
            position: absolute;
            left: -16px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #e2e8f0, transparent);
            border-radius: 1px;
        }
        
        .child-connector {
            position: relative;
        }
        
        .child-connector::before {
            content: '';
            position: absolute;
            left: -16px;
            top: 24px;
            width: 16px;
            height: 2px;
            background: #e2e8f0;
            border-radius: 1px;
        }
        
        /* Enhanced color scheme for different levels */
        .level-0 { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .level-1 { 
            background: linear-gradient(135deg, #14b8a6, #0f766e); 
            color: white; 
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        .level-2 { 
            background: linear-gradient(135deg, #f97316, #c2410c); 
            color: white; 
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
        .level-3 { 
            background: linear-gradient(135deg, #a855f7, #7c3aed); 
            color: white; 
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
        .level-4 { 
            background: linear-gradient(135deg, #22c55e, #15803d); 
            color: white; 
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .level-5 { 
            background: linear-gradient(135deg, #ec4899, #be185d); 
            color: white; 
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        
        .radial-container {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            background: radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 12px 24px;
            text-align: center;
            font-size: 0.75rem;
            color: #64748b;
        }
        
        .footer a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .hidden {
            display: none;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            flex-direction: column;
            gap: 16px;
            color: #64748b;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #d1d5db;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
        }
        
        .search-result {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
            font-size: 0.875rem;
        }
        
        .search-result:hover {
            background: #f9fafb;
        }
        
        .search-result:last-child {
            border-bottom: none;
        }
        
        .highlighted {
            background: #fef3c7 !important;
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
        }
        
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }
            
            .header-stats {
                gap: 16px;
            }
            
            .controls-bar {
                flex-direction: column;
                align-items: stretch;
                gap: 12px;
            }
            
            .search-input {
                width: 100%;
            }
            
            .view-switcher {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="header-title">
                    <h1>🧠 Mind Map Viewer</h1>
                    <div class="header-subtitle">Exported on ${exportDate}</div>
                </div>
                <div class="header-stats">
                    <div class="stat-item">
                        <span>📊</span>
                        <span>${nodeCount} nodes</span>
                    </div>
                    <div class="stat-item">
                        <span>🌳</span>
                        <span>${nodes.length} root${nodes.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="controls-bar">
            <div class="view-switcher">
                <button class="view-btn active" data-view="tree">
                    🌳 Tree
                </button>
                <button class="view-btn" data-view="radial">
                    ⭕ Radial
                </button>
                <button class="view-btn" data-view="2d">
                    📊 2D Force
                </button>
                <button class="view-btn" data-view="3d">
                    🌐 3D Force
                </button>
            </div>
            
            <div class="search-container">
                <div class="search-icon">🔍</div>
                <input type="text" class="search-input" placeholder="Search nodes..." id="searchInput">
                <div class="search-results hidden" id="searchResults"></div>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn" onclick="expandAll()">
                    ⬇️ Expand All
                </button>
                <button class="action-btn" onclick="collapseAll()">
                    ⬆️ Collapse All
                </button>
                <button class="action-btn" onclick="exportData()">
                    💾 Export JSON
                </button>
            </div>
        </div>
        
        <div class="mindmap-container">
            <!-- Tree View -->
            <div id="treeView" class="mindmap-2d tree-view">
                <div id="mindmap-tree"></div>
            </div>
            
            <!-- Radial View -->
            <div id="radialView" class="mindmap-2d radial-container hidden">
                <div id="mindmap-radial"></div>
            </div>
            
            <!-- 2D Force View -->
            <div id="2dView" class="mindmap-2d hidden">
                <div id="mindmap-2d"></div>
            </div>
            
            <!-- 3D Force View -->
            <div id="3dView" class="mindmap-3d hidden">
                <div class="loading">
                    <div class="spinner"></div>
                    <div>Loading 3D visualization...</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Exported by <a href="#" onclick="return false;">Mind Map Generator</a> • 
            Interactive viewer with ${nodeCount} nodes • 
            <span id="currentView">Tree View</span>
        </div>
    </div>

    <script>
        const mindMapData = ${nodesJson};
        let currentView = 'tree';
        let searchTimeout;
        let graph2D, graph3D;
        let highlightedNodes = new Set();
        let resizeTimeout;
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            initializeViews();
            setupEventListeners();
            setupResizeHandler();
            renderTreeView();
        });
        
        function initializeViews() {
            // Set up view switching
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    switchView(this.dataset.view);
                });
            });
        }
        
        function setupResizeHandler() {
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    refreshCurrentView();
                }, 250);
            });
        }
        
        function refreshCurrentView() {
            // Force re-render of current view with new dimensions
            switch(currentView) {
                case 'tree':
                    renderTreeView();
                    break;
                case 'radial':
                    renderRadialView();
                    break;
                case '2d':
                    render2DView();
                    break;
                case '3d':
                    render3DView();
                    break;
            }
        }
        
        function setupEventListeners() {
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    handleSearch(this.value);
                }, 300);
            });
            
            // Close search results when clicking outside
            document.addEventListener('click', function(e) {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.add('hidden');
                }
            });
        }
        
        function switchView(viewType) {
            // Cleanup existing graphs before switching
            cleanupGraphs();
            
            // Update active button
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-view="\${viewType}"]\`).classList.add('active');
            
            // Hide all views
            document.querySelectorAll('#treeView, #radialView, #2dView, #3dView').forEach(view => {
                view.classList.add('hidden');
            });
            
            // Show selected view
            currentView = viewType;
            document.getElementById('currentView').textContent = getViewDisplayName(viewType);
            
            // Use requestAnimationFrame to ensure DOM layout is complete
            requestAnimationFrame(() => {
                switch(viewType) {
                    case 'tree':
                        document.getElementById('treeView').classList.remove('hidden');
                        setTimeout(() => renderTreeView(), 50);
                        break;
                    case 'radial':
                        document.getElementById('radialView').classList.remove('hidden');
                        setTimeout(() => renderRadialView(), 50);
                        break;
                    case '2d':
                        document.getElementById('2dView').classList.remove('hidden');
                        setTimeout(() => render2DView(), 50);
                        break;
                    case '3d':
                        document.getElementById('3dView').classList.remove('hidden');
                        setTimeout(() => render3DView(), 100);
                        break;
                }
            });
        }
        
        function cleanupGraphs() {
            // Cleanup 2D graph
            if (graph2D) {
                try {
                    const container2D = document.getElementById('mindmap-2d');
                    if (container2D) {
                        container2D.innerHTML = '';
                    }
                } catch (e) {
                    console.warn('Error cleaning up 2D graph:', e);
                }
                graph2D = null;
            }
            
            // Cleanup 3D graph
            if (graph3D) {
                try {
                    const container3D = document.getElementById('3dView');
                    if (container3D) {
                        container3D.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading 3D visualization...</div></div>';
                    }
                } catch (e) {
                    console.warn('Error cleaning up 3D graph:', e);
                }
                graph3D = null;
            }
        }
        
        function getViewDisplayName(viewType) {
            const names = {
                'tree': 'Tree View',
                'radial': 'Radial View',
                '2d': '2D Force View',
                '3d': '3D Force View'
            };
            return names[viewType] || viewType;
        }
        
        function renderTreeView() {
            const container = document.getElementById('mindmap-tree');
            container.innerHTML = '';
            mindMapData.forEach(rootNode => {
                renderNode(rootNode, container);
            });
        }
        
        function renderNode(node, container) {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node';
            nodeDiv.dataset.nodeId = node.id;
            
            if (highlightedNodes.has(node.id)) {
                nodeDiv.classList.add('highlighted');
            }
            
            const nodeContent = document.createElement('div');
            nodeContent.className = \`node-content level-\${node.level % 6}\`;
            
            const icon = document.createElement('span');
            icon.className = 'node-icon';
            if (node.children.length > 0) {
                icon.innerHTML = node.isExpanded ? '📂' : '📁';
            } else {
                icon.innerHTML = '📄';
            }
            
            const label = document.createElement('span');
            label.textContent = node.label;
            
            nodeContent.appendChild(icon);
            nodeContent.appendChild(label);
            nodeDiv.appendChild(nodeContent);
            
            if (node.children.length > 0) {
                nodeContent.style.cursor = 'pointer';
                nodeContent.onclick = () => toggleNode(node.id);
                
                const childrenDiv = document.createElement('div');
                childrenDiv.className = \`children \${node.isExpanded ? '' : 'hidden'}\`;
                childrenDiv.dataset.parentId = node.id;
                
                node.children.forEach(child => {
                    const childWrapper = document.createElement('div');
                    childWrapper.className = 'child-connector';
                    renderNode(child, childWrapper);
                    childrenDiv.appendChild(childWrapper);
                });
                
                nodeDiv.appendChild(childrenDiv);
            }
            
            container.appendChild(nodeDiv);
        }
        
        function renderRadialView() {
            const container = document.getElementById('mindmap-radial');
            if (!container || container.clientWidth === 0) {
                setTimeout(() => renderRadialView(), 100);
                return;
            }
            
            container.innerHTML = '';
            
            // Create SVG for radial layout
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.width = '100%';
            svg.style.height = '100%';
            container.appendChild(svg);
            
            const centerX = container.clientWidth / 2;
            const centerY = container.clientHeight / 2;
            
            // Calculate positions for radial layout
            const positions = calculateRadialPositions(mindMapData, centerX, centerY);
            
            // Draw connections
            positions.forEach(pos => {
                if (pos.parent) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', pos.parent.x);
                    line.setAttribute('y1', pos.parent.y);
                    line.setAttribute('x2', pos.x);
                    line.setAttribute('y2', pos.y);
                    line.setAttribute('stroke', '#cbd5e1');
                    line.setAttribute('stroke-width', '2');
                    svg.appendChild(line);
                }
            });
            
            // Draw nodes
            positions.forEach(pos => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', pos.x);
                circle.setAttribute('cy', pos.y);
                circle.setAttribute('r', Math.max(8 - pos.level, 4));
                circle.setAttribute('fill', getNodeColor(pos.level));
                circle.style.cursor = 'pointer';
                
                circle.addEventListener('click', () => {
                    if (pos.node.children.length > 0) {
                        toggleNode(pos.node.id);
                        renderRadialView();
                    }
                });
                
                svg.appendChild(circle);
                
                // Add text label
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', pos.x);
                text.setAttribute('y', pos.y - 15);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '12');
                text.setAttribute('fill', '#374151');
                text.textContent = pos.node.label.length > 20 ? 
                    pos.node.label.substring(0, 20) + '...' : pos.node.label;
                svg.appendChild(text);
            });
        }
        
        function calculateRadialPositions(nodes, centerX, centerY) {
            const positions = [];
            const baseRadius = 80;
            const radiusIncrement = 60;
            
            function processNode(node, level, angle, parentPos) {
                const radius = level === 0 ? 0 : baseRadius + (level - 1) * radiusIncrement;
                const x = level === 0 ? centerX : parentPos.x + Math.cos(angle) * radius;
                const y = level === 0 ? centerY : parentPos.y + Math.sin(angle) * radius;
                
                const pos = { x, y, level, node, parent: parentPos };
                positions.push(pos);
                
                if (node.children.length > 0 && node.isExpanded) {
                    const angleStep = (2 * Math.PI) / Math.max(node.children.length, 1);
                    const startAngle = level === 0 ? 0 : angle - (angleStep * (node.children.length - 1)) / 2;
                    
                    node.children.forEach((child, index) => {
                        const childAngle = startAngle + index * angleStep;
                        processNode(child, level + 1, childAngle, pos);
                    });
                }
                
                return pos;
            }
            
            if (nodes.length === 1) {
                processNode(nodes[0], 0, 0, { x: centerX, y: centerY });
            } else {
                const angleStep = (2 * Math.PI) / nodes.length;
                nodes.forEach((node, index) => {
                    const angle = index * angleStep;
                    processNode(node, 1, angle, { x: centerX, y: centerY });
                });
            }
            
            return positions;
        }
        
        function render2DView() {
            const container = document.getElementById('mindmap-2d');
            if (!container || container.clientWidth === 0) {
                setTimeout(() => render2DView(), 100);
                return;
            }
            
            container.innerHTML = '';
            
            if (typeof ForceGraph === 'undefined') {
                container.innerHTML = '<div class="loading"><div class="spinner"></div><div>2D Force Graph library not available</div></div>';
                return;
            }
            
            const graphData = convertToGraphData(mindMapData);
            
            try {
                graph2D = ForceGraph()(container)
                    .graphData(graphData)
                    .nodeLabel(d => d.name)
                    .nodeColor(d => getNodeColor(d.level))
                    .nodeVal(d => Math.max(8 - d.level, 2))
                    .linkColor(() => '#cbd5e1')
                    .linkWidth(2)
                    .onNodeClick(node => {
                        if (node.children > 0) {
                            toggleNode(node.id);
                        }
                    })
                    .width(container.clientWidth)
                    .height(container.clientHeight)
                    .cooldownTicks(100)
                    .d3AlphaDecay(0.02)
                    .d3VelocityDecay(0.3);
            } catch (error) {
                console.error('Error initializing 2D graph:', error);
                container.innerHTML = '<div class="loading"><div>Error loading 2D visualization</div></div>';
            }
        }
        
        function render3DView() {
            const container = document.getElementById('3dView');
            if (!container || container.clientWidth === 0) {
                setTimeout(() => render3DView(), 100);
                return;
            }
            
            if (typeof ForceGraph3D === 'undefined') {
                container.innerHTML = '<div class="loading"><div class="spinner"></div><div>3D Force Graph library not available</div></div>';
                return;
            }
            
            container.innerHTML = '';
            const graphData = convertToGraphData(mindMapData);
            
            try {
                graph3D = ForceGraph3D()(container)
                    .graphData(graphData)
                    .nodeLabel(d => \`<div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; max-width: 200px; font-size: 12px;">\${d.name}</div>\`)
                    .nodeColor(d => getNodeColor(d.level))
                    .nodeVal(d => Math.max(8 - d.level, 2))
                    .linkColor(() => '#64748b')
                    .linkWidth(2)
                    .linkOpacity(0.6)
                    .onNodeClick(node => {
                        if (node.children > 0) {
                            toggleNode(node.id);
                        }
                    })
                    .width(container.clientWidth)
                    .height(container.clientHeight)
                    .backgroundColor('rgba(15, 23, 42, 1)')
                    .showNavInfo(false)
                    .controlType('orbit')
                    .enableNodeDrag(false)
                    .cooldownTicks(200)
                    .d3AlphaDecay(0.01)
                    .d3VelocityDecay(0.1);
            } catch (error) {
                console.error('Error initializing 3D graph:', error);
                container.innerHTML = '<div class="loading"><div>Error loading 3D visualization</div></div>';
            }
        }
        
        function convertToGraphData(nodes) {
            const graphNodes = [];
            const graphLinks = [];
            
            function processNode(node, parentId = null) {
                graphNodes.push({
                    id: node.id,
                    name: node.label,
                    level: node.level,
                    children: node.children.length
                });
                
                if (parentId) {
                    graphLinks.push({
                        source: parentId,
                        target: node.id
                    });
                }
                
                if (node.children.length > 0 && node.isExpanded) {
                    node.children.forEach(child => {
                        processNode(child, node.id);
                    });
                }
            }
            
            nodes.forEach(rootNode => {
                processNode(rootNode);
            });
            
            return { nodes: graphNodes, links: graphLinks };
        }
        
        function getNodeColor(level) {
            const colors = [
                '#3b82f6', // Blue
                '#14b8a6', // Teal
                '#f97316', // Orange
                '#a855f7', // Purple
                '#22c55e', // Green
                '#ec4899'  // Pink
            ];
            return colors[level % colors.length];
        }
        
        function toggleNode(nodeId) {
            updateNodeExpansion(mindMapData, nodeId, null);
            
            // Re-render current view with delay to ensure smooth animation
            setTimeout(() => {
                renderCurrentView();
            }, 50);
        }
        
        function updateNodeExpansion(nodes, nodeId, isExpanded) {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.isExpanded = isExpanded !== null ? isExpanded : !node.isExpanded;
                    return true;
                }
                if (node.children && updateNodeExpansion(node.children, nodeId, isExpanded)) {
                    return true;
                }
            }
            return false;
        }
        
        function expandAll() {
            setAllExpansion(true);
            renderCurrentView();
        }
        
        function collapseAll() {
            setAllExpansion(false);
            renderCurrentView();
        }
        
        function setAllExpansion(expanded) {
            function updateNodes(nodes) {
                nodes.forEach(node => {
                    if (node.children.length > 0) {
                        node.isExpanded = expanded;
                        updateNodes(node.children);
                    }
                });
            }
            updateNodes(mindMapData);
        }
        
        function renderCurrentView() {
            switch(currentView) {
                case 'tree':
                    setTimeout(() => renderTreeView(), 10);
                    break;
                case 'radial':
                    setTimeout(() => renderRadialView(), 10);
                    break;
                case '2d':
                    setTimeout(() => render2DView(), 10);
                    break;
                case '3d':
                    setTimeout(() => render3DView(), 50);
                    break;
            }
        }
        
        function handleSearch(query) {
            const searchResults = document.getElementById('searchResults');
            
            if (!query.trim()) {
                searchResults.classList.add('hidden');
                highlightedNodes.clear();
                renderCurrentView();
                return;
            }
            
            const results = searchNodes(mindMapData, query);
            
            if (results.length > 0) {
                searchResults.innerHTML = '';
                results.slice(0, 10).forEach(node => {
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'search-result';
                    resultDiv.innerHTML = \`
                        <div>\${highlightSearchTerm(node.label, query)}</div>
                        <div style="font-size: 0.75rem; color: #9ca3af;">Level \${node.level}</div>
                    \`;
                    resultDiv.addEventListener('click', () => {
                        selectNode(node.id);
                        searchResults.classList.add('hidden');
                        document.getElementById('searchInput').value = '';
                    });
                    searchResults.appendChild(resultDiv);
                });
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = '<div class="search-result">No results found</div>';
                searchResults.classList.remove('hidden');
            }
        }
        
        function searchNodes(nodes, query) {
            const results = [];
            
            function traverse(nodeList) {
                nodeList.forEach(node => {
                    if (node.label.toLowerCase().includes(query.toLowerCase())) {
                        results.push(node);
                    }
                    if (node.children.length > 0) {
                        traverse(node.children);
                    }
                });
            }
            
            traverse(nodes);
            return results;
        }
        
        function highlightSearchTerm(text, term) {
            if (!term) return text;
            const regex = new RegExp(\`(\${term})\`, 'gi');
            return text.replace(regex, '<mark style="background: #fef3c7; padding: 1px 2px; border-radius: 2px;">$1</mark>');
        }
        
        function selectNode(nodeId) {
            highlightedNodes.clear();
            highlightedNodes.add(nodeId);
            renderCurrentView();
        }
        
        function exportData() {
            const dataStr = JSON.stringify(mindMapData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mindmap-export-\${new Date().toISOString().split('T')[0]}.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
};

/**
 * Show success message to user
 */
const showSuccessMessage = (message: string): void => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  toast.textContent = `✅ ${message}`;
  document.body.appendChild(toast);
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(toast);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
};

/**
 * Show error message to user
 */
const showErrorMessage = (message: string): void => {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  toast.textContent = `❌ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
};