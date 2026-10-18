import React, { useEffect, useState } from 'react';
import { ComponentId, WalkthroughStep } from '../types/transformer';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Compass } from 'lucide-react';

interface GuidedWalkthroughProps {
  onStepChange: (step: WalkthroughStep) => void;
  selectedComponent: ComponentId | null;
}

const steps: WalkthroughStep[] = [
  {
    id: 1,
    title: '1. Input Tokenization',
    componentId: 'input-tokens',
    description: 'Raw input string is split into discrete token integers using subword vocabulary indices.',
    highlightNodes: ['input-tokens'],
  },
  {
    id: 2,
    title: '2. Token Embeddings',
    componentId: 'input-embeddings',
    description: 'Token integers are looked up in embedding matrix W_e to generate dense semantic vectors in d_model dimension.',
    highlightNodes: ['input-embeddings'],
  },
  {
    id: 3,
    title: '3. Positional Encoding',
    componentId: 'positional-encoding',
    description: 'Sinusoidal positional encoding vectors are added to inject word order information into order-agnostic embeddings.',
    highlightNodes: ['positional-encoding'],
  },
  {
    id: 4,
    title: '4. Multi-Head Self-Attention',
    componentId: 'masked-self-attention',
    description: 'Queries, Keys, and Values are projected. Scaled dot-product QK^T / √d_k calculates attention weights across sequence.',
    highlightNodes: ['masked-self-attention', 'encoder-attention'],
  },
  {
    id: 5,
    title: '5. Residual Add & LayerNorm',
    componentId: 'add-norm-1',
    description: 'Residual skip-connection adds input back to sublayer output, then LayerNorm stabilizes gradient variance.',
    highlightNodes: ['add-norm-1'],
  },
  {
    id: 6,
    title: '6. Feed Forward Network',
    componentId: 'feed-forward',
    description: 'Each token is independently processed through two linear layers with ReLU/GELU activation acting as factual knowledge lookup.',
    highlightNodes: ['feed-forward'],
  },
  {
    id: 7,
    title: '7. Linear Vocabulary Projection',
    componentId: 'linear-projection',
    description: 'Final hidden state is projected from hidden dimension d_model up to total vocabulary size V to compute raw unnormalized logits.',
    highlightNodes: ['linear-projection'],
  },
  {
    id: 8,
    title: '8. Softmax & Next-Token Selection',
    componentId: 'softmax-logits',
    description: 'Softmax exponentiation produces calibrated probability distribution for picking the highest probability next token.',
    highlightNodes: ['softmax-logits', 'output-tokens'],
  },
];

export const GuidedWalkthrough: React.FC<GuidedWalkthroughProps> = ({
  onStepChange,
  selectedComponent,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const currentStep = steps[currentStepIdx];

  useEffect(() => {
    onStepChange(currentStep);
  }, [currentStepIdx]);

  // Autoplay step timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => (prev + 1) % steps.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  const handleNext = () => {
    setCurrentStepIdx((prev) => (prev + 1) % steps.length);
  };

  return (
    <div className="glass-panel-accent p-3.5 rounded-xl border border-cyan-500/30 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Guided Architecture Walkthrough
          </span>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            Step {currentStepIdx + 1} of {steps.length}
          </span>
        </div>

        {/* Walkthrough Play / Nav Controls */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Tour
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Auto Tour
              </>
            )}
          </button>
          <button
            onClick={handlePrev}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
        {steps.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => setCurrentStepIdx(idx)}
            className={`h-full flex-1 cursor-pointer transition-all duration-300 ${
              idx === currentStepIdx
                ? 'bg-cyan-400 glow-cyan'
                : idx < currentStepIdx
                ? 'bg-cyan-700/60'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Step Description */}
      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
        <div>
          <div className="font-bold text-cyan-300 font-mono">{currentStep.title}</div>
          <p className="text-slate-300 font-sans mt-0.5 text-[11px] leading-relaxed">
            {currentStep.description}
          </p>
        </div>
      </div>
    </div>
  );
};
