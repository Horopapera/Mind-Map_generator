import React, { useRef } from 'react';
import { Download, FileImage, FileCode, Globe, FileText } from 'lucide-react';
import { MindMapNode, VisualizationType } from '../../types/mindmap';
import { 
  exportToPNG, 
  exportToSVG, 
  exportToJSON, 
  exportToInteractiveHTML,
  export3DToPNG 
} from '../../lib/exportUtils';

interface ExportControlsProps {
  nodes: MindMapNode[];
  inputText: string;
  visualizationType: VisualizationType;
  mindMapRef: React.RefObject<HTMLDivElement>;
  threejsRenderer?: any;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  nodes,
  inputText,
  visualizationType,
  mindMapRef,
  threejsRenderer
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPNG = async () => {
    if (!mindMapRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      if (visualizationType === '3d' && threejsRenderer) {
        await export3DToPNG(threejsRenderer);
      } else {
        await exportToPNG(mindMapRef.current);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = async () => {
    if (!mindMapRef.current || isExporting || visualizationType === '3d') return;
    
    setIsExporting(true);
    try {
      await exportToSVG(mindMapRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      exportToJSON(nodes);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTreeHTML = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      exportToTreeHTML(nodes, inputText);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport3DHTML = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      exportTo3DHTML(nodes, inputText);
    } finally {
      setIsExporting(false);
    }
  };

  const buttonClass = `
    flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
    transition-all duration-200 border
    ${isExporting 
      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
    }
  `;

  const disabledButtonClass = `
    flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
    bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed
  `;

  return (
    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
      <div className="flex items-center gap-1 text-xs text-gray-600 mr-2">
        <Download size={14} />
        <span className="font-medium">Export:</span>
      </div>
      
      {/* PNG Export */}
      <button
        onClick={handleExportPNG}
        disabled={isExporting || nodes.length === 0}
        className={nodes.length === 0 ? disabledButtonClass : buttonClass}
        title={`Export as PNG ${visualizationType === '3d' ? '(3D Screenshot)' : '(2D Image)'}`}
      >
        <FileImage size={16} />
        PNG
      </button>

      {/* SVG Export - Only available for 2D */}
      <button
        onClick={handleExportSVG}
        disabled={isExporting || nodes.length === 0 || visualizationType === '3d'}
        className={
          nodes.length === 0 || visualizationType === '3d' 
            ? disabledButtonClass 
            : buttonClass
        }
        title={
          visualizationType === '3d' 
            ? 'SVG export not available for 3D view' 
            : 'Export as SVG (Vector Graphics)'
        }
      >
        <FileCode size={16} />
        SVG
        {visualizationType === '3d' && (
          <span className="text-xs text-gray-400">(2D only)</span>
        )}
      </button>

      {/* Interactive HTML Export */}
      <button
        onClick={handleExportTreeHTML}
        disabled={isExporting || nodes.length === 0}
        className={nodes.length === 0 ? disabledButtonClass : buttonClass}
        title="Export as standalone tree HTML file"
      >
        <Globe size={16} />
        Tree HTML
      </button>

      {/* 3D HTML Export */}
      <button
        onClick={handleExport3DHTML}
        disabled={isExporting || nodes.length === 0}
        className={nodes.length === 0 ? disabledButtonClass : buttonClass}
        title="Export as standalone 3D HTML file"
      >
        <Globe size={16} />
        3D HTML
      </button>

      {/* JSON Export */}
      <button
        onClick={handleExportJSON}
        disabled={isExporting || nodes.length === 0}
        className={nodes.length === 0 ? disabledButtonClass : buttonClass}
        title="Export mind map data as JSON"
      >
        <FileText size={16} />
        JSON
      </button>

      {isExporting && (
        <div className="flex items-center gap-2 text-xs text-blue-600 ml-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          Exporting...
        </div>
      )}
    </div>
  );
};