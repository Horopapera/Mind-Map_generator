};
  }
    showErrorMessage('Failed to export JSON. Please try again.');
    console.error('JSON export failed:', error);
  } catch (error) {
    showSuccessMessage(`JSON exported as ${filename}`);
    saveAs(dataBlob, filename);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    }, 2);
      return value;
      }
        return undefined;
      if (key === 'parent') {
      // Exclude parent references to avoid circular dependencies
    const dataStr = JSON.stringify(nodes, (key, value) => {
    
    const filename = options.filename || generateFilename('mindmap', 'json');
  try {
): void => {
  options: ExportOptions = {}
  nodes: MindMapNode[],
export const exportToJSON = (
 */
 * Export mind map data as JSON
/**
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