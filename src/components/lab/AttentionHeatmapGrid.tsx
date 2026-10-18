import React, { useState } from 'react';
import { SelfAttentionResult } from '../../types/transformer';
import { Grid, Layers } from 'lucide-react';

interface AttentionHeatmapGridProps {
  attentionResult: SelfAttentionResult;
  selectedCell: { row: number; col: number } | null;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  hoveredCell: { row: number; col: number } | null;
  setHoveredCell: (cell: { row: number; col: number } | null) => void;
  queryIndex: number;
  setQueryIndex: (idx: number) => void;
}

type Mode = 'softmax' | 'scaled' | 'raw';

export const AttentionHeatmapGrid: React.FC<AttentionHeatmapGridProps> = ({
  attentionResult,
  selectedCell,
  setSelectedCell,
  hoveredCell,
  setHoveredCell,
  queryIndex,
  setQueryIndex,
}) => {
  const [mode, setMode] = useState<Mode>('softmax');
  const { tokens, softmaxWeights, scaledScores, rawScores } = attentionResult;

  const getMatrixData = () => {
    switch (mode) {
      case 'softmax':
        return softmaxWeights;
      case 'scaled':
        return scaledScores;
      case 'raw':
        return rawScores;
    }
  };

  const matrix = getMatrixData();

  const getBgColor = (val: number, rowIdx: number, colIdx: number) => {
    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
    const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
    const isRowSelected = rowIdx === queryIndex;

    if (isSelected) return 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300';
    if (isHovered) return 'bg-pink-500 text-slate-950 font-bold ring-2 ring-pink-300';

    if (mode === 'softmax') {
      const alpha = Math.min(1, Math.max(0.05, val));
      if (isRowSelected) {
        return `rgba(236, 72, 153, ${Math.max(0.2, alpha)})`;
      }
      return `rgba(6, 182, 212, ${Math.max(0.08, alpha)})`;
    } else {
      return isRowSelected ? 'rgba(236, 72, 153, 0.25)' : 'rgba(30, 41, 59, 0.7)';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
      {/* Heatmap Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Grid className="w-4 h-4 text-cyan-400" />
          Synchronized 2D Attention Heatmap
        </div>

        {/* Matrix Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px] px-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" /> Values:
          </span>
          <button
            onClick={() => setMode('softmax')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mode === 'softmax'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Softmax (A)
          </button>
          <button
            onClick={() => setMode('scaled')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mode === 'scaled'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scaled (QK^T / √d_k)
          </button>
          <button
            onClick={() => setMode('raw')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mode === 'raw'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Scores (QK^T)
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500 font-normal border-b border-slate-800/60 min-w-[100px]">
                Query \ Key
              </th>
              {tokens.map((tok, cIdx) => (
                <th
                  key={`th-${tok.id}`}
                  className={`p-2 text-center border-b border-slate-800/60 min-w-[70px] ${
                    hoveredCell?.col === cIdx ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <div className="truncate max-w-[75px]" title={tok.text}>
                    {tok.text}
                  </div>
                  <div className="text-[10px] text-slate-600">k_{cIdx}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((qTok, rIdx) => {
              const isSelectedRow = queryIndex === rIdx;
              return (
                <tr key={`tr-${qTok.id}`} className={isSelectedRow ? 'bg-slate-900/40' : ''}>
                  {/* Row Header */}
                  <td
                    onClick={() => setQueryIndex(rIdx)}
                    className={`p-2 cursor-pointer transition-all border-r border-slate-800/60 ${
                      isSelectedRow
                        ? 'text-pink-400 font-bold bg-pink-950/30 border-l-2 border-l-pink-500'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">q_{rIdx}</span>
                      <span className="truncate max-w-[80px]" title={qTok.text}>
                        {qTok.text}
                      </span>
                    </div>
                  </td>

                  {/* Matrix Cells */}
                  {tokens.map((kTok, cIdx) => {
                    const val = matrix[rIdx]?.[cIdx] ?? 0;
                    const bgStyle = getBgColor(val, rIdx, cIdx);

                    return (
                      <td
                        key={`cell-${rIdx}-${cIdx}`}
                        onClick={() => {
                          setQueryIndex(rIdx);
                          setSelectedCell({ row: rIdx, col: cIdx });
                        }}
                        onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="p-1 text-center cursor-pointer transition-all duration-150 border border-slate-800/30"
                      >
                        <div
                          className="py-2 px-1 rounded transition-all text-[11px] font-mono select-none"
                          style={{
                            backgroundColor:
                              typeof bgStyle === 'string' && bgStyle.startsWith('rgba')
                                ? bgStyle
                                : undefined,
                          }}
                        >
                          <span
                            className={
                              typeof bgStyle === 'string' && !bgStyle.startsWith('rgba')
                                ? bgStyle
                                : 'text-slate-200'
                            }
                          >
                            {mode === 'softmax' ? (val * 100).toFixed(0) + '%' : val.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
