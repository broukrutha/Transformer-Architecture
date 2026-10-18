import { ComponentId, ViewMode } from '../../types/transformer';

export interface NodeLayout {
  id: ComponentId;
  label: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  category: 'input' | 'attention' | 'ffn' | 'norm' | 'output';
}

export interface CableConnection {
  from: ComponentId;
  to: ComponentId;
  color?: string;
  isCrossBridge?: boolean;
}

export function getLayoutNodes(viewMode: ViewMode): NodeLayout[] {
  if (viewMode === 'original') {
    return [
      // ENCODER STACK (Left, X = -3.5)
      {
        id: 'input-tokens',
        label: 'Source Tokens',
        position: [-3.5, -6, 0],
        size: [2.2, 0.7, 1.2],
        color: '#06b6d4',
        category: 'input',
      },
      {
        id: 'input-embeddings',
        label: 'Input Embedding',
        position: [-3.5, -4.5, 0],
        size: [2.4, 0.8, 1.2],
        color: '#3b82f6',
        category: 'input',
      },
      {
        id: 'positional-encoding',
        label: 'Positional Encoding',
        position: [-3.5, -3, 0],
        size: [2.4, 0.8, 1.2],
        color: '#8b5cf6',
        category: 'input',
      },
      {
        id: 'encoder-attention',
        label: 'Encoder Multi-Head Attn',
        position: [-3.5, -1.2, 0],
        size: [2.8, 1.0, 1.4],
        color: '#ec4899',
        category: 'attention',
      },
      {
        id: 'add-norm-1',
        label: 'Add & LayerNorm',
        position: [-3.5, 0.5, 0],
        size: [2.2, 0.7, 1.2],
        color: '#10b981',
        category: 'norm',
      },
      {
        id: 'feed-forward',
        label: 'Feed Forward',
        position: [-3.5, 2.2, 0],
        size: [2.6, 0.9, 1.3],
        color: '#f59e0b',
        category: 'ffn',
      },
      {
        id: 'add-norm-2',
        label: 'Add & LayerNorm (Enc Out)',
        position: [-3.5, 3.8, 0],
        size: [2.5, 0.8, 1.2],
        color: '#10b981',
        category: 'norm',
      },

      // DECODER STACK (Right, X = 3.5)
      {
        id: 'masked-self-attention',
        label: 'Masked Multi-Head Attn',
        position: [3.5, -1.2, 0],
        size: [2.8, 1.0, 1.4],
        color: '#f43f5e',
        category: 'attention',
      },
      {
        id: 'cross-attention',
        label: 'Encoder-Decoder Cross Attn',
        position: [3.5, 1.5, 0],
        size: [3.0, 1.1, 1.5],
        color: '#a855f7',
        category: 'attention',
      },
      {
        id: 'linear-projection',
        label: 'Linear Projection',
        position: [3.5, 4.2, 0],
        size: [2.6, 0.8, 1.2],
        color: '#0284c7',
        category: 'output',
      },
      {
        id: 'softmax-logits',
        label: 'Softmax Logits',
        position: [3.5, 5.8, 0],
        size: [2.4, 0.8, 1.2],
        color: '#14b8a6',
        category: 'output',
      },
      {
        id: 'output-tokens',
        label: 'Predicted Output Token',
        position: [3.5, 7.3, 0],
        size: [2.6, 0.8, 1.2],
        color: '#10b981',
        category: 'output',
      },
    ];
  }

  if (viewMode === 'decoder-only') {
    return [
      {
        id: 'input-tokens',
        label: 'Input Tokens',
        position: [0, -5, 0],
        size: [2.6, 0.8, 1.2],
        color: '#06b6d4',
        category: 'input',
      },
      {
        id: 'input-embeddings',
        label: 'Token Embeddings',
        position: [0, -3.5, 0],
        size: [2.8, 0.8, 1.2],
        color: '#3b82f6',
        category: 'input',
      },
      {
        id: 'positional-encoding',
        label: 'Positional Encoding',
        position: [0, -2, 0],
        size: [2.8, 0.8, 1.2],
        color: '#8b5cf6',
        category: 'input',
      },
      {
        id: 'masked-self-attention',
        label: 'Masked Multi-Head Attention',
        position: [0, -0.2, 0],
        size: [3.2, 1.1, 1.5],
        color: '#ec4899',
        category: 'attention',
      },
      {
        id: 'add-norm-1',
        label: 'Add & LayerNorm #1',
        position: [0, 1.6, 0],
        size: [2.6, 0.8, 1.2],
        color: '#10b981',
        category: 'norm',
      },
      {
        id: 'feed-forward',
        label: 'Feed Forward Network',
        position: [0, 3.2, 0],
        size: [3.0, 1.0, 1.4],
        color: '#f59e0b',
        category: 'ffn',
      },
      {
        id: 'add-norm-2',
        label: 'Add & LayerNorm #2',
        position: [0, 4.8, 0],
        size: [2.6, 0.8, 1.2],
        color: '#10b981',
        category: 'norm',
      },
      {
        id: 'linear-projection',
        label: 'Linear Head',
        position: [0, 6.4, 0],
        size: [2.8, 0.8, 1.2],
        color: '#0284c7',
        category: 'output',
      },
      {
        id: 'softmax-logits',
        label: 'Softmax Probabilities',
        position: [0, 7.9, 0],
        size: [2.8, 0.8, 1.2],
        color: '#14b8a6',
        category: 'output',
      },
      {
        id: 'output-tokens',
        label: 'Next Token Prediction',
        position: [0, 9.4, 0],
        size: [2.8, 0.8, 1.2],
        color: '#10b981',
        category: 'output',
      },
    ];
  }

  // Simplified view
  return [
    {
      id: 'input-tokens',
      label: 'Stage 1: Tokens & Embedding',
      position: [-5, 0, 0],
      size: [3.2, 1.8, 1.5],
      color: '#06b6d4',
      category: 'input',
    },
    {
      id: 'multi-head-attention',
      label: 'Stage 2: Self-Attention Context',
      position: [0, 0, 0],
      size: [3.6, 2.2, 1.8],
      color: '#ec4899',
      category: 'attention',
    },
    {
      id: 'output-tokens',
      label: 'Stage 3: Next Token Prediction',
      position: [5, 0, 0],
      size: [3.2, 1.8, 1.5],
      color: '#10b981',
      category: 'output',
    },
  ];
}

