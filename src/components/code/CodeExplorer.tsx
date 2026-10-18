import React, { useState } from 'react';
import { ComponentId } from '../../types/transformer';
import { getComponentInfo } from '../../core/transformer/engine';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';

interface CodeExplorerProps {
  componentId: ComponentId;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ componentId }) => {
  const [copied, setCopied] = useState(false);
  const info = getComponentInfo(componentId);

  const handleCopy = () => {
    navigator.clipboard.writeText(info.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Source Code Mapping</span>
            <span className="text-slate-200 font-bold text-sm">src/core/transformer/engine.ts</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-all border border-slate-700 text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Snippet
            </>
          )}
        </button>
      </div>

      <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
        <span>Mapped Function for <strong className="text-cyan-300">{info.name}</strong></span>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          TypeScript Pure Engine <ExternalLink className="w-3 h-3" />
        </span>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 bg-[#060911] rounded-xl p-4 border border-slate-800/90 overflow-x-auto overflow-y-auto text-slate-200 leading-relaxed font-mono text-[12px] shadow-inner">
        <pre className="text-cyan-100">
          <code>{info.codeSnippet}</code>
        </pre>
      </div>
    </div>
  );
};
