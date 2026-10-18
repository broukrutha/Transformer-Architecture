import { Token, SelfAttentionResult, ComponentInfo, ComponentId, DifficultyLevel } from '../../types/transformer';

/**
 * Tokenize input text using whitespace and punctuation rules.
 */
export function simpleTokenize(text: string): Token[] {
  if (!text || !text.trim()) {
    return [];
  }
  // Split on whitespace or before/after punctuation
  const matches = text.match(/[\w']+|[^\s\w]/g) || [];
  return matches.map((tok, idx) => ({
    id: idx,
    text: tok,
    index: idx,
  }));
}

/**
 * Generate a deterministic continuous embedding vector for a given word.
 */
export function getDeterministicEmbedding(word: string, dim: number = 8): number[] {
  const vector: number[] = new Array(dim);
  const cleanWord = word.toLowerCase();

  for (let i = 0; i < dim; i++) {
    let charSum = 0;
    for (let c = 0; c < cleanWord.length; c++) {
      charSum += cleanWord.charCodeAt(c) * (c + 1) * (i + 1);
    }
    // Sine hash mapped to [-1, 1] range
    const val = Math.sin(charSum * 0.1234 + i * 0.5678);
    vector[i] = parseFloat(val.toFixed(4));
  }
  return vector;
}

/**
 * Standard sinusoidal positional encoding Vaswani et al. (2017)
 * PE(pos, 2i) = sin(pos / 10000^(2i/dim))
 * PE(pos, 2i+1) = cos(pos / 10000^(2i/dim))
 */
export function getPositionalEncoding(pos: number, dim: number = 8): number[] {
  const pe: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    const dimIndex = Math.floor(i / 2);
    const exponent = (2 * dimIndex) / dim;
    const denominator = Math.pow(10000, exponent);
    const angle = pos / denominator;

    if (i % 2 === 0) {
      pe[i] = parseFloat(Math.sin(angle).toFixed(4));
    } else {
      pe[i] = parseFloat(Math.cos(angle).toFixed(4));
    }
  }
  return pe;
}

/**
 * Multiply matrix A [m x n] by matrix B [n x p] -> [m x p]
 */
export function matMul(A: number[][], B: number[][]): number[][] {
  if (!A.length || !B.length) return [];
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error(`Cannot multiply matrix A [${rowsA}x${colsA}] and B [${rowsB}x${colsB}]: dimension mismatch`);
  }

  const result: number[][] = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = parseFloat(sum.toFixed(4));
    }
  }
  return result;
}

/**
 * Transpose matrix A [m x n] -> [n x m]
 */
export function transpose(A: number[][]): number[][] {
  if (!A.length) return [];
  const rows = A.length;
  const cols = A[0].length;
  const result: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = A[i][j];
    }
  }
  return result;
}

/**
 * Compute row-wise Softmax over a 2D matrix
 */
export function softmaxRow(matrix: number[][]): number[][] {
  return matrix.map((row) => {
    const maxVal = Math.max(...row);
    const exps = row.map((x) => Math.exp(x - maxVal));
    const sumExps = exps.reduce((acc, curr) => acc + curr, 0);
    return exps.map((x) => parseFloat((x / (sumExps || 1)).toFixed(4)));
  });
}

/**
 * Apply Layer Normalization to a vector
 */
export function layerNorm(vec: number[], eps: number = 1e-5): number[] {
  if (!vec.length) return [];
  const mean = vec.reduce((a, b) => a + b, 0) / vec.length;
  const variance = vec.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vec.length;
  const std = Math.sqrt(variance + eps);

  return vec.map((v) => parseFloat(((v - mean) / std).toFixed(4)));
}

/**
 * Feed-Forward network simulation (Linear -> ReLU/GELU -> Linear)
 */
