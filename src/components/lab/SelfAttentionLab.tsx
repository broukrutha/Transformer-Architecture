import React, { useState, useMemo } from 'react';
import { simpleTokenize, computeSelfAttention } from '../../core/transformer/engine';
import { SpatialAttention3D } from './SpatialAttention3D';
import { AttentionHeatmapGrid } from './AttentionHeatmapGrid';
import { MatrixCellInspector } from './MatrixCellInspector';
import { Type, Sparkles, RefreshCw } from 'lucide-react';

export const SelfAttentionLab: React.FC = () => {
  const [text, setText] = useState('The student opened the book because it was interesting.');
  const [dHead, setDHead] = useState(8);
  const [queryIndex, setQueryIndex] = useState(0);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 2,
  });
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const presets = [
    'The student opened the book because it was interesting.',
    'Language models learn contextual attention representations.',
    'Attention is all you need for transformers.',
  ];

  // Tokenize & Compute Pure TS Self Attention Engine
  const tokens = useMemo(() => simpleTokenize(text), [text]);

  const attentionResult = useMemo(
    () => computeSelfAttention(tokens, dHead, queryIndex),
    [tokens, dHead, queryIndex]
  );

  return (
    <div className="w-full space-y-4 text-slate-100">
      {/* Interactive Sentence Input Controls */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Type className="w-4 h-4 text-cyan-400" /> Interactive Input Sentence
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Tokens: <strong className="text-cyan-300">{tokens.length}</strong></span>
            <span>•</span>
            <span>Head Dimension (d_k):</span>
            <select
              value={dHead}
              onChange={(e) => setDHead(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2 py-0.5 text-xs font-mono"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setQueryIndex(0);
              setSelectedCell(null);
            }}
            placeholder="Type any sentence here..."
            className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
          <button
            onClick={() => {
              setText('The student opened the book because it was interesting.');
              setQueryIndex(0);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all"
            title="Reset default sentence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Sentences */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400" /> Examples:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(preset);
                setQueryIndex(0);
                setSelectedCell(null);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-[11px] truncate max-w-[280px] transition-all"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>

      {/* 3D Spatial Attention Visualizer */}
      <SpatialAttention3D
        attentionResult={attentionResult}
        queryIndex={queryIndex}
        setQueryIndex={setQueryIndex}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
      />

      {/* Synchronized 2D Attention Heatmap Matrix */}
      <AttentionHeatmapGrid
        attentionResult={attentionResult}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
        queryIndex={queryIndex}
        setQueryIndex={setQueryIndex}
      />

      {/* Step-by-Step Matrix Cell Mathematical Inspector */}
      {selectedCell && (
        <MatrixCellInspector
          attentionResult={attentionResult}
          selectedCell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};
