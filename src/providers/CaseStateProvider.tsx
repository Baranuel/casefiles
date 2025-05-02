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
import type { ElementDto, ElementPosition } from "@/types/elements";
import { useCaseElementsQuery } from "@/hooks/use-case-elements-query";
import { useCaseElementsMutation } from "@/hooks/use-case-elements-mutation";

export type Tool = "select";

export type State = {
  elements: ElementDto[];
  tool: Tool;
  addElement: (pos: ElementPosition) => void;
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

  const { data: elements } = useCaseElementsQuery(caseId);
  const { updateMutation } = useCaseElementsMutation(caseId);

  const [tool, setTool] = useState<Tool>("select");

  // Memoize the addElement function so it keeps a stable identity
  const addElement = useCallback(
    (position: ElementPosition) => {
      updateMutation.mutate({
        type: "PERSON",
        position,
      });
    },
    [updateMutation]
  );

  const contextStateValue = useMemo(
    (): State => ({
      elements: elements ?? [],
      tool,
      addElement,
      setTool,
    }),
    [elements, tool, addElement]
  );

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
