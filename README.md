# TOC LAB — Interactive Theory of Computation Simulator

A modern, interactive educational web application and playground designed for computer science students and educators studying **Theory of Computation (TOC)**, **Formal Languages**, and **Automata Theory**.

![TOC LAB Preview](public/vite.svg)

---

## Features

### 1. Turing Machine Simulator
- **Deterministic Turing Machine Engine**: Fully compliant with classical Turing machine specifications $(\mathcal{Q}, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$.
- **Interactive Infinite Tape**: Horizontally scrollable tape visualization with animated read/write head, cell index markers, and real-time state highlighting.
- **Execution & Playback Controls**: Step forward, step backward, run continuously with adjustable speeds (1x, 2x, 4x), pause, and reset.
- **Visual Transition Matrix & Editor**: Dynamic transition function editor with syntax validation, nondeterminism prevention, and instant table updates.
- **Built-in Academic Presets**:
  - **Unary Increment ($n+1$)**: Increments unary numbers by appending a $1$.
  - **Binary Palindrome Checker**: Verifies whether a binary string reads the same forwards and backwards.
  - **Unary Addition ($a + b$)**: Computes the sum of two unary numbers separated by a delimiter.
  - **Balanced Parentheses**: Validates matching pairs of parentheses `()` on the tape.
  - **Bitwise Complement**: Inverts all bits ($0 \to 1, 1 \to 0$) across a binary sequence.

---

### 2. NFA $\to$ DFA Converter & Equivalence Simulator
- **Powerset Construction Algorithm**: Complete mathematical implementation of subset construction including full $\varepsilon$-closure calculation.
- **Interactive Side-by-Side Automata Graphs**:
  - Dynamic SVG graph visualization with collision-free circular layout and start-state alignment.
  - Draggable nodes with smooth edge bezier curves, animated active state halos, and self-loop routing.
  - Canvas pan and zoom HUD controls with one-click view reset.
- **Step-by-Step Conversion Walkthrough**:
  - Interactive stepper demonstrating each subset discovery step $\mathcal{S}' = \varepsilon\text{-closure}(\bigcup \delta(q, a))$.
  - Real-time highlighting of explored states, reached NFA states, and discovered DFA subsets.
- **Dual String Simulator & Equivalence Tester**:
  - Simultaneous step-by-step string execution on both the NFA and converted DFA.
  - Visual breadcrumb ribbon with per-character transition tracing and instant language equivalence verification.
- **Formal Metric Dashboard & Transition Table**:
  - Side-by-side transition tables comparing NFA relations and DFA transition functions.
  - Export and import automata definitions in standard JSON format.
- **Built-in Presets**:
  - **Ends with "1"**: Recognizes all binary strings ending in $1$.
  - **Starts with "01"**: Matches binary sequences beginning with the prefix $01$.
  - **Epsilon NFA ($\varepsilon$-transitions)**: Demonstrates spontaneous state transitions without consuming tape input.
  - **Even 0s and Even 1s**: Classic double-parity automaton verifying even counts of both symbols.

---

### 3. Theory Academy & Preset Library
- **Academy Guides**: Concise educational references explaining deterministic finite automata, non-determinism, powerset construction, and Turing machine computability.
- **Interactive Library**: Browse, search, filter, and inspect preconfigured models with one-click loading into the respective simulator.
- **Dual-Theme Engine**: Handcrafted Obsidian Dark Mode and Slate Light Mode with seamless theme toggling.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/samanyu22/TOC-simulator.git
   cd TOC-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

### Running Tests

Run unit tests verifying the subset construction and Turing machine logic:
```bash
npm test
```

### Production Build

Create an optimized production bundle:
```bash
npm run build
```

---

## License

MIT License. Designed and crafted for students, researchers, and educators exploring Theory of Computation.
