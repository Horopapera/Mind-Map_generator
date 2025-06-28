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