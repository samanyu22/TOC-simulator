import { describe, it, expect } from 'vitest';
import { initializeTM, stepTM, validateTMDefinition } from '../simulators/turing-machine/engine';
import { TM_EXAMPLES } from '../simulators/turing-machine/examples';
import type { TMDefinition } from '../types/turing';

describe('Turing Machine Engine', () => {
  it('correctly executes unary increment (111 -> 1111)', () => {
    const incTM = TM_EXAMPLES.find(e => e.id === 'unary-increment')!;
    expect(incTM).toBeDefined();

    let state = initializeTM(incTM, '111');
    expect(state.status).toBe('idle');
    expect(state.headPosition).toBe(0);

    // Step until halted
    let maxSteps = 20;
    while (!['accepted', 'rejected', 'halted_undefined'].includes(state.status) && maxSteps > 0) {
      const result = stepTM(incTM, state);
      state = result.nextState;
      maxSteps--;
    }

    expect(state.status).toBe('accepted');
    // The tape should now have '1' at indices 0, 1, 2, 3
    expect(state.tape[0]).toBe('1');
    expect(state.tape[1]).toBe('1');
    expect(state.tape[2]).toBe('1');
    expect(state.tape[3]).toBe('1');
  });

  it('correctly accepts strings ending in 1 and rejects strings ending in 0', () => {
    const endsIn1TM = TM_EXAMPLES.find(e => e.id === 'strings-ending-in-1')!;

    // Test '101' -> should accept
    let state = initializeTM(endsIn1TM, '101');
    while (!['accepted', 'rejected', 'halted_undefined'].includes(state.status)) {
      state = stepTM(endsIn1TM, state).nextState;
    }
    expect(state.status).toBe('accepted');

    // Test '100' -> should reject
    let stateReject = initializeTM(endsIn1TM, '100');
    while (!['accepted', 'rejected', 'halted_undefined'].includes(stateReject.status)) {
      stateReject = stepTM(endsIn1TM, stateReject).nextState;
    }
    expect(stateReject.status).toBe('rejected');
  });

  it('correctly validates palindrome checker with binary strings', () => {
    const palTM = TM_EXAMPLES.find(e => e.id === 'binary-palindrome')!;
    
    // Test '101' -> accepted
    let state1 = initializeTM(palTM, '101');
    let steps = 100;
    while (!['accepted', 'rejected', 'halted_undefined'].includes(state1.status) && steps-- > 0) {
      state1 = stepTM(palTM, state1).nextState;
    }
    expect(state1.status).toBe('accepted');

    // Test '10' -> rejected
    let state2 = initializeTM(palTM, '10');
    steps = 100;
    while (!['accepted', 'rejected', 'halted_undefined'].includes(state2.status) && steps-- > 0) {
      state2 = stepTM(palTM, state2).nextState;
    }
    expect(state2.status).toBe('rejected');
  });

  it('halts with halted_undefined when transition is missing in non-accepting state', () => {
    const customTM: TMDefinition = {
      id: 'test-undef',
      name: 'Test Undef',
      description: 'testing undefined halt',
      states: ['q0', 'q_acc'],
      alphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', '_'],
      blankSymbol: '_',
      initialState: 'q0',
      acceptStates: ['q_acc'],
      rejectStates: [],
      defaultInput: '0',
      transitions: [
        // only transition for '1', not for '0'
        { id: 't1', currentState: 'q0', readSymbol: '1', nextState: 'q_acc', writeSymbol: '1', direction: 'R' }
      ]
    };

    let state = initializeTM(customTM, '0');
    const result = stepTM(customTM, state);
    expect(result.nextState.status).toBe('halted_undefined');
    expect(result.nextState.statusMessage).toContain('No transition defined');
  });

  it('catches invalid machine definition', () => {
    const invalidTM: TMDefinition = {
      id: 'bad',
      name: 'Bad TM',
      description: 'invalid',
      states: ['q0'],
      alphabet: ['0'],
      tapeAlphabet: ['0', '_'],
      blankSymbol: '_',
      initialState: 'q_nonexistent',
      acceptStates: ['q_missing_acc'],
      rejectStates: [],
      defaultInput: '',
      transitions: []
    };

    const validation = validateTMDefinition(invalidTM);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(2);
  });
});
