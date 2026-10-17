import type { 
  NFADefinition, 
  DFADefinition, 
  StringSimResult, 
  StringSimStep, 
  NFATransition 
} from '../../types/automata';
import { computeEpsilonClosure } from './subset-construction';

/**
 * Simulates a test string simultaneously on the original NFA and the converted DFA.
 */
export function simulateStringOnNfaAndDfa(
  input: string,
  nfa: NFADefinition,
  dfa: DFADefinition
): StringSimResult {
  const steps: StringSimStep[] = [];
  
  // NFA initial active states
  let currentNFAStates = computeEpsilonClosure([nfa.initialState], nfa);
  // DFA initial state
  let currentDFAState = dfa.initialState;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // Compute NFA step
    const takenNFATransitions: NFATransition[] = [];
    const directDestinations = new Set<string>();

    for (const q of currentNFAStates) {
      for (const t of nfa.transitions) {
        if (t.fromState === q && t.symbol === char) {
          takenNFATransitions.push(t);
          directDestinations.add(t.toState);
        }
      }
    }

    const nextNFAStates = computeEpsilonClosure(Array.from(directDestinations), nfa);

    // Compute DFA step
    const dfaTrans = dfa.transitions.find(
      t => t.fromSubset === currentDFAState && t.symbol === char
    );
    const nextDFAState = dfaTrans ? dfaTrans.toSubset : (dfa.trapState || '∅');

    const stepExplanation = `Read '${char}': NFA moved {${currentNFAStates.join(', ')}} → {${nextNFAStates.join(', ') || '∅'}}. DFA moved ${currentDFAState} → ${nextDFAState}.`;

    steps.push({
      stepIndex: i + 1,
      charIndex: i,
      readChar: char,
      nfaActiveStates: currentNFAStates,
      nfaNextActiveStates: nextNFAStates,
      nfaTransitionsTaken: takenNFATransitions,
      dfaCurrentState: currentDFAState,
      dfaNextState: nextDFAState,
      dfaTransitionTaken: dfaTrans,
      explanation: stepExplanation,
    });

    currentNFAStates = nextNFAStates;
    currentDFAState = nextDFAState;
  }

  // Acceptance check
  const nfaAccepted = currentNFAStates.some(q => nfa.acceptStates.includes(q));
  const dfaAccepted = dfa.acceptStates.includes(currentDFAState);

  return {
    input,
    steps,
    finalNFAStates: currentNFAStates,
    finalDFAState: currentDFAState,
    nfaAccepted,
    dfaAccepted,
    equivalent: nfaAccepted === dfaAccepted,
  };
}
