import { describe, it, expect } from 'vitest';
import {
  simpleTokenize,
  getDeterministicEmbedding,
  getPositionalEncoding,
  matMul,
  transpose,
  softmaxRow,
  layerNorm,
  feedForward,
  computeSelfAttention,
  getComponentInfo,
} from './engine';

describe('Transformer Engine Core Math', () => {
  it('simpleTokenize splits text correctly', () => {
    const text = 'The student opened the book because it was interesting.';
    const tokens = simpleTokenize(text);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].text).toBe('The');
    expect(tokens[1].text).toBe('student');
    expect(tokens[tokens.length - 1].text).toBe('.');
  });

  it('getDeterministicEmbedding produces reproducible vectors of requested dim', () => {
    const word = 'transformer';
    const dim = 8;
    const vec1 = getDeterministicEmbedding(word, dim);
    const vec2 = getDeterministicEmbedding(word, dim);

    expect(vec1.length).toBe(dim);
    expect(vec1).toEqual(vec2);
    expect(vec1.every((val) => typeof val === 'number' && !isNaN(val))).toBe(true);
  });

  it('getPositionalEncoding computes sinusoidal values', () => {
    const pos = 2;
    const dim = 6;
    const pe = getPositionalEncoding(pos, dim);

    expect(pe.length).toBe(dim);
    // PE(2, 0) = sin(2 / 10000^0) = sin(2) ~ 0.9093
    expect(pe[0]).toBeCloseTo(Math.sin(2), 3);
    // PE(2, 1) = cos(2 / 10000^0) = cos(2) ~ -0.4161
    expect(pe[1]).toBeCloseTo(Math.cos(2), 3);
  });

  it('matMul correctly performs matrix multiplication', () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [5, 6],
      [7, 8],
    ];
    // A x B = [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]] = [[19, 22], [43, 50]]
    const C = matMul(A, B);
    expect(C).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it('transpose correctly transposes a matrix', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const At = transpose(A);
    expect(At).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it('softmaxRow normalizes rows to sum to 1.0', () => {
    const matrix = [
      [1.0, 2.0, 3.0],
      [0.5, 0.5, 0.5],
    ];
    const sm = softmaxRow(matrix);

    const sum1 = sm[0].reduce((a, b) => a + b, 0);
    const sum2 = sm[1].reduce((a, b) => a + b, 0);

    expect(sum1).toBeCloseTo(1.0, 3);
    expect(sum2).toBeCloseTo(1.0, 3);
    expect(sm[1][0]).toBeCloseTo(1 / 3, 3);
  });

  it('layerNorm normalizes mean to 0 and std to 1', () => {
    const vec = [10, 20, 30, 40, 50];
    const norm = layerNorm(vec);

    const mean = norm.reduce((a, b) => a + b, 0) / norm.length;
    expect(mean).toBeCloseTo(0, 3);
  });

  it('feedForward transforms vector dimensions properly', () => {
    const vec = [0.1, 0.2, 0.3, 0.4];
    const out = feedForward(vec, 16);

    expect(out.length).toBe(vec.length);
  });

  it('computeSelfAttention calculates Q, K, V, rawScores, scaledScores, softmaxWeights and output', () => {
    const tokens = simpleTokenize('The student opened the book');
    const dHead = 4;
    const res = computeSelfAttention(tokens, dHead, 0);

    expect(res.tokens.length).toBe(5);
    expect(res.queries.length).toBe(5);
    expect(res.queries[0].length).toBe(dHead);
    expect(res.rawScores.length).toBe(5);
    expect(res.rawScores[0].length).toBe(5);
    expect(res.softmaxWeights.length).toBe(5);

    // Verify row sums in softmaxWeights equal 1.0
    res.softmaxWeights.forEach((row) => {
      const sum = row.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 3);
    });

    expect(res.output.length).toBe(5);
    expect(res.output[0].length).toBe(dHead);
  });

  it('getComponentInfo returns detailed component metadata', () => {
    const info = getComponentInfo('multi-head-attention');
    expect(info.name).toBe('Multi-Head Attention');
    expect(info.formula).toBeDefined();
    expect(info.tensorShapes.input).toBeDefined();
    expect(info.codeSnippet).toBeDefined();
  });
});