export function feedForward(vec: number[], dFf: number = 16): number[] {
  const dModel = vec.length;
  // Deterministic projection W1
  const hidden: number[] = new Array(dFf).fill(0);
  for (let h = 0; h < dFf; h++) {
    let sum = 0;
    for (let i = 0; i < dModel; i++) {
      const w = Math.sin((h + 1) * 0.3 + (i + 1) * 0.7);
      sum += vec[i] * w;
    }
    // ReLU activation
    hidden[h] = Math.max(0, sum);
  }

  // Projection back to dModel
  const out: number[] = new Array(dModel).fill(0);
  for (let i = 0; i < dModel; i++) {
    let sum = 0;
    for (let h = 0; h < dFf; h++) {
      const w = Math.cos((i + 1) * 0.4 + (h + 1) * 0.2);
      sum += hidden[h] * w;
    }
    out[i] = parseFloat(sum.toFixed(4));
  }

  return layerNorm(out);
}

/**
 * Compute Scaled Dot-Product Self Attention across a sequence of tokens
 */
export function computeSelfAttention(
  tokens: Token[],
  dHead: number = 4,
  queryIndex: number = 0
): SelfAttentionResult {
  const T = tokens.length;
  const dEmbed = dHead; // Simplified d_k = dHead

  if (T === 0) {
    return {
      tokens: [],
      dHead,
      queryIndex: 0,
      queries: [],
      keys: [],
      values: [],
      rawScores: [],
      scaledScores: [],
      softmaxWeights: [],
      output: [],
    };
  }

  // 1. Get embedding + positional encoding matrices [T x dHead]
  const X: number[][] = tokens.map((token, pos) => {
    const emb = getDeterministicEmbedding(token.text, dEmbed);
    const pe = getPositionalEncoding(pos, dEmbed);
    return emb.map((v, i) => v + pe[i]);
  });

  // 2. Deterministic weight matrices W_Q, W_K, W_V [dEmbed x dHead]
  const W_Q: number[][] = Array.from({ length: dEmbed }, (_, r) =>
    Array.from({ length: dHead }, (_, c) => Math.sin(r * 0.5 + c * 0.3))
  );
  const W_K: number[][] = Array.from({ length: dEmbed }, (_, r) =>
    Array.from({ length: dHead }, (_, c) => Math.cos(r * 0.4 + c * 0.6))
  );
  const W_V: number[][] = Array.from({ length: dEmbed }, (_, r) =>
    Array.from({ length: dHead }, (_, c) => Math.sin(r * 0.2 + c * 0.8))
  );

  // 3. Q = X * W_Q, K = X * W_K, V = X * W_V
  const Q = matMul(X, W_Q);
  const K = matMul(X, W_K);
  const V = matMul(X, W_V);

  // 4. Raw dot product Q * K^T [T x T]
  const K_T = transpose(K);
  const rawScores = matMul(Q, K_T);

  // 5. Scaled scores: QK^T / sqrt(d_k)
  const scale = Math.sqrt(dHead);
  const scaledScores = rawScores.map((row) =>
    row.map((val) => parseFloat((val / scale).toFixed(4)))
  );

  // 6. Softmax attention weights [T x T]
  const softmaxWeights = softmaxRow(scaledScores);

  // 7. Output aggregation = SoftmaxWeights * V [T x dHead]
  const output = matMul(softmaxWeights, V);

  return {
    tokens,
    dHead,
    queryIndex: Math.min(Math.max(0, queryIndex), T - 1),
    queries: Q,
    keys: K,
    values: V,
    rawScores,
    scaledScores,
    softmaxWeights,
    output,
  };
}

/**
 * Retrieve metadata and mathematical documentation for inspectable components
 */
