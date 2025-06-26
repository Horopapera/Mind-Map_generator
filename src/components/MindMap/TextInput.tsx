import React from 'react';
import { FileText, Lightbulb } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const exampleText = `OO7: Senior Site Security Coordinator
  Key Accountabilities:
    • Standardise security policies/procedures
    • Advise stakeholders on risk, compliance, incident response
    • Lead and manage subordinate supervisors/leaders (OO4/OO3)
    • Oversee incident reporting, risk management, and training
    • Chair site committees, conduct post-incident reviews
  Key Results Areas (KRAs):
    • Operational security management and risk mitigation
    • Stakeholder engagement and relationship management
    • Team leadership and capability development
    • Incident management and continuous improvement
    • Training/induction compliance, service level/contract compliance
  Key Tasks/Duties:
    • Develop/implement security protocols
    • Review/escalate incidents and reports
    • Supervise and mentor OO4s/OO3s
    • Deliver and coordinate training and inductions
    • Liaise with senior stakeholders and committees`;

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your structured text here..."
}) => {
  const handleLoadExample = () => {
    onChange(exampleText);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Input Text</span>
        </div>
        <button
          onClick={handleLoadExample}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Lightbulb size={12} />
          Load Example
        </button>
      </div>
      
      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
        />
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Formatting Tips:</div>
          <ul className="space-y-1">
            <li>• Use indentation (2 spaces) to create hierarchy</li>
            <li>• Bullet points (•, -, *) are automatically cleaned</li>
            <li>• Empty lines are ignored</li>
            <li>• Each line becomes a node in your mind map</li>
          </ul>
        </div>
      </div>
    </div>
  );
};