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
import { useConfirm } from "./ConfirmProvider";

export type State = {
  elements: ElementDto[];
  tool: Tool;
  previewElementId: ElementDto["id"] | null;
  setPreviewElementId: Dispatch<SetStateAction<ElementDto["id"] | null>>;
  addElement: (element: ElementDto) => void;
  updateElement: (element: ElementDto) => void;
  updateBatchElements: (elements: ElementDto[]) => void;
  deleteElement: (elementId: ElementDto["id"], confirm?: boolean) => void;
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
  const {
    createMutation,
    updateMutation,
    updateBatchMutation,
    deleteMutation,
  } = useCaseElementsMutation(caseId);

  const { confirmModal } = useConfirm();

  const [tool, setTool] = useState<Tool>("SELECT");

  const [previewElementId, setPreviewElementId] = useState<
    ElementDto["id"] | null
  >(null);

  const addElement = useCallback(
    (newElement: ElementDto) => {
      createMutation.mutate(newElement);
      setTool("SELECT");
    },
    [createMutation]
  );

  const updateElement = useCallback(
    (elementToUpdate: ElementDto) => {
      updateMutation.mutate(elementToUpdate);
    },
    [updateMutation]
  );

  const deleteElement = useCallback(
    async (elementId: ElementDto["id"], confirm?: boolean) => {
      if (!confirm) return deleteMutation.mutate(elementId);

      try {
        await confirmModal({
          title: "Confirm Deletion",
          description: "Are you sure you want to delete this element?",
          okText: "Delete",
          cancelText: "Cancel",
        });
        deleteMutation.mutate(elementId);
      } catch (e) {
        console.log(e);
        return; // Exit if deletion is cancelled
      }
    },
    [confirmModal, deleteMutation]
  );

  const updateBatchElements = useCallback(
    (elementsToUpdate: ElementDto[]) => {
      updateBatchMutation.mutate(elementsToUpdate);
    },
    [updateBatchMutation]
  );

  const contextStateValue = useMemo(
    (): State => ({
      elements: elements ?? [],
      tool,
      previewElementId,
      setPreviewElementId,
      addElement,
      updateElement,
      updateBatchElements,
      deleteElement,
      setTool,
    }),
    [
      elements,
      tool,
      previewElementId,
      addElement,
      updateElement,
      updateBatchElements,
      deleteElement,
    ]
  );

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
