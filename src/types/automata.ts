export const EPSILON = 'ε';

export interface NFATransition {
  id: string;
  fromState: string;
  symbol: string; // '0', '1', 'a', or EPSILON ('ε')
  toState: string;
}

export interface NFADefinition {
  id: string;
  name: string;
  description: string;
  states: string[];
  alphabet: string[];
  initialState: string;
  acceptStates: string[];
  transitions: NFATransition[];
  defaultInput?: string;
}

export interface DFATransition {
  fromSubset: string;
  symbol: string;
  toSubset: string;
}

export interface DFADefinition {
  states: string[];
  subsets: Record<string, string[]>;
  alphabet: string[];
  initialState: string;
  acceptStates: string[];
  transitions: DFATransition[];
  trapState?: string;
}

export interface ConversionStep {
  stepIndex: number;
  currentSubset: string;
  currentSubsetStates: string[];
  symbol: string;
  reachedNFAStates: string[];
  closureStates: string[];
  targetSubsetName: string;
  isNewSubset: boolean;
  explanation: string;
  queueSnapshot: string[];
  discoveredSubsets: string[];
  dfaTransitionsSnapshot: DFATransition[];
}

export interface SubsetConversionResult {
  dfa: DFADefinition;
  steps: ConversionStep[];
  table: Record<string, Record<string, string>>;
}

export interface StringSimStep {
  stepIndex: number;
  charIndex: number;
  readChar: string;
  nfaActiveStates: string[];
  nfaNextActiveStates: string[];
  nfaTransitionsTaken: NFATransition[];
  dfaCurrentState: string;
  dfaNextState: string;
  dfaTransitionTaken?: DFATransition;
  explanation: string;
}

export interface StringSimResult {
  input: string;
  steps: StringSimStep[];
  finalNFAStates: string[];
  finalDFAState: string;
  nfaAccepted: boolean;
  dfaAccepted: boolean;
  equivalent: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isInitial: boolean;
  isAccept: boolean;
  substates?: string[];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  symbols: string[];
  isSelfLoop: boolean;
  curvature?: number;
}
