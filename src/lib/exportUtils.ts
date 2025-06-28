import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { MindMapNode } from '../types/mindmap';

interface ExportOptions {
  filename?: string;
  quality?: number;
}

/**
 * Generate a filename with timestamp
 */
const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * Show success message (you can replace with your preferred notification system)
 */
const showSuccessMessage = (message: string): void => {
  console.log('✅ Export Success:', message);
  // You can replace this with a toast notification or other UI feedback
};

/**
 * Show error message (you can replace with your preferred notification system)
 */
const showErrorMessage = (message: string): void => {
  console.error('❌ Export Error:', message);
  // You can replace this with a toast notification or other UI feedback
};

/**
 * Export DOM element as PNG image
 */
export const exportToPNG = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap', 'png');
    const quality = options.quality || 1.0;
    
    const dataUrl = await domtoimage.toPng(element, {
      quality,
      bgcolor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });
    
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    saveAs(blob, filename);
    showSuccessMessage(`PNG exported as ${filename}`);
  } catch (error) {
    console.error('PNG export failed:', error);
    showErrorMessage('Failed to export PNG. Please try again.');
  }
};

/**
 * Export DOM element as SVG
 */
export const exportToSVG = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap', 'svg');
    
    const dataUrl = await domtoimage.toSvg(element, {
      bgcolor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });
    
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    saveAs(blob, filename);
    showSuccessMessage(`SVG exported as ${filename}`);
  } catch (error) {
    console.error('SVG export failed:', error);
    showErrorMessage('Failed to export SVG. Please try again.');
  }
};

/**
 * Export 3D renderer canvas as PNG
 */
export const export3DToPNG = async (
  renderer: any,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const filename = options.filename || generateFilename('mindmap-3d', 'png');
    
    // Get the canvas from the Three.js renderer
    const canvas = renderer.domElement;
    
    // Convert canvas to blob
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        saveAs(blob, filename);
        showSuccessMessage(`3D PNG exported as ${filename}`);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/png');
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