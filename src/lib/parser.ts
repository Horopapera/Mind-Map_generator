import { MindMapNode, ParsedLine } from '../types/mindmap';

let nodeIdCounter = 0;

export const generateNodeId = (): string => {
  nodeIdCounter += 1;
  return `node-${nodeIdCounter}`;
};

export const parseTextToLines = (text: string): ParsedLine[] => {
  if (!text.trim()) return [];
  
  const lines = text.split('\n');
  const parsedLines: ParsedLine[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Calculate indentation level
    const leadingSpaces = line.length - line.trimStart().length;
    const level = Math.floor(leadingSpaces / 2); // 2 spaces = 1 level
    
    // Clean up bullet points and special characters
    const cleanContent = trimmedLine
      .replace(/^[•·▪▫‣⁃-]\s*/, '') // Remove bullet points
      .replace(/^[│├└]\s*/, '') // Remove tree characters
      .replace(/^[\d]+\.\s*/, '') // Remove numbered lists
      .trim();
    
    if (cleanContent) {
      parsedLines.push({
        content: cleanContent,
        level,
        lineNumber: index + 1
      });
    }
  });
  
  return parsedLines;
};

export const buildMindMapTree = (lines: ParsedLine[]): MindMapNode[] => {
  if (lines.length === 0) return [];
  
  const rootNodes: MindMapNode[] = [];
  const nodeStack: MindMapNode[] = [];
  
  lines.forEach((line) => {
    const node: MindMapNode = {
      id: generateNodeId(),
      label: line.content,
      level: line.level,
      children: [],
      isExpanded: true
    };
    
    // Remove nodes from stack that are at same or deeper level
    while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= line.level) {
      nodeStack.pop();
    }
    
    if (nodeStack.length === 0) {
      // This is a root node
      rootNodes.push(node);
    } else {
      // This is a child node
      const parent = nodeStack[nodeStack.length - 1];
      parent.children.push(node);
      node.parent = parent;
    }
    
    nodeStack.push(node);
  });
  
  return rootNodes;
};

export const parseTextToMindMap = (text: string): MindMapNode[] => {
  const lines = parseTextToLines(text);
  return buildMindMapTree(lines);
};

export const flattenNodes = (nodes: MindMapNode[]): MindMapNode[] => {
  const flattened: MindMapNode[] = [];
  
  const traverse = (nodeList: MindMapNode[]) => {
    nodeList.forEach(node => {
      flattened.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(nodes);
  return flattened;
};

export const searchNodes = (nodes: MindMapNode[], query: string): MindMapNode[] => {
  if (!query.trim()) return [];
  
  const allNodes = flattenNodes(nodes);
  return allNodes.filter(node => 
    node.label.toLowerCase().includes(query.toLowerCase())
  );
};