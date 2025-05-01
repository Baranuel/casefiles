"use client";

import { createContext, useContext, type ReactNode, useState, Dispatch, SetStateAction } from "react";

export type Position = { x: number; y: number };
export type Tool = 'select'

export type State = {
  elements: Position[];
  tool:Tool
  addElement: (pos: Position) => void;
  setTool: Dispatch<SetStateAction<Tool>>
};

const CaseContext = createContext<State | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState([{ x: 0, y: 0 }]);
  const [tool, setTool] = useState<Tool>('select')

  const addElement = (pos: Position) => {
    const newState = { x: pos.x, y: pos.y };
    setElements((p) => [...p.concat(newState)]);
  };

  const contextStateValue: State = {
    elements,
    tool,
    addElement,
    setTool
  };

  console.log(elements);
  return (
    <CaseContext.Provider value={contextStateValue}>
        {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) throw new Error("Use CaseProvider");
  return context;
}
