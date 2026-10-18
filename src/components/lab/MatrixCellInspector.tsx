import React from 'react';
import { SelfAttentionResult } from '../../types/transformer';
import { Calculator, X } from 'lucide-react';

interface MatrixCellInspectorProps {
  attentionResult: SelfAttentionResult;
  selectedCell: { row: number; col: number } | null;
  onClose: () => void;
}

export const MatrixCellInspector: React.FC<MatrixCellInspectorProps> = ({
  attentionResult,
  selectedCell,
  onClose,
}) => {
  if (!selectedCell) return null;

  const { row, col } = selectedCell;
  const { tokens, dHead, queries, keys, rawScores, scaledScores, softmaxWeights } = attentionResult;

  const queryToken = tokens[row];
  const keyToken = tokens[col];

  if (!queryToken || !keyToken) return null;

  const qVec = queries[row] || [];
  const kVec = keys[col] || [];
  const rawScore = rawScores[row]?.[col] ?? 0;
  const scaledScore = scaledScores[row]?.[col] ?? 0;
  const softmaxWeight = softmaxWeights[row]?.[col] ?? 0;
  const scaleFactor = Math.sqrt(dHead).toFixed(2);

  return (
    <div className="glass-panel-accent p-4 rounded-xl border border-cyan-500/30 text-xs font-mono space-y-3 shadow-2xl relative animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm border-b border-slate-800 pb-2">
        <Calculator className="w-4 h-4 text-cyan-400" />
        Step-by-Step Matrix Math Inspection: Cell [{row}, {col}]
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-[11px] mb-1">
            Query Token Q[{row}]: <span className="text-pink-400 font-bold">"{queryToken.text}"</span>
          </div>
          <div className="text-[11px] text-cyan-300 font-mono break-all">
            [{qVec.map((v) => v.toFixed(3)).join(', ')}]
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-[11px] mb-1">
            Key Token K[{col}]: <span className="text-cyan-400 font-bold">"{keyToken.text}"</span>
          </div>
          <div className="text-[11px] text-purple-300 font-mono break-all">
            [{kVec.map((v) => v.toFixed(3)).join(', ')}]
          </div>
        </div>
      </div>

      {/* Numerical Computation Pipeline */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span>1. Raw Dot Product (Q · K^T):</span>
          <span className="font-bold text-amber-400">{rawScore.toFixed(4)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span>2. Scaling Factor (√d_k = √{dHead}):</span>
          <span className="font-bold text-slate-400">{scaleFactor}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span>3. Scaled Score (Raw / √d_k):</span>
          <span className="font-bold text-cyan-300">{scaledScore.toFixed(4)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-200 border-t border-slate-800 pt-2 font-semibold">
          <span className="text-pink-400">4. Softmax Attention Weight A_{row},{col}:</span>
          <span className="text-pink-300 text-sm font-bold bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/40">
            {(softmaxWeight * 100).toFixed(1)}% ({softmaxWeight.toFixed(4)})
          </span>
        </div>
      </div>
    </div>
  );
};
