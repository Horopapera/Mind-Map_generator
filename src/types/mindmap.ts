export interface MindMapNode {
  id: string;
  label: string;
  level: number;
  children: MindMapNode[];
  parent?: MindMapNode;
  isExpanded: boolean;
  x?: number;
  y?: number;
}

export interface ParsedLine {
  content: string;
  level: number;
  lineNumber: number;
}

export type LayoutType = 'tree' | 'radial';
export type ViewMode = 'split' | 'preview' | 'input';
export type VisualizationType = '2d' | '3d';