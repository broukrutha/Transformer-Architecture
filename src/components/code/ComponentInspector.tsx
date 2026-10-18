import React from 'react';
import { ComponentId, DifficultyLevel } from '../../types/transformer';
import { getComponentInfo } from '../../core/transformer/engine';
import { Info, HelpCircle, Variable, Calculator, Layers, FileCode } from 'lucide-react';

interface ComponentInspectorProps {
  componentId: ComponentId;
  difficulty: DifficultyLevel;
  onOpenCode: () => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  componentId,
  difficulty,
  onOpenCode,
}) => {
  const info = getComponentInfo(componentId);

  const getExplanation = () => {
    switch (difficulty) {
      case 'beginner':
        return info.beginnerExplanation;
      case 'intermediate':
        return info.intermediateExplanation;
      case 'advanced':
        return info.advancedExplanation;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-4 text-xs font-mono h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] text-cyan-400 uppercase font-semibold tracking-wider">
            Component Inspector
          </div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            {info.name}
          </h2>
        </div>
        <button
          onClick={onOpenCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 transition-all font-sans font-medium text-xs"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" /> View Source
        </button>
      </div>

      {/* Overview & Purpose */}
      <div className="space-y-2">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> What is it?
          </div>
          <p className="text-slate-200 font-sans leading-relaxed text-xs">
            {getExplanation()}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Why is it needed?
          </div>
          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            {info.whyNeeded}
          </p>
        </div>
      </div>

      {/* Mathematical Formula */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 space-y-1.5">
        <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
          <Calculator className="w-3.5 h-3.5 text-pink-400" /> Mathematical Formula
        </div>
        <div className="p-2 rounded bg-slate-900 font-mono text-cyan-300 text-center font-semibold text-xs border border-slate-800 break-all">
          {info.formula}
        </div>
      </div>

      {/* Tensor Shapes */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-2">
        <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Tensor Shapes
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Input Tensor:</span>
            <span className="text-emerald-300 font-mono">{info.tensorShapes.input}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Output Tensor:</span>
            <span className="text-cyan-300 font-mono">{info.tensorShapes.output}</span>
          </div>
        </div>
        {info.tensorShapes.parameters && (
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
            <span className="text-slate-500 block text-[10px]">Weight Parameters:</span>
            <span className="text-purple-300 font-mono">{info.tensorShapes.parameters}</span>
          </div>
        )}
      </div>

      {/* Numerical Example */}
      {difficulty !== 'beginner' && (
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <Variable className="w-3.5 h-3.5 text-amber-400" /> Numerical Breakdown
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500">Sample Input: </span>
              <span className="text-slate-200 font-mono">{info.numericalExample.inputSample}</span>
            </div>
            <div>
              <span className="text-slate-500">Operation: </span>
              <span className="text-cyan-300 font-mono">{info.numericalExample.operationSample}</span>
            </div>
            <div>
              <span className="text-slate-500">Sample Output: </span>
              <span className="text-pink-300 font-mono">{info.numericalExample.outputSample}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
