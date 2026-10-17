export const TURING_MACHINE_MODEL = 'Standard 1-Tape Deterministic TM';
export type TMHeadDirection = 'L' | 'R' | 'S';

export interface TMTransition {
  id: string;
  currentState: string;
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  direction: TMHeadDirection;
}

export interface TMDefinition {
  id: string;
  name: string;
  description: string;
  states: string[];
  alphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: TMTransition[];
  defaultInput: string;
}

export type TMStatus = 
  | 'idle' 
  | 'running' 
  | 'paused' 
  | 'accepted' 
  | 'rejected' 
  | 'halted_undefined' 
  | 'step_limit_reached';

export interface TMExecutionState {
  tape: Record<number, string>;
  headPosition: number;
  currentState: string;
  stepCount: number;
  status: TMStatus;
  statusMessage: string;
  lastTransition?: TMTransition;
  minVisitedIndex: number;
  maxVisitedIndex: number;
}

export interface TMHistoryEntry {
  step: number;
  state: string;
  headPosition: number;
  tapeSnapshot: Record<number, string>;
  readSymbol: string;
  appliedTransition?: TMTransition;
  status: TMStatus;
  message: string;
}

export interface TMStepResult {
  nextState: TMExecutionState;
  historyEntry: TMHistoryEntry;
}
