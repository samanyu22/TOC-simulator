import type { 
  NFADefinition, 
  DFADefinition, 
  DFATransition, 
  ConversionStep, 
  SubsetConversionResult 
} from '../../types/automata';
import { EPSILON } from '../../types/automata';

export const TRAP_STATE_NAME = '∅';

/**
 * Normalizes state names into a canonical subset representation:
 * e.g. ['q1', 'q0'] -> '{q0, q1}'
 * [] -> '∅'
 */
export function formatSubset(states: string[]): string {
  const unique = Array.from(new Set(states)).sort();
  if (unique.length === 0) return TRAP_STATE_NAME;
  return `{${unique.join(', ')}}`;
}

/**
 * Parse canonical subset string back into state array
 */
export function parseSubset(name: string): string[] {
  if (name === TRAP_STATE_NAME || name.trim() === '' || name === '{}') return [];
  const cleaned = name.replace(/^\{|\}$/g, '').trim();
  if (!cleaned) return [];
  return cleaned.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Computes epsilon-closure for a set of NFA states
 */
export function computeEpsilonClosure(states: string[], nfa: NFADefinition): string[] {
  const closure = new Set<string>(states);
  const queue = [...states];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const t of nfa.transitions) {
      if (t.fromState === current && (t.symbol === EPSILON || t.symbol === '' || t.symbol === 'e')) {
        if (!closure.has(t.toState)) {
          closure.add(t.toState);
          queue.push(t.toState);
        }
      }
    }
  }

  return Array.from(closure).sort();
}

/**
 * Computes direct transitions on symbol without epsilon closure
 */
export function computeDirectMove(states: string[], symbol: string, nfa: NFADefinition): string[] {
  const destinations = new Set<string>();
  for (const q of states) {
    for (const t of nfa.transitions) {
      if (t.fromState === q && t.symbol === symbol) {
        destinations.add(t.toState);
      }
    }
  }
  return Array.from(destinations).sort();
}

/**
 * Complete subset construction algorithm with step recording
 */
export function convertNfaToDfa(nfa: NFADefinition): SubsetConversionResult {
  const initialClosure = computeEpsilonClosure([nfa.initialState], nfa);
  const initialSubset = formatSubset(initialClosure);

  const discoveredSubsets: string[] = [initialSubset];
  const subsetMap: Record<string, string[]> = {
    [initialSubset]: initialClosure,
  };

  const queue: string[] = [initialSubset];
  const transitions: DFATransition[] = [];
  const table: Record<string, Record<string, string>> = {};
  const steps: ConversionStep[] = [];

  let stepCounter = 0;

  while (queue.length > 0) {
    const currentSubsetName = queue.shift()!;
    const currentStates = subsetMap[currentSubsetName] || [];

    if (!table[currentSubsetName]) {
      table[currentSubsetName] = {};
    }

    // Process each alphabet symbol
    for (const symbol of nfa.alphabet) {
      stepCounter++;
      let targetSubsetName: string;
      let reachedNFAStates: string[] = [];
      let closureStates: string[] = [];
      let explanation = '';
      let isNewSubset = false;

      if (currentSubsetName === TRAP_STATE_NAME) {
        // Trap state always transitions to itself
        targetSubsetName = TRAP_STATE_NAME;
        explanation = `From dead state ${TRAP_STATE_NAME}, reading '${symbol}' remains in ${TRAP_STATE_NAME}.`;
      } else {
        reachedNFAStates = computeDirectMove(currentStates, symbol, nfa);
        closureStates = computeEpsilonClosure(reachedNFAStates, nfa);
        targetSubsetName = formatSubset(closureStates);

        if (closureStates.length === 0) {
          explanation = `From subset ${currentSubsetName}, on symbol '${symbol}', no NFA transitions are defined. This leads to the dead/trap state ${TRAP_STATE_NAME}.`;
        } else {
          const reachedStr = reachedNFAStates.length > 0 ? `{${reachedNFAStates.join(', ')}}` : '∅';
          const closureNote = hasEpsilonTransitions(nfa)
            ? ` Epsilon-closure of ${reachedStr} gives ${targetSubsetName}.`
            : '';
          explanation = `From subset ${currentSubsetName}, reading '${symbol}' reaches NFA states ${reachedStr}.${closureNote} Next DFA state is ${targetSubsetName}.`;
        }
      }

      // Check if newly discovered
      if (!discoveredSubsets.includes(targetSubsetName)) {
        isNewSubset = true;
        discoveredSubsets.push(targetSubsetName);
        subsetMap[targetSubsetName] = closureStates;
        queue.push(targetSubsetName);
        explanation += ` ✨ Discovered new DFA state ${targetSubsetName}.`;
      }

      // Record transition
      transitions.push({
        fromSubset: currentSubsetName,
        symbol,
        toSubset: targetSubsetName,
      });

      table[currentSubsetName][symbol] = targetSubsetName;

      steps.push({
        stepIndex: stepCounter,
        currentSubset: currentSubsetName,
        currentSubsetStates: currentStates,
        symbol,
        reachedNFAStates,
        closureStates,
        targetSubsetName,
        isNewSubset,
        explanation,
        queueSnapshot: [...queue],
        discoveredSubsets: [...discoveredSubsets],
        dfaTransitionsSnapshot: [...transitions],
      });
    }
  }

  // Find accept states: any subset that contains at least one NFA accept state
  const acceptStates = discoveredSubsets.filter(subsetName => {
    if (subsetName === TRAP_STATE_NAME) return false;
    const states = subsetMap[subsetName] || [];
    return states.some(q => nfa.acceptStates.includes(q));
  });

  const dfa: DFADefinition = {
    states: discoveredSubsets,
    subsets: subsetMap,
    alphabet: [...nfa.alphabet],
    initialState: initialSubset,
    acceptStates,
    transitions,
    trapState: discoveredSubsets.includes(TRAP_STATE_NAME) ? TRAP_STATE_NAME : undefined,
  };

  return {
    dfa,
    steps,
    table,
  };
}

export function hasEpsilonTransitions(nfa: NFADefinition): boolean {
  return nfa.transitions.some(t => t.symbol === EPSILON || t.symbol === '' || t.symbol === 'e');
}
