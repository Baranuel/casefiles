"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
  useCallback,
} from "react";
import type { ElementDto, Tool } from "@/types/elements";
import { useCaseElementsQuery } from "@/hooks/use-case-elements-query";
import { useCaseElementsMutation } from "@/hooks/use-case-elements-mutation";

export type State = {
  elements: ElementDto[];
  tool: Tool;
  addElement: (element: ElementDto) => void;
  updateElement: (element: ElementDto) => void;
  setTool: Dispatch<SetStateAction<Tool>>;
};

const CaseContext = createContext<State | null>(null);

export function CaseProvider({
  children,
  caseId,
}: {
  children: ReactNode;
  caseId: string;
}) {
  const { data: elements, isLoading } = useCaseElementsQuery(caseId);
  const { createMutation, updateMutation } = useCaseElementsMutation(caseId);

  const [tool, setTool] = useState<Tool>("SELECT");

  const addElement = useCallback(
    (newElement: ElementDto) => {
      createMutation.mutate(newElement);
    },
    [createMutation]
  );

  const updateElement = useCallback(
    (elementToUpdate: ElementDto) => {
      updateMutation.mutate(elementToUpdate);
    },
    [updateMutation]
  );

  const contextStateValue = useMemo(
    (): State => ({
      elements: elements ?? [],
      tool,
      addElement,
      updateElement,
      setTool,
    }),
    [elements, tool, addElement, updateElement]
  );

  console.log(isLoading);
  if (isLoading) {
    return "Loading...";
  }

  return (
    <CaseContext.Provider value={contextStateValue}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context)
    throw new Error("useCaseContext must be used within a CaseProvider");
  return context;
}