export function getCableConnections(viewMode: ViewMode): CableConnection[] {
  if (viewMode === 'original') {
    return [
      { from: 'input-tokens', to: 'input-embeddings' },
      { from: 'input-embeddings', to: 'positional-encoding' },
      { from: 'positional-encoding', to: 'encoder-attention' },
      { from: 'encoder-attention', to: 'add-norm-1' },
      { from: 'add-norm-1', to: 'feed-forward' },
      { from: 'feed-forward', to: 'add-norm-2' },
      // Cross attention bridge from Encoder Output (add-norm-2) to Cross Attention in Decoder!
      { from: 'add-norm-2', to: 'cross-attention', color: '#a855f7', isCrossBridge: true },
      { from: 'masked-self-attention', to: 'cross-attention' },
      { from: 'cross-attention', to: 'linear-projection' },
      { from: 'linear-projection', to: 'softmax-logits' },
      { from: 'softmax-logits', to: 'output-tokens' },
    ];
  }

  if (viewMode === 'decoder-only') {
    return [
      { from: 'input-tokens', to: 'input-embeddings' },
      { from: 'input-embeddings', to: 'positional-encoding' },
      { from: 'positional-encoding', to: 'masked-self-attention' },
      { from: 'masked-self-attention', to: 'add-norm-1' },
      { from: 'add-norm-1', to: 'feed-forward' },
      { from: 'feed-forward', to: 'add-norm-2' },
      { from: 'add-norm-2', to: 'linear-projection' },
      { from: 'linear-projection', to: 'softmax-logits' },
      { from: 'softmax-logits', to: 'output-tokens' },
    ];
  }

  return [
    { from: 'input-tokens', to: 'multi-head-attention' },
    { from: 'multi-head-attention', to: 'output-tokens' },
  ];
}
