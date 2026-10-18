export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ViewMode = 'original' | 'decoder-only' | 'simplified';

export type ComponentId =
  | 'input-tokens'
  | 'input-embeddings'
  | 'positional-encoding'
  | 'masked-self-attention'
  | 'multi-head-attention'
  | 'add-norm-1'
  | 'feed-forward'
  | 'add-norm-2'
  | 'encoder-attention'
  | 'cross-attention'
  | 'linear-projection'
  | 'softmax-logits'
  | 'output-tokens';

export interface Token {
  id: number;
  text: string;
  index: number;
}

export interface SelfAttentionResult {
  tokens: Token[];
  dHead: number;
  queryIndex: number;
  queries: number[][]; // [T, dHead]
  keys: number[][];    // [T, dHead]
  values: number[][];  // [T, dHead]
  rawScores: number[][]; // [T, T]
  scaledScores: number[][]; // [T, T]
  softmaxWeights: number[][]; // [T, T]
  output: number[][];  // [T, dHead]
}

export interface ComponentInfo {
  id: ComponentId;
  name: string;
  shortDescription: string;
  beginnerExplanation: string;
  intermediateExplanation: string;
  advancedExplanation: string;
  whyNeeded: string;
  formula: string;
  tensorShapes: {
    input: string;
    output: string;
    parameters?: string;
  };
  numericalExample: {
    inputSample: string;
    operationSample: string;
    outputSample: string;
  };
  codeSnippet: string;
}

export interface WalkthroughStep {
  id: number;
  title: string;
  componentId: ComponentId;
  description: string;
  highlightNodes: string[];
}