export function getComponentInfo(id: ComponentId): ComponentInfo {
  const infos: Record<ComponentId, ComponentInfo> = {
    'input-tokens': {
      id: 'input-tokens',
      name: 'Input Tokens',
      shortDescription: 'Converts raw string input into discrete token integer IDs.',
      beginnerExplanation: 'The computer breaks sentences into small word chunks called tokens.',
      intermediateExplanation: 'Text is mapped to vocabulary indices [B, T] using subword or whitespace tokenization.',
      advancedExplanation: 'Discrete sequence X ∈ Z^(B × T) converted to discrete vocabulary integers.',
      whyNeeded: 'Neural networks cannot operate directly on strings; they require numeric identifiers.',
      formula: 'X_{tokens} = tokenize(text)',
      tensorShapes: { input: 'String', output: '[Batch, Sequence_Len]' },
      numericalExample: {
        inputSample: '"The student opened the book"',
        operationSample: 'Lookup ID in Vocabulary dictionary',
        outputSample: '[101, 2304, 2154, 102]',
      },
      codeSnippet: `export function simpleTokenize(text: string): Token[] {
  const matches = text.match(/[\\w']+|[^\\s\\w]/g) || [];
  return matches.map((tok, idx) => ({ id: idx, text: tok, index: idx }));
}`,
    },
    'input-embeddings': {
      id: 'input-embeddings',
      name: 'Token Embeddings',
      shortDescription: 'Maps token IDs into dense continuous vector space.',
      beginnerExplanation: 'Each word is turned into a list of numbers representing its meaning.',
      intermediateExplanation: 'Looks up continuous vectors W_e[token_id] to create embeddings of dimension d_model.',
      advancedExplanation: 'E = Embedding(X) ∈ R^(B × T × d_model), mapping discrete tokens to vector representations.',
      whyNeeded: 'Captures semantic similarity: words with similar meanings have vectors close to each other.',
      formula: 'E = W_emb[X]',
      tensorShapes: { input: '[B, T]', output: '[B, T, d_model]', parameters: '[V, d_model]' },
      numericalExample: {
        inputSample: 'Token "student" (ID 2304)',
        operationSample: 'Embedding lookup in Matrix [V x d_model]',
        outputSample: '[0.412, -0.831, 0.129, 0.954, ...]',
      },
      codeSnippet: `export function getDeterministicEmbedding(word: string, dim: number): number[] {
  const vector = new Array(dim);
  for (let i = 0; i < dim; i++) {
    // Deterministic hash function producing floats in [-1, 1]
    vector[i] = Math.sin(wordCode * 0.1234 + i * 0.5678);
  }
  return vector;
}`,
    },
    'positional-encoding': {
      id: 'positional-encoding',
      name: 'Positional Encoding',
      shortDescription: 'Injects word sequence order into order-agnostic embeddings.',
      beginnerExplanation: 'Adds position information so the model knows which word comes first, second, etc.',
      intermediateExplanation: 'Uses fixed sine & cosine frequencies of different wavelengths added directly to embeddings.',
      advancedExplanation: 'PE_{(pos, 2i)} = sin(pos / 10000^{2i/d_{model}}), PE_{(pos, 2i+1)} = cos(pos / 10000^{2i/d_{model}}).',
      whyNeeded: 'Self-Attention processes all tokens simultaneously without inherent notion of word order.',
      formula: 'X_{pos} = E + PE',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]' },
      numericalExample: {
        inputSample: 'pos = 1, dim = 4',
        operationSample: 'sin(1 / 10000^0), cos(1 / 10000^0)...',
        outputSample: '[0.8415, 0.5403, 0.0100, 0.9999]',
      },
      codeSnippet: `export function getPositionalEncoding(pos: number, dim: number): number[] {
  const pe = new Array(dim);
  for (let i = 0; i < dim; i++) {
    const angle = pos / Math.pow(10000, (2 * Math.floor(i/2)) / dim);
    pe[i] = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
  }
  return pe;
}`,
    },
    'multi-head-attention': {
      id: 'multi-head-attention',
      name: 'Multi-Head Attention',
      shortDescription: 'Allows tokens to focus on different tokens simultaneously across multiple sub-spaces.',
      beginnerExplanation: 'The model looks at how words relate to each other from multiple different angles.',
      intermediateExplanation: 'Projects input into Query, Key, Value heads, calculates scaled dot-product attention per head, then concatenates.',
      advancedExplanation: 'MultiHead(Q,K,V) = Concat(head_1, ..., head_h)W^O where head_i = Attention(QW_i^Q, KW_i^K, VW_i^V).',
      whyNeeded: 'Single-head attention averages information; multi-head enables attending to syntactic and semantic relations in parallel.',
      formula: 'Attention(Q,K,V) = softmax(Q K^T / \\sqrt{d_k}) V',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]', parameters: '[d_model, d_model] x 4' },
      numericalExample: {
        inputSample: 'Q, K ∈ R^(T x d_k)',
        operationSample: 'Softmax((Q @ K.T) / sqrt(d_k)) @ V',
        outputSample: 'Weighted combination vector per token',
      },
      codeSnippet: `export function computeSelfAttention(tokens, dHead, queryIndex) {
  const Q = matMul(X, W_Q);
  const K = matMul(X, W_K);
  const V = matMul(X, W_V);
  const rawScores = matMul(Q, transpose(K));
  const scaled = rawScores.map(row => row.map(v => v / Math.sqrt(dHead)));
  const weights = softmaxRow(scaled);
  return matMul(weights, V);
}`,
    },
    'masked-self-attention': {
      id: 'masked-self-attention',
      name: 'Masked Self-Attention (Causal)',
      shortDescription: 'Ensures predictions for position t depend only on known outputs at positions < t.',
      beginnerExplanation: 'Prevents the model from cheating by looking ahead at future words during training.',
      intermediateExplanation: 'Applies an upper triangular mask filled with -inf before softmax computation.',
      advancedExplanation: 'Mask_{ij} = 0 if j <= i else -\\infty; A = softmax((QK^T / \\sqrt{d_k}) + Mask)V.',
      whyNeeded: 'Essential for autoregressive decoder generation (like GPT) so text is generated token by token.',
      formula: 'MaskedAttention(Q,K,V) = softmax((Q K^T / \\sqrt{d_k}) + M) V',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]' },
      numericalExample: {
        inputSample: 'Raw Score Matrix [T x T]',
        operationSample: 'Set upper-triangle above main diagonal to -inf',
        outputSample: 'Causal triangular attention heatmap matrix',
      },
      codeSnippet: `// Causal mask applied to dot products
for (let i = 0; i < T; i++) {
  for (let j = i + 1; j < T; j++) {
    scaledScores[i][j] = -Infinity;
  }
}`,
    },
    'add-norm-1': {
      id: 'add-norm-1',
      name: 'Residual Add & LayerNorm',
      shortDescription: 'Adds skip-connection input and normalizes features across hidden dimensions.',
      beginnerExplanation: 'Combines the new attention result with original input and keeps numbers stable.',
      intermediateExplanation: 'Computes LayerNorm(X + Sublayer(X)) to prevent vanishing gradients and stabilize learning.',
      advancedExplanation: 'y = LayerNorm(x + SubLayer(x)), where LN(x) = (x - \\mu) / \\sqrt{\\sigma^2 + \\epsilon} \\cdot \\gamma + \\beta.',
      whyNeeded: 'Residual connections allow gradients to flow unimpeded through hundreds of layers.',
      formula: 'Output = LayerNorm(X + Attention(X))',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]' },
      numericalExample: {
        inputSample: 'x = [1.2, -0.5], attn = [0.1, 0.3]',
        operationSample: 'x + attn = [1.3, -0.2] -> normalize mean=0, std=1',
        outputSample: '[1.0, -1.0]',
      },
      codeSnippet: `export function layerNorm(vec: number[], eps: number = 1e-5): number[] {
  const mean = vec.reduce((a, b) => a + b, 0) / vec.length;
  const std = Math.sqrt(vec.reduce((a, b) => a + (b - mean)**2, 0) / vec.length + eps);
  return vec.map(v => (v - mean) / std);
}`,
    },
    'feed-forward': {
      id: 'feed-forward',
      name: 'Position-wise Feed-Forward Network',
      shortDescription: 'Two linear transformations with non-linear activation applied to each token.',
      beginnerExplanation: 'Processes each word individually through a mini neural network to refine facts.',
      intermediateExplanation: 'Projects features from d_model -> d_ff (usually 4x d_model) with ReLU/GELU activation, then back to d_model.',
      advancedExplanation: 'FFN(x) = max(0, x W_1 + b_1) W_2 + b_2.',
      whyNeeded: 'Introduces non-linearity and acts as key-value memory store for factual knowledge in LLMs.',
      formula: 'FFN(x) = max(0, x W_1 + b_1) W_2 + b_2',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]', parameters: '[d_model, d_ff] & [d_ff, d_model]' },
      numericalExample: {
        inputSample: 'vec = [0.5, -0.2]',
        operationSample: 'Linear(d_model -> 4*d_model) -> ReLU -> Linear(4*d_model -> d_model)',
        outputSample: '[0.84, 0.12]',
      },
      codeSnippet: `export function feedForward(vec: number[], dFf: number = 16): number[] {
  const hidden = W1.map(row => Math.max(0, dot(vec, row)));
  return W2.map(row => dot(hidden, row));
}`,
    },
    'add-norm-2': {
      id: 'add-norm-2',
      name: 'Residual Add & LayerNorm #2',
      shortDescription: 'Residual connection and normalization following the Feed-Forward sublayer.',
      beginnerExplanation: 'Combines FFN result with previous sublayer output and normalizes.',
      intermediateExplanation: 'LayerNorm(X_attn + FFN(X_attn)) stabilizes deeper network representations.',
      advancedExplanation: 'y = LayerNorm(x_{attn} + FFN(x_{attn})).',
      whyNeeded: 'Sustains signal amplitude and smooths optimization landscapes in multi-layer Transformers.',
      formula: 'Output = LayerNorm(X_{attn} + FFN(X_{attn}))',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, d_model]' },
      numericalExample: {
        inputSample: 'Input and FFN vectors',
        operationSample: 'Add elementwise and compute mean/variance normalization',
        outputSample: 'Normalized vector [B, T, d_model]',
      },
      codeSnippet: `const out = layerNorm(addVectors(attnOut, ffnOut));`,
    },
    'cross-attention': {
      id: 'cross-attention',
      name: 'Encoder-Decoder Cross-Attention',
      shortDescription: 'Decoder queries attend to Key-Value representations from the Encoder.',
      beginnerExplanation: 'Connects the translation output to the original input sentence.',
      intermediateExplanation: 'Queries come from the Decoder sequence; Keys and Values come from the Encoder final output.',
      advancedExplanation: 'CrossAttn = Softmax(Q_{dec} K_{enc}^T / \\sqrt{d_k}) V_{enc}.',
      whyNeeded: 'Allows seq2seq models (e.g. translation, summarization) to condition output generation on source sequence.',
      formula: 'CrossAttention(Q_{dec}, K_{enc}, V_{enc}) = softmax(Q_{dec} K_{enc}^T / \\sqrt{d_k}) V_{enc}',
      tensorShapes: { input: 'Decoder [B, T_{dec}, d], Encoder [B, T_{enc}, d]', output: '[B, T_{dec}, d_model]' },
      numericalExample: {
        inputSample: 'Target Queries [T_dec x d], Source Keys/Values [T_enc x d]',
        operationSample: 'Cross dot product between decoder target and encoder source',
        outputSample: 'Source-conditioned decoder representation',
      },
      codeSnippet: `const Q_dec = matMul(X_decoder, W_Q);
const K_enc = matMul(X_encoder, W_K);
const V_enc = matMul(X_encoder, W_V);
return computeAttention(Q_dec, K_enc, V_enc);`,
    },
    'encoder-attention': {
      id: 'encoder-attention',
      name: 'Encoder Self-Attention',
      shortDescription: 'Bidirectional self-attention allowing source tokens to attend to all other source tokens.',
      beginnerExplanation: 'Reads the entire input sentence at once to understand context.',
      intermediateExplanation: 'Unmasked self-attention across input sequence, building rich context-aware embeddings.',
      advancedExplanation: 'Attention(Q, K, V) over all positions i, j in source sequence.',
      whyNeeded: 'Creates contextualized representations where each token incorporates context from both directions.',
      formula: 'EncSelfAttn = softmax(Q K^T / \\sqrt{d_k}) V',
      tensorShapes: { input: '[B, T_{src}, d_model]', output: '[B, T_{src}, d_model]' },
      numericalExample: {
        inputSample: 'Source text tokens',
        operationSample: 'Full bidirectional attention grid',
        outputSample: 'Contextual source encodings',
      },
      codeSnippet: `const encSelfAttn = computeSelfAttention(encoderTokens, dHead);`,
    },
    'linear-projection': {
      id: 'linear-projection',
      name: 'Linear Head (Vocabulary Projection)',
      shortDescription: 'Projects hidden state dimension d_model to vocabulary size V.',
      beginnerExplanation: 'Turns high-dimensional vectors back into scores for every word in the dictionary.',
      intermediateExplanation: 'Linear transformation logits = X · W_vocab + b, mapping [B, T, d_model] to [B, T, V].',
      advancedExplanation: 'Logits Z = H W_{vocab} + b, where W_{vocab} ∈ R^(d_model × V).',
      whyNeeded: 'Prepares logits for each possible token in the vocabulary.',
      formula: 'Logits = H W_{vocab} + b',
      tensorShapes: { input: '[B, T, d_model]', output: '[B, T, Vocab_Size]', parameters: '[d_model, Vocab_Size]' },
      numericalExample: {
        inputSample: 'Vector dim 512',
        operationSample: 'Matrix multiply by [512 x 50257] vocabulary matrix',
        outputSample: 'Logit scores for 50,257 dictionary words',
      },
      codeSnippet: `const logits = matMul(finalHiddenStates, W_vocab);`,
    },
    'softmax-logits': {
      id: 'softmax-logits',
      name: 'Softmax Next-Token Probabilities',
      shortDescription: 'Converts raw logit scores into a normalized probability distribution over vocabulary.',
      beginnerExplanation: 'Turns scores into percentages so the highest probability word can be picked.',
      intermediateExplanation: 'P(w_i) = exp(z_i) / sum(exp(z_j)), producing values between 0 and 1 summing to 1.0.',
      advancedExplanation: 'P(Y_t | Y_{<t}, X) = Softmax(Z_t / T_temp), sampled or greedy argmax.',
      whyNeeded: 'Yields calibrated probabilities for sampling next token or computing cross-entropy loss.',
      formula: 'P(y_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}',
      tensorShapes: { input: '[B, T, Vocab_Size]', output: '[B, T, Vocab_Size]' },
      numericalExample: {
        inputSample: 'Logits: [2.1, 1.0, -0.5]',
        operationSample: 'e^z / sum(e^z)',
        outputSample: 'Probabilities: [0.71, 0.24, 0.05]',
      },
      codeSnippet: `export function softmaxRow(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const exps = row.map(x => Math.exp(x - Math.max(...row)));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  });
}`,
    },
    'output-tokens': {
      id: 'output-tokens',
      name: 'Predicted Next Token',
      shortDescription: 'Selects the top-1 token or samples from output distribution.',
      beginnerExplanation: 'The final chosen word predicted by the Transformer!',
      intermediateExplanation: 'Argmax selection or nucleus top-p sampling generates the next output token.',
      advancedExplanation: 'y_t = \\text{argmax}_{k} P(y_t = k | y_{<t}).',
      whyNeeded: 'Completes the autoregressive iteration cycle to build the output response step by step.',
      formula: 'y_{next} = \\text{argmax}(P(Y))',
      tensorShapes: { input: '[B, Vocab_Size]', output: 'Token String' },
      numericalExample: {
        inputSample: 'Probabilities: ["interesting": 0.82, "boring": 0.05...]',
        operationSample: 'Select maximum probability index',
        outputSample: '"interesting"',
      },
      codeSnippet: `const nextToken = vocab[argmax(probabilities)];`,
    },
  };

  return infos[id] || infos['input-tokens'];
}
