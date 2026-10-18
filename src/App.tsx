import React, { useState } from 'react';
import { ComponentId, DifficultyLevel, ViewMode, WalkthroughStep } from './types/transformer';
import { TransformerScene } from './components/3d/TransformerScene';
import { SelfAttentionLab } from './components/lab/SelfAttentionLab';
import { Fallback2DView } from './components/2d/Fallback2DView';
import { ComponentInspector } from './components/code/ComponentInspector';
import { CodeExplorer } from './components/code/CodeExplorer';
import { GuidedWalkthrough } from './components/GuidedWalkthrough';
import {
  Box,
  Grid,
  Monitor,
  GraduationCap,
  Sparkles,
  Info,
  Code2,
  FileText,
  Github,
} from 'lucide-react';

type TabView = '3d-arch' | 'self-attention-lab' | '2d-fallback';

export default function App() {
  const [tabView, setTabView] = useState<TabView>('3d-arch');
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [selectedComponent, setSelectedComponent] = useState<ComponentId>('masked-self-attention');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>(['masked-self-attention']);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'inspector' | 'code'>('inspector');

  const handleWalkthroughStepChange = (step: WalkthroughStep) => {
    setSelectedComponent(step.componentId);
    setHighlightedNodes(step.highlightNodes);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-900">
      {/* Top Research-Lab Header / Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg glow-cyan">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              TRANSFORMER LAB
            </h1>
            <p className="text-[10px] font-mono text-slate-400 -mt-0.5">
              Interactive 3D Neural Architecture Platform
            </p>
          </div>
        </div>

        {/* View Tabs Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setTabView('3d-arch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tabView === '3d-arch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Box className="w-4 h-4 text-cyan-400" /> 3D Architecture
          </button>
          <button
            onClick={() => setTabView('self-attention-lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tabView === 'self-attention-lab'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Grid className="w-4 h-4 text-pink-400" /> 3D Self-Attention Lab
          </button>
          <button
            onClick={() => setTabView('2d-fallback')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tabView === '2d-fallback'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-purple-400" /> 2D Fallback View
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1 text-[11px]">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Depth:
          </span>
          {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-2.5 py-1 rounded-md capitalize font-mono text-[11px] transition-all ${
                difficulty === level
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1800px] w-full mx-auto">
        {/* Left / Main Workspace Area (8 or 12 Cols depending on tab) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Guided Walkthrough Banner */}
          <GuidedWalkthrough
            onStepChange={handleWalkthroughStepChange}
            selectedComponent={selectedComponent}
          />

          {/* Active View Content */}
          <div className="flex-1 min-h-[580px] h-full">
            {tabView === '3d-arch' && (
              <TransformerScene
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedComponent={selectedComponent}
                onSelectComponent={(id) => {
                  setSelectedComponent(id);
                  setHighlightedNodes([id]);
                }}
                highlightedNodes={highlightedNodes}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            )}

            {tabView === 'self-attention-lab' && <SelfAttentionLab />}

            {tabView === '2d-fallback' && (
              <Fallback2DView
                viewMode={viewMode}
                selectedComponent={selectedComponent}
                onSelectComponent={(id) => {
                  setSelectedComponent(id);
                  setHighlightedNodes([id]);
                }}
                highlightedNodes={highlightedNodes}
              />
            )}
          </div>
        </div>

        {/* Right Inspector & Code Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-[580px]">
          {/* Panel Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setInspectorTab('inspector')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                inspectorTab === 'inspector'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" /> Component Inspector
            </button>
            <button
              onClick={() => setInspectorTab('code')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                inspectorTab === 'code'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" /> Code Explorer
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1">
            {inspectorTab === 'inspector' ? (
              <ComponentInspector
                componentId={selectedComponent}
                difficulty={difficulty}
                onOpenCode={() => setInspectorTab('code')}
              />
            ) : (
              <CodeExplorer componentId={selectedComponent} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 px-4 py-2.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
        <div>
          Transformer Lab — Pure TypeScript Mathematical Neural Engine & R3F Visualizer
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>Vaswani et al., 2017 "Attention Is All You Need"</span>
          <span>•</span>
          <span>Vitest Verified</span>
        </div>
      </footer>
    </div>
  );
}
