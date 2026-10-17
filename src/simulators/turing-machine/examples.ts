import type { TMDefinition } from '../../types/turing';

export const TM_EXAMPLES: TMDefinition[] = [
  {
    id: 'unary-increment',
    name: 'Unary Increment (n + 1)',
    description: 'Increments a unary number represented by a string of 1s (e.g. "111" becomes "1111"). It scans to the end of the input and appends an extra 1.',
    states: ['q0', 'q_accept'],
    alphabet: ['1'],
    tapeAlphabet: ['1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['q_accept'],
    rejectStates: [],
    defaultInput: '111',
    transitions: [
      { id: 't1', currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '1', direction: 'R' },
      { id: 't2', currentState: 'q0', readSymbol: '_', nextState: 'q_accept', writeSymbol: '1', direction: 'S' },
    ],
  },
  {
    id: 'strings-ending-in-1',
    name: 'Accept Strings Ending in 1',
    description: 'Accepts any binary string over {0, 1} that ends with "1" (e.g. "0011", "101"). Rejects strings ending in "0" or empty input.',
    states: ['q0', 'q1', 'q_accept', 'q_reject'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    defaultInput: '101',
    transitions: [
      // q0 is when last seen symbol is 0 (or start)
      { id: 't1', currentState: 'q0', readSymbol: '0', nextState: 'q0', writeSymbol: '0', direction: 'R' },
      { id: 't2', currentState: 'q0', readSymbol: '1', nextState: 'q1', writeSymbol: '1', direction: 'R' },
      { id: 't3', currentState: 'q0', readSymbol: '_', nextState: 'q_reject', writeSymbol: '_', direction: 'S' },
      // q1 is when last seen symbol is 1
      { id: 't4', currentState: 'q1', readSymbol: '1', nextState: 'q1', writeSymbol: '1', direction: 'R' },
      { id: 't5', currentState: 'q1', readSymbol: '0', nextState: 'q0', writeSymbol: '0', direction: 'R' },
      { id: 't6', currentState: 'q1', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' },
    ],
  },
  {
    id: 'only-ones',
    name: 'Strings Containing Only 1s',
    description: 'Accepts non-empty strings composed solely of 1s (e.g. "1111"). If any 0 is encountered, immediately transitions to reject.',
    states: ['q_start', 'q_check', 'q_accept', 'q_reject'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q_start',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    defaultInput: '1111',
    transitions: [
      { id: 't1', currentState: 'q_start', readSymbol: '1', nextState: 'q_check', writeSymbol: '1', direction: 'R' },
      { id: 't2', currentState: 'q_start', readSymbol: '0', nextState: 'q_reject', writeSymbol: '0', direction: 'S' },
      { id: 't3', currentState: 'q_start', readSymbol: '_', nextState: 'q_reject', writeSymbol: '_', direction: 'S' },
      { id: 't4', currentState: 'q_check', readSymbol: '1', nextState: 'q_check', writeSymbol: '1', direction: 'R' },
      { id: 't5', currentState: 'q_check', readSymbol: '0', nextState: 'q_reject', writeSymbol: '0', direction: 'S' },
      { id: 't6', currentState: 'q_check', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' },
    ],
  },
  {
    id: 'replace-1-with-0',
    name: 'Invert 1s to 0s and Halt',
    description: 'Scans the tape from left to right, replacing every occurrence of symbol "1" with "0". Halts in accept state when blank "_" is reached.',
    states: ['q0', 'q_accept'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['q_accept'],
    rejectStates: [],
    defaultInput: '101101',
    transitions: [
      { id: 't1', currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '0', direction: 'R' },
      { id: 't2', currentState: 'q0', readSymbol: '0', nextState: 'q0', writeSymbol: '0', direction: 'R' },
      { id: 't3', currentState: 'q0', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' },
    ],
  },
  {
    id: 'scan-and-return',
    name: 'Scan Right and Return Left',
    description: 'Scans rightward across all input symbols until it encounters a blank, then rewinds back left and halts at the first blank before the start.',
    states: ['q_scan', 'q_return', 'q_accept'],
    alphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', '_'],
    blankSymbol: '_',
    initialState: 'q_scan',
    acceptStates: ['q_accept'],
    rejectStates: [],
    defaultInput: 'abaab',
    transitions: [
      { id: 't1', currentState: 'q_scan', readSymbol: 'a', nextState: 'q_scan', writeSymbol: 'a', direction: 'R' },
      { id: 't2', currentState: 'q_scan', readSymbol: 'b', nextState: 'q_scan', writeSymbol: 'b', direction: 'R' },
      { id: 't3', currentState: 'q_scan', readSymbol: '_', nextState: 'q_return', writeSymbol: '_', direction: 'L' },
      { id: 't4', currentState: 'q_return', readSymbol: 'a', nextState: 'q_return', writeSymbol: 'a', direction: 'L' },
      { id: 't5', currentState: 'q_return', readSymbol: 'b', nextState: 'q_return', writeSymbol: 'b', direction: 'L' },
      { id: 't6', currentState: 'q_return', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'R' },
    ],
  },
  {
    id: 'binary-palindrome',
    name: 'Binary Palindrome Checker',
    description: 'Determines whether a binary string is a palindrome. Matches the first symbol with the last, replaces them with blanks, and repeats.',
    states: [
      'q_start', 
      'q_have0', 'q_have1', 
      'q_match0', 'q_match1', 
      'q_rewind', 
      'q_accept', 'q_reject'
    ],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q_start',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    defaultInput: '10101',
    transitions: [
      // Start: read first symbol, erase with _, remember symbol in state
      { id: 'p1', currentState: 'q_start', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' },
      { id: 'p2', currentState: 'q_start', readSymbol: '0', nextState: 'q_have0', writeSymbol: '_', direction: 'R' },
      { id: 'p3', currentState: 'q_start', readSymbol: '1', nextState: 'q_have1', writeSymbol: '_', direction: 'R' },
      
      // Scanning right for 0
      { id: 'p4', currentState: 'q_have0', readSymbol: '0', nextState: 'q_have0', writeSymbol: '0', direction: 'R' },
      { id: 'p5', currentState: 'q_have0', readSymbol: '1', nextState: 'q_have0', writeSymbol: '1', direction: 'R' },
      { id: 'p6', currentState: 'q_have0', readSymbol: '_', nextState: 'q_match0', writeSymbol: '_', direction: 'L' },

      // Scanning right for 1
      { id: 'p7', currentState: 'q_have1', readSymbol: '0', nextState: 'q_have1', writeSymbol: '0', direction: 'R' },
      { id: 'p8', currentState: 'q_have1', readSymbol: '1', nextState: 'q_have1', writeSymbol: '1', direction: 'R' },
      { id: 'p9', currentState: 'q_have1', readSymbol: '_', nextState: 'q_match1', writeSymbol: '_', direction: 'L' },

      // Match last symbol with 0
      { id: 'p10', currentState: 'q_match0', readSymbol: '0', nextState: 'q_rewind', writeSymbol: '_', direction: 'L' },
      { id: 'p11', currentState: 'q_match0', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' }, // single 0
      { id: 'p12', currentState: 'q_match0', readSymbol: '1', nextState: 'q_reject', writeSymbol: '1', direction: 'S' },

      // Match last symbol with 1
      { id: 'p13', currentState: 'q_match1', readSymbol: '1', nextState: 'q_rewind', writeSymbol: '_', direction: 'L' },
      { id: 'p14', currentState: 'q_match1', readSymbol: '_', nextState: 'q_accept', writeSymbol: '_', direction: 'S' }, // single 1
      { id: 'p15', currentState: 'q_match1', readSymbol: '0', nextState: 'q_reject', writeSymbol: '0', direction: 'S' },

      // Rewind to beginning
      { id: 'p16', currentState: 'q_rewind', readSymbol: '0', nextState: 'q_rewind', writeSymbol: '0', direction: 'L' },
      { id: 'p17', currentState: 'q_rewind', readSymbol: '1', nextState: 'q_rewind', writeSymbol: '1', direction: 'L' },
      { id: 'p18', currentState: 'q_rewind', readSymbol: '_', nextState: 'q_start', writeSymbol: '_', direction: 'R' },
    ],
  },
];
