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
 * Export mind map as standalone branched/tree HTML
 */
export const exportToBranchedHTML = (
  nodes: MindMapNode[],
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename || generateFilename('mindmap-branched', 'html');
    
    const htmlContent = generateBranchedHTML(nodes);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    saveAs(htmlBlob, filename);
    showSuccessMessage(`Branched HTML exported as ${filename}`);
  } catch (error) {
    console.error('Branched HTML export failed:', error);
    showErrorMessage('Failed to export branched HTML. Please try again.');
  }
};

/**
 * Export interactive tree mind map as HTML
 */
export const exportToTreeHTML = (
  nodes: MindMapNode[],
  inputText: string,
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename || generateFilename('mindmap-tree', 'html');
    
    const htmlContent = generateTreeHTML(nodes);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    saveAs(htmlBlob, filename);
    showSuccessMessage(`Tree HTML exported as ${filename}`);
  } catch (error) {
    console.error('Tree HTML export failed:', error);
    showErrorMessage('Failed to export tree HTML. Please try again.');
  }
};

/**
 * Export mind map as standalone 3D interactive HTML
 */
export const exportTo3DHTML = (
  nodes: MindMapNode[],
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename || generateFilename('mindmap-3d', 'html');
    
    const htmlContent = generate3DHTML(nodes);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    saveAs(htmlBlob, filename);
    showSuccessMessage(`3D Interactive HTML exported as ${filename}`);
  } catch (error) {
    console.error('3D HTML export failed:', error);
    showErrorMessage('Failed to export 3D HTML. Please try again.');
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
 * Generate standalone branched/tree HTML
 */
const generateBranchedHTML = (nodes: MindMapNode[]): string => {
  const nodesJson = JSON.stringify(nodes, (key, value) => {
    if (key === 'parent') return undefined;
    return value;
  });

  const totalNodes = countAllNodes(nodes);
  const exportDate = new Date().toLocaleDateString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Map - Branched View</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #1f2937;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 1.8rem;
            margin-bottom: 8px;
        }
        
        .header p {
            opacity: 0.8;
            font-size: 0.9rem;
        }
        
        .mindmap-container {
            padding: 30px;
            min-height: 500px;
            background: #ffffff;
        }
        
        .stats {
            padding: 16px 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        
        .node {
            margin-bottom: 16px;
            position: relative;
        }
        
        .node-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            font-size: 15px;
            border-left: 4px solid transparent;
        }
        
        .node-content:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        
        .node-icon {
            width: 100%;
            height: 20px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .children {
            margin-left: 32px;
            margin-top: 12px;
            position: relative;
            border-left: 2px solid #e2e8f0;
            padding-left: 20px;
        }
        
        .child-connector {
            position: relative;
        }
        
        .child-connector::before {
            content: '';
            position: absolute;
            left: -22px;
            top: 24px;
            width: 20px;
            height: 2px;
            background: #e2e8f0;
        }
        
        /* Color scheme for different levels */
        .level-0 { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            border-left-color: #1d4ed8;
        }
        .level-1 { 
            background: linear-gradient(135deg, #14b8a6, #0f766e); 
            color: white; 
            border-left-color: #0f766e;
        }
        .level-2 { 
            background: linear-gradient(135deg, #f97316, #c2410c); 
            color: white; 
            border-left-color: #c2410c;
        }
        .level-3 { 
            background: linear-gradient(135deg, #a855f7, #7c3aed); 
            color: white; 
            border-left-color: #7c3aed;
        }
        .level-4 { 
            background: linear-gradient(135deg, #22c55e, #15803d); 
            color: white; 
            border-left-color: #15803d;
        }
        .level-5 { 
            background: linear-gradient(135deg, #ec4899, #be185d); 
            color: white; 
            border-left-color: #be185d;
        }
        
        .controls {
            padding: 20px 30px;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
            text-align: center;
        }
        
        .btn {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            margin: 0 8px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌳 Mind Map - Branched View</h1>
            <p>Exported on ${exportDate} • ${totalNodes} nodes</p>
        </div>
        
        <div class="mindmap-container">
            <div id="mindmap-container"></div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="expandAll()">Expand All</button>
            <button class="btn" onclick="collapseAll()">Collapse All</button>
        </div>
        
        <div class="stats">
            Exported by Mind Map Generator • Total nodes: ${totalNodes}
        </div>
    </div>

    <script>
        const mindMapData = ${nodesJson};
        
        function renderNode(node, container) {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node';
            nodeDiv.dataset.nodeId = node.id;
            
            const nodeContent = document.createElement('div');
            nodeContent.className = \`node-content level-\${node.level % 6}\`;
            
            const icon = document.createElement('span');
            icon.className = 'node-icon';
            icon.innerHTML = node.children.length > 0 ? 
                (node.isExpanded ? '▼' : '▶') : '●';
            
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
        
        function toggleNode(nodeId) {
            updateNodeExpansion(mindMapData, nodeId);
            renderMindMap();
        }
        
        function updateNodeExpansion(nodes, nodeId) {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.isExpanded = !node.isExpanded;
                    return true;
                }
                if (node.children && updateNodeExpansion(node.children, nodeId)) {
                    return true;
                }
            }
            return false;
        }
        
        function expandAll() {
            setAllExpansion(true);
            renderMindMap();
        }
        
        function collapseAll() {
            setAllExpansion(false);
            renderMindMap();
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
        
        function renderMindMap() {
            const container = document.getElementById('mindmap-container');
            container.innerHTML = '';
            mindMapData.forEach(rootNode => {
                renderNode(rootNode, container);
            });
        }
        
        // Initialize
        renderMindMap();
    </script>
</body>
</html>`;
};

/**
 * Generate standalone tree HTML with embedded mind map
 */
const generateTreeHTML = (nodes: MindMapNode[]): string => {
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
    <title>Tree Mind Map - ${exportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #0f766e 0%, #059669 50%, #047857 100%);
            min-height: 100vh;
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
            background: linear-gradient(45deg, #34d399, #10b981);
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
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            z-index: 999;
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
            overflow: auto;
            background: #ffffff;
            padding: 24px;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="header-title">
                    <h1>🌳 Tree Mind Map</h1>
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
            <div id="mindmap-tree"></div>
        </div>
        
        <div class="footer">
            Exported by <a href="#" onclick="return false;">Tree Mind Map Generator</a> • 
            Interactive viewer with ${nodeCount} nodes • 
            Tree Layout
        </div>
    </div>

    <script>
        const mindMapData = ${nodesJson};
        let searchTimeout;
        let highlightedNodes = new Set();
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            renderTreeView();
        });
        
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
        
        function renderTreeView() {
            const container = document.getElementById('mindmap-tree');
            if (!container) return;
            
            container.innerHTML = '';
            mindMapData.forEach(rootNode => {
                renderNode(rootNode, container);
            });
        }
        
        function renderNode(node, container) {
            if (!container) return;
            
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
        
        function toggleNode(nodeId) {
            updateNodeExpansion(mindMapData, nodeId);
            renderTreeView();
        }
        
        function updateNodeExpansion(nodes, nodeId) {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.isExpanded = !node.isExpanded;
                    return true;
                }
                if (node.children && updateNodeExpansion(node.children, nodeId)) {
                    return true;
                }
            }
            return false;
        }
        
        function expandAll() {
            setAllExpansion(true);
            renderTreeView();
        }
        
        function collapseAll() {
            setAllExpansion(false);
            renderTreeView();
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
        
        function handleSearch(query) {
            const searchResults = document.getElementById('searchResults');
            
            if (!query.trim()) {
                searchResults.classList.add('hidden');
                highlightedNodes.clear();
                renderTreeView();
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
            renderTreeView();
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
 * Generate standalone 3D HTML with embedded mind map
 */
const generate3DHTML = (nodes: MindMapNode[]): string => {
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
    <title>3D Mind Map - ${exportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #581c87 100%);
            min-height: 100vh;
            overflow: hidden;
            color: white;
        }
        
        .container {
            width: 100vw;
            height: 100vh;
            background: #0f172a;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 16px 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            position: relative;
            border-bottom: 1px solid #334155;
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
            background: linear-gradient(45deg, #8b5cf6, #a78bfa);
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
            background: rgba(15, 23, 42, 0.95);
            border-bottom: 1px solid #334155;
            padding: 12px 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            z-index: 999;
            backdrop-filter: blur(10px);
        }
        
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-input {
            width: 280px;
            padding: 8px 12px 8px 36px;
            border: 1px solid #475569;
            border-radius: 8px;
            font-size: 0.875rem;
            background: rgba(30, 41, 59, 0.8);
            color: white;
            transition: all 0.2s ease;
        }
        
        .search-input::placeholder {
            color: #94a3b8;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        
        .search-icon {
            position: absolute;
            left: 12px;
            color: #94a3b8;
            pointer-events: none;
        }
        
        .action-buttons {
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            padding: 8px 12px;
            border: 1px solid #475569;
            background: rgba(30, 41, 59, 0.8);
            color: #e2e8f0;
            font-size: 0.875rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(10px);
        }
        
        .action-btn:hover {
            background: rgba(51, 65, 85, 0.8);
            border-color: #64748b;
            transform: translateY(-1px);
        }
        
        .mindmap-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #0f172a;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            color: #94a3b8;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #334155;
            border-top: 3px solid #8b5cf6;
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
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #475569;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }
        
        .search-result {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #334155;
            font-size: 0.875rem;
            color: #e2e8f0;
        }
        
        .search-result:hover {
            background: rgba(51, 65, 85, 0.8);
        }
        
        .search-result:last-child {
            border-bottom: none;
        }
        
        .footer {
            background: rgba(15, 23, 42, 0.95);
            border-top: 1px solid #334155;
            padding: 12px 24px;
            text-align: center;
            font-size: 0.75rem;
            color: #94a3b8;
            backdrop-filter: blur(10px);
        }
        
        .footer a {
            color: #8b5cf6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .hidden {
            display: none;
        }
        
        .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.9);
            border: 1px solid #dc2626;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 0.875rem;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        
        .controls-overlay {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 12px;
            font-size: 0.75rem;
            color: #94a3b8;
            backdrop-filter: blur(10px);
            z-index: 100;
        }
        
        .controls-overlay div {
            margin-bottom: 4px;
        }
        
        .controls-overlay div:last-child {
            margin-bottom: 0;
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
            
            .controls-overlay {
                bottom: 10px;
                right: 10px;
                font-size: 0.625rem;
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="header-title">
                    <h1>🌐 3D Mind Map</h1>
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
                <button class="action-btn" onclick="resetView()">
                    🏠 Reset View
                </button>
                <button class="action-btn" onclick="exportData()">
                    💾 Export JSON
                </button>
            </div>
        </div>
        
        <div class="mindmap-container" id="mindmapContainer">
            <div class="loading" id="loadingIndicator">
                <div class="spinner"></div>
                <div>Loading 3D Mind Map...</div>
                <div style="font-size: 0.75rem; margin-top: 8px;">Please wait while libraries load</div>
            </div>
        </div>
        
        <div class="controls-overlay">
            <div>🖱️ Click: Select node</div>
            <div>🖱️ Double-click: Expand/Collapse</div>
            <div>🔄 Drag: Rotate view</div>
            <div>🔍 Scroll: Zoom in/out</div>
        </div>
        
        <div class="footer">
            Exported by <a href="#" onclick="return false;">3D Mind Map Generator</a> • 
            Interactive 3D viewer with ${nodeCount} nodes • 
            WebGL Powered
        </div>
    </div>

    <!-- Load Three.js and 3D Force Graph -->
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/3d-force-graph@1.70.0/dist/3d-force-graph.min.js"></script>

    <script>
        const mindMapData = ${nodesJson};
        let searchTimeout;
        let graph3D;
        let highlightedNodes = new Set();
        let librariesLoaded = false;
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            checkLibrariesAndInit();
        });
        
        function checkLibrariesAndInit() {
            // Check if libraries are loaded
            if (typeof THREE !== 'undefined' && typeof ForceGraph3D !== 'undefined') {
                librariesLoaded = true;
                setTimeout(() => {
                    render3DView();
                }, 500);
            } else {
                // Retry after delay
                setTimeout(checkLibrariesAndInit, 1000);
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
            
            // Handle window resize
            window.addEventListener('resize', function() {
                if (graph3D) {
                    const container = document.getElementById('mindmapContainer');
                    graph3D.width(container.clientWidth).height(container.clientHeight);
                }
            });
        }
        
        function render3DView() {
            const container = document.getElementById('mindmapContainer');
            const loadingIndicator = document.getElementById('loadingIndicator');
            
            if (!librariesLoaded) {
                showError('3D libraries failed to load. Please check your internet connection and refresh the page.');
                return;
            }
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            const graphData = convertToGraphData(mindMapData);
            
            try {
                graph3D = ForceGraph3D()(container)
                    .graphData(graphData)
                    .nodeLabel(d => \`
                        <div style="
                            background: rgba(0,0,0,0.9); 
                            color: white; 
                            padding: 12px; 
                            border-radius: 8px; 
                            max-width: 250px; 
                            font-size: 13px;
                            border: 1px solid #8b5cf6;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        ">
                            <div style="font-weight: bold; margin-bottom: 6px; color: #a78bfa;">\${d.name}</div>
                            <div style="font-size: 11px; color: #cbd5e1;">
                                Level: \${d.level}<br/>
                                Children: \${d.children}
                            </div>
                        </div>
                    \`)
                    .nodeColor(d => {
                        if (highlightedNodes.has(d.id)) return '#fbbf24';
                        return getNodeColor(d.level);
                    })
                    .nodeVal(d => {
                        const baseSize = Math.max(12 - d.level * 2, 4);
                        const childBonus = Math.min(d.children * 2, 8);
                        return baseSize + childBonus;
                    })
                    .linkColor(link => {
                        if (highlightedNodes.has(link.source.id) || highlightedNodes.has(link.target.id)) {
                            return '#fbbf24';
                        }
                        return '#64748b';
                    })
                    .linkWidth(link => {
                        if (highlightedNodes.has(link.source.id) || highlightedNodes.has(link.target.id)) {
                            return 4;
                        }
                        return 2;
                    })
                    .linkOpacity(0.7)
                    .onNodeClick(node => {
                        selectNode(node.id);
                        
                        // Center camera on clicked node
                        const distance = 200;
                        graph3D.cameraPosition(
                            { 
                                x: node.x + distance, 
                                y: node.y + distance, 
                                z: node.z + distance 
                            },
                            node,
                            1500
                        );
                    })
                    .onNodeRightClick(node => {
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
                    .cooldownTicks(300)
                    .d3AlphaDecay(0.01)
                    .d3VelocityDecay(0.08)
                    .nodeThreeObject(node => {
                        // Create enhanced 3D nodes with glow effects
                        const group = new THREE.Group();
                        
                        // Main sphere
                        const geometry = new THREE.SphereGeometry(node.val || 8);
                        const material = new THREE.MeshLambertMaterial({ 
                            color: node.color,
                            transparent: true,
                            opacity: 0.9
                        });
                        const sphere = new THREE.Mesh(geometry, material);
                        group.add(sphere);
                        
                        // Glow effect for highlighted nodes
                        if (highlightedNodes.has(node.id)) {
                            const glowGeometry = new THREE.SphereGeometry((node.val || 8) * 1.5);
                            const glowMaterial = new THREE.MeshBasicMaterial({
                                color: '#fbbf24',
                                transparent: true,
                                opacity: 0.3
                            });
                            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                            group.add(glow);
                        }
                        
                        // Add text label for important nodes
                        if (node.level <= 2 || highlightedNodes.has(node.id)) {
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.width = 256;
                            canvas.height = 64;
                            
                            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                            
                            context.fillStyle = 'white';
                            context.font = '16px Arial';
                            context.textAlign = 'center';
                            context.textBaseline = 'middle';
                            
                            const text = node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name;
                            context.fillText(text, canvas.width / 2, canvas.height / 2);
                            
                            const texture = new THREE.CanvasTexture(canvas);
                            const spriteMaterial = new THREE.SpriteMaterial({ 
                                map: texture,
                                transparent: true
                            });
                            const sprite = new THREE.Sprite(spriteMaterial);
                            sprite.scale.set(30, 7.5, 1);
                            sprite.position.set(0, (node.val || 8) + 15, 0);
                            group.add(sprite);
                        }
                        
                        return group;
                    });
                    
                // Auto-fit view after initial render
                setTimeout(() => {
                    if (graph3D) {
                        graph3D.zoomToFit(2000);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Error initializing 3D graph:', error);
                showError('Failed to initialize 3D visualization. Please refresh the page and try again.');
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
                    children: node.children.length,
                    color: getNodeColor(node.level)
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
                '#8b5cf6', // Purple
                '#06b6d4', // Cyan
                '#10b981', // Emerald
                '#f59e0b', // Amber
                '#ef4444', // Red
                '#3b82f6', // Blue
                '#84cc16', // Lime
                '#ec4899'  // Pink
            ];
            return colors[level % colors.length];
        }
        
        function toggleNode(nodeId) {
            updateNodeExpansion(mindMapData, nodeId);
            
            // Re-render with smooth transition
            setTimeout(() => {
                const graphData = convertToGraphData(mindMapData);
                if (graph3D) {
                    graph3D.graphData(graphData);
                }
            }, 100);
        }
        
        function updateNodeExpansion(nodes, nodeId) {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.isExpanded = !node.isExpanded;
                    return true;
                }
                if (node.children && updateNodeExpansion(node.children, nodeId)) {
                    return true;
                }
            }
            return false;
        }
        
        function expandAll() {
            setAllExpansion(true);
            refreshGraph();
        }
        
        function collapseAll() {
            setAllExpansion(false);
            refreshGraph();
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
        
        function refreshGraph() {
            if (graph3D) {
                const graphData = convertToGraphData(mindMapData);
                graph3D.graphData(graphData);
                
                // Auto-fit view after expansion/collapse
                setTimeout(() => {
                    graph3D.zoomToFit(1500);
                }, 500);
            }
        }
        
        function resetView() {
            if (graph3D) {
                highlightedNodes.clear();
                refreshGraph();
                graph3D.zoomToFit(2000);
            }
        }
        
        function handleSearch(query) {
            const searchResults = document.getElementById('searchResults');
            
            if (!query.trim()) {
                searchResults.classList.add('hidden');
                highlightedNodes.clear();
                refreshGraph();
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
                        <div style="font-size: 0.75rem; color: #94a3b8;">Level \${node.level} • \${node.children.length} children</div>
                    \`;
                    resultDiv.addEventListener('click', () => {
                        selectNode(node.id);
                        searchResults.classList.add('hidden');
                        document.getElementById('searchInput').value = '';
                        
                        // Focus on selected node
                        if (graph3D) {
                            const graphData = convertToGraphData(mindMapData);
                            const targetNode = graphData.nodes.find(n => n.id === node.id);
                            if (targetNode) {
                                setTimeout(() => {
                                    graph3D.cameraPosition(
                                        { x: 150, y: 150, z: 150 },
                                        targetNode,
                                        2000
                                    );
                                }, 100);
                            }
                        }
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
            return text.replace(regex, '<mark style="background: #fbbf24; color: #1f2937; padding: 1px 2px; border-radius: 2px;">$1</mark>');
        }
        
        function selectNode(nodeId) {
            highlightedNodes.clear();
            highlightedNodes.add(nodeId);
            refreshGraph();
        }
        
        function showError(message) {
            const container = document.getElementById('mindmapContainer');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = \`
                <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Error</div>
                <div>\${message}</div>
            \`;
            
            // Remove existing error messages
            const existingErrors = container.querySelectorAll('.error-message');
            existingErrors.forEach(error => error.remove());
            
            container.appendChild(errorDiv);
        }
        
        function exportData() {
            const dataStr = JSON.stringify(mindMapData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mindmap-3d-export-\${new Date().toISOString().split('T')[0]}.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
};

/**
 * Count total nodes in the tree
 */
const countAllNodes = (nodes: MindMapNode[]): number => {
  let count = 0;
  
  const traverse = (nodeList: MindMapNode[]) => {
    nodeList.forEach(node => {
      count++;
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(nodes);
  return count;
};

/**
 * Legacy function for backward compatibility
 */
export const exportToInteractiveHTML = (
  nodes: MindMapNode[],
  inputText: string,
  options: ExportOptions = {}
): void => {
  // Default to tree export for backward compatibility
  exportToTreeHTML(nodes, inputText, options);
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