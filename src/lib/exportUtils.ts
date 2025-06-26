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

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Map - Interactive Export</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #1f2937;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 8px;
        }
        
        .header p {
            opacity: 0.8;
            font-size: 0.9rem;
        }
        
        .content {
            display: flex;
            height: 600px;
        }
        
        .input-panel {
            width: 40%;
            border-right: 1px solid #e5e7eb;
            background: #f9fafb;
        }
        
        .input-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background: white;
            font-weight: 600;
            color: #374151;
        }
        
        .input-content {
            padding: 16px;
            height: calc(100% - 60px);
        }
        
        .input-text {
            width: 100%;
            height: 100%;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            background: white;
        }
        
        .mindmap-panel {
            width: 60%;
            padding: 20px;
            overflow: auto;
        }
        
        .node {
            margin-bottom: 12px;
            position: relative;
        }
        
        .node-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
            font-size: 14px;
        }
        
        .node-content:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .node-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }
        
        .children {
            margin-left: 24px;
            margin-top: 8px;
            position: relative;
        }
        
        .children::before {
            content: '';
            position: absolute;
            left: -12px;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #d1d5db;
        }
        
        .child-connector {
            position: relative;
        }
        
        .child-connector::before {
            content: '';
            position: absolute;
            left: -12px;
            top: 20px;
            width: 12px;
            height: 1px;
            background: #d1d5db;
        }
        
        /* Color scheme for different levels */
        .level-0 { background: #3b82f6; color: white; }
        .level-1 { background: #14b8a6; color: white; }
        .level-2 { background: #f97316; color: white; }
        .level-3 { background: #a855f7; color: white; }
        .level-4 { background: #22c55e; color: white; }
        .level-5 { background: #ec4899; color: white; }
        
        .controls {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
            text-align: center;
        }
        
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 4px;
            transition: background 0.2s;
        }
        
        .btn:hover {
            background: #2563eb;
        }
        
        .hidden {
            display: none;
        }
        
        .footer {
            padding: 16px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Mind Map</h1>
            <p>Interactive mind map exported on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="content">
            <div class="input-panel">
                <div class="input-header">📝 Source Text</div>
                <div class="input-content">
                    <textarea class="input-text" readonly>${inputText}</textarea>
                </div>
            </div>
            
            <div class="mindmap-panel">
                <div id="mindmap-container"></div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="expandAll()">Expand All</button>
            <button class="btn" onclick="collapseAll()">Collapse All</button>
            <button class="btn" onclick="exportData()">Export JSON</button>
        </div>
        
        <div class="footer">
            Generated by Mind Map Generator • ${nodes.length} total nodes
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
            const childrenDiv = document.querySelector(\`[data-parent-id="\${nodeId}"]\`);
            const iconSpan = document.querySelector(\`[data-node-id="\${nodeId}"] .node-icon\`);
            
            if (childrenDiv) {
                const isHidden = childrenDiv.classList.contains('hidden');
                childrenDiv.classList.toggle('hidden');
                iconSpan.innerHTML = isHidden ? '▼' : '▶';
                
                // Update data
                updateNodeExpansion(mindMapData, nodeId, isHidden);
            }
        }
        
        function updateNodeExpansion(nodes, nodeId, isExpanded) {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.isExpanded = isExpanded;
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
        
        function exportData() {
            const dataStr = JSON.stringify(mindMapData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mindmap-data.json';
            link.click();
            URL.revokeObjectURL(url);
        }
        
        function renderMindMap() {
            const container = document.getElementById('mindmap-container');
            container.innerHTML = '';
            mindMapData.forEach(rootNode => {
                renderNode(rootNode, container);
            });
        }
        
        // Initial render
        renderMindMap();
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