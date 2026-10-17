import type { TMDefinition, TMExecutionState, TMHistoryEntry, TMStepResult, TMTransition } from '../../types/turing';

export const DEFAULT_STEP_LIMIT = 2000;

export function getTransitionKey(state: string, symbol: string): string {
  return `${state}::${symbol}`;
}

export function buildTransitionMap(transitions: TMTransition[]): Map<string, TMTransition> {
  const map = new Map<string, TMTransition>();
  for (const t of transitions) {
    map.set(getTransitionKey(t.currentState, t.readSymbol), t);
  }
  return map;
}

export function initializeTM(definition: TMDefinition, input: string): TMExecutionState {
  const tape: Record<number, string> = {};
  const cleanInput = input.trim();
  
  if (cleanInput.length === 0) {
    tape[0] = definition.blankSymbol;
  } else {
    for (let i = 0; i < cleanInput.length; i++) {
      tape[i] = cleanInput[i];
    }
  }

  const isInitialAccept = definition.acceptStates.includes(definition.initialState);
  const isInitialReject = definition.rejectStates.includes(definition.initialState);

  return {
    tape,
    headPosition: 0,
    currentState: definition.initialState,
    stepCount: 0,
    status: isInitialAccept ? 'accepted' : isInitialReject ? 'rejected' : 'idle',
    statusMessage: isInitialAccept 
      ? `Started in accept state "${definition.initialState}"` 
      : isInitialReject 
      ? `Started in reject state "${definition.initialState}"` 
      : 'Ready to execute',
    minVisitedIndex: 0,
    maxVisitedIndex: Math.max(0, cleanInput.length - 1),
  };
}

export function stepTM(
  definition: TMDefinition, 
  state: TMExecutionState, 
  stepLimit: number = DEFAULT_STEP_LIMIT
): TMStepResult {
  // If already halted
  if (['accepted', 'rejected', 'halted_undefined', 'step_limit_reached'].includes(state.status)) {
    return {
      nextState: { ...state },
      historyEntry: {
        step: state.stepCount,
        state: state.currentState,
        headPosition: state.headPosition,
        tapeSnapshot: { ...state.tape },
        readSymbol: state.tape[state.headPosition] ?? definition.blankSymbol,
        status: state.status,
        message: 'Machine already halted.',
      }
    };
  }

  const currentSymbol = state.tape[state.headPosition] ?? definition.blankSymbol;
  const transMap = buildTransitionMap(definition.transitions);
  const transition = transMap.get(getTransitionKey(state.currentState, currentSymbol));

  if (!transition) {
    const isAccept = definition.acceptStates.includes(state.currentState);
    const isReject = definition.rejectStates.includes(state.currentState);
    const finalStatus = isAccept ? 'accepted' : isReject ? 'rejected' : 'halted_undefined';
    const message = isAccept
      ? `Halted: Reached accept state "${state.currentState}". String accepted.`
      : isReject
      ? `Halted: Reached reject state "${state.currentState}". String rejected.`
      : `Halted: No transition defined for state "${state.currentState}" reading symbol '${currentSymbol}'.`;

    const haltedState: TMExecutionState = {
      ...state,
      status: finalStatus,
      statusMessage: message,
    };

    return {
      nextState: haltedState,
      historyEntry: {
        step: state.stepCount,
        state: state.currentState,
        headPosition: state.headPosition,
        tapeSnapshot: { ...state.tape },
        readSymbol: currentSymbol,
        status: finalStatus,
        message,
      }
    };
  }

  // Execute transition
  const newTape = { ...state.tape };
  newTape[state.headPosition] = transition.writeSymbol;

  let newHead = state.headPosition;
  if (transition.direction === 'L') {
    newHead -= 1;
  } else if (transition.direction === 'R') {
    newHead += 1;
  }

  const newStepCount = state.stepCount + 1;
  const nextStateName = transition.nextState;
  const isAccept = definition.acceptStates.includes(nextStateName);
  const isReject = definition.rejectStates.includes(nextStateName);
  const reachedLimit = newStepCount >= stepLimit;

  let status: TMExecutionState['status'] = 'running';
  let message = `Applied δ(${state.currentState}, '${currentSymbol}') → (${nextStateName}, '${transition.writeSymbol}', ${transition.direction})`;

  if (isAccept) {
    status = 'accepted';
    message = `Accepted! Entered accepting state "${nextStateName}" at step ${newStepCount}.`;
  } else if (isReject) {
    status = 'rejected';
    message = `Rejected! Entered rejecting state "${nextStateName}" at step ${newStepCount}.`;
  } else if (reachedLimit) {
    status = 'step_limit_reached';
    message = `Execution paused: Reached step safety limit of ${stepLimit} steps to prevent infinite loop.`;
  }

  const updatedState: TMExecutionState = {
    tape: newTape,
    headPosition: newHead,
    currentState: nextStateName,
    stepCount: newStepCount,
    status,
    statusMessage: message,
    lastTransition: transition,
    minVisitedIndex: Math.min(state.minVisitedIndex, newHead),
    maxVisitedIndex: Math.max(state.maxVisitedIndex, newHead),
  };

  return {
    nextState: updatedState,
    historyEntry: {
      step: newStepCount,
      state: state.currentState,
      headPosition: state.headPosition,
      tapeSnapshot: { ...state.tape },
      readSymbol: currentSymbol,
      appliedTransition: transition,
      status,
      message,
    }
  };
}

export function validateTMDefinition(definition: TMDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!definition.states || definition.states.length === 0) {
    errors.push('Machine must have at least one state.');
  }

  if (!definition.initialState || !definition.states.includes(definition.initialState)) {
    errors.push(`Initial state "${definition.initialState}" must be in the set of states.`);
  }

  if (!definition.blankSymbol || definition.blankSymbol.length !== 1) {
    errors.push('Blank symbol must be a single character (e.g. "_" or "␣").');
  }

  for (const acc of definition.acceptStates) {
    if (!definition.states.includes(acc)) {
      errors.push(`Accepting state "${acc}" is not defined in the state set.`);
    }
  }

  for (const rej of definition.rejectStates) {
    if (!definition.states.includes(rej)) {
      errors.push(`Rejecting state "${rej}" is not defined in the state set.`);
    }
  }

  // Check determinism and transition validity
  const seenKeys = new Set<string>();
  for (let i = 0; i < definition.transitions.length; i++) {
    const t = definition.transitions[i];
    if (!definition.states.includes(t.currentState)) {
      errors.push(`Transition #${i + 1}: Current state "${t.currentState}" is not in states.`);
    }
    if (!definition.states.includes(t.nextState)) {
      errors.push(`Transition #${i + 1}: Next state "${t.nextState}" is not in states.`);
    }
    if (t.readSymbol.length !== 1) {
      errors.push(`Transition #${i + 1}: Read symbol must be a single character.`);
    }
    if (t.writeSymbol.length !== 1) {
      errors.push(`Transition #${i + 1}: Write symbol must be a single character.`);
    }
    if (!['L', 'R', 'S'].includes(t.direction)) {
      errors.push(`Transition #${i + 1}: Direction must be L, R, or S.`);
    }

    const key = getTransitionKey(t.currentState, t.readSymbol);
    if (seenKeys.has(key)) {
      errors.push(`Nondeterministic conflict: multiple transitions for (${t.currentState}, '${t.readSymbol}').`);
    }
    seenKeys.add(key);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
