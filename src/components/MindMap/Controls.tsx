import React from 'react';
import { 
  Search, 
  Download, 
  Copy, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  TreePine,
  CircleDot
} from 'lucide-react';
import { ViewMode, LayoutType } from '../../types/mindmap';

interface ControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  onCopy: () => void;
  onReset: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  layoutType: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  nodeCount: number;
}

export const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  onSearchChange,
  onExport,
  onCopy,
  onReset,
  viewMode,
  onViewModeChange,
  layoutType,
  onLayoutChange,
  nodeCount
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'split' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Maximize2 size={14} className="inline mr-1" />
              Preview
            </button>
            <button
              onClick={() => onViewModeChange('input')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'input' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Minimize2 size={14} className="inline mr-1" />
              Input
            </button>
          </div>
          
          {/* Layout Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onLayoutChange('tree')}
              className={`px-2 py-1 rounded transition-colors ${
                layoutType === 'tree' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              title="Tree Layout"
            >
              <TreePine size={16} />
            </button>
            <button
              onClick={() => onLayoutChange('radial')}
              className={`px-2 py-1 rounded transition-colors ${
                layoutType === 'radial' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              title="Radial Layout"
            >
              <CircleDot size={16} />
            </button>
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={onCopy}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy to Clipboard"
          >
            <Copy size={16} />
          </button>
          
          <button
            onClick={onExport}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Export Mind Map"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={onReset}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      {/* Stats */}
      {nodeCount > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {nodeCount} nodes • {searchQuery && `Search: "${searchQuery}"`}
        </div>
      )}
    </div>
  );
};