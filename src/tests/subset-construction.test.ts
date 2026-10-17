import { describe, it, expect } from 'vitest';
import { 
  convertNfaToDfa, 
  computeEpsilonClosure, 
  formatSubset, 
  TRAP_STATE_NAME 
} from '../simulators/nfa-dfa/subset-construction';
import { simulateStringOnNfaAndDfa } from '../simulators/nfa-dfa/simulator';
import { NFA_EXAMPLES } from '../simulators/nfa-dfa/examples';
import type { NFADefinition } from '../types/automata';
import { EPSILON } from '../types/automata';

describe('Subset Construction Algorithm & Automata Simulator', () => {
  it('correctly converts "ends-with-1" NFA to DFA', () => {
    const nfa = NFA_EXAMPLES.find(e => e.id === 'ends-with-1')!;
    const { dfa, steps } = convertNfaToDfa(nfa);

    // Initial state is {q0}
    expect(dfa.initialState).toBe('{q0}');
    expect(steps.length).toBeGreaterThan(0);

    // DFA must have 2 reachable states: {q0} and {q0, q1}
    expect(dfa.states).toContain('{q0}');
    expect(dfa.states).toContain('{q0, q1}');
    expect(dfa.states.length).toBe(2);

    // Accepting states must only be subsets containing q1 -> {q0, q1}
    expect(dfa.acceptStates).toEqual(['{q0, q1}']);

    // Check transition completeness
    for (const state of dfa.states) {
      for (const symbol of dfa.alphabet) {
        const trans = dfa.transitions.filter(t => t.fromSubset === state && t.symbol === symbol);
        expect(trans.length).toBe(1);
      }
    }
  });

  it('correctly computes epsilon-closure', () => {
    const epsNFA: NFADefinition = {
      id: 'eps-test',
      name: 'Epsilon test',
      description: 'test',
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['a'],
      initialState: 'q0',
      acceptStates: ['q3'],
      transitions: [
        { id: '1', fromState: 'q0', symbol: EPSILON, toState: 'q1' },
        { id: '2', fromState: 'q1', symbol: EPSILON, toState: 'q2' },
        { id: '3', fromState: 'q2', symbol: 'a', toState: 'q3' },
      ],
    };

    const closure = computeEpsilonClosure(['q0'], epsNFA);
    expect(closure).toEqual(['q0', 'q1', 'q2']);
  });

  it('correctly creates reachable dead/trap state ∅ with self-loops', () => {
    const trapNFA = NFA_EXAMPLES.find(e => e.id === 'reachable-empty-trap')!;
    const { dfa } = convertNfaToDfa(trapNFA);

    expect(dfa.states).toContain(TRAP_STATE_NAME);
    // Dead state must not be accepting
    expect(dfa.acceptStates).not.toContain(TRAP_STATE_NAME);

    // Dead state must have self-loops on all symbols
    for (const sym of dfa.alphabet) {
      const loop = dfa.transitions.find(t => t.fromSubset === TRAP_STATE_NAME && t.symbol === sym);
      expect(loop).toBeDefined();
      expect(loop?.toSubset).toBe(TRAP_STATE_NAME);
    }
  });

  it('guarantees synchronized equivalence between NFA and DFA on string suite', () => {
    const nfa = NFA_EXAMPLES.find(e => e.id === 'contains-01')!;
    const { dfa } = convertNfaToDfa(nfa);

    const testStrings = [
      '',
      '0',
      '1',
      '00',
      '11',
      '01',
      '10',
      '101',
      '000100',
      '11111',
      '11011',
      '010101',
    ];

    for (const testStr of testStrings) {
      const result = simulateStringOnNfaAndDfa(testStr, nfa, dfa);
      expect(result.nfaAccepted).toBe(result.dfaAccepted);
      expect(result.equivalent).toBe(true);
    }
  });
});
