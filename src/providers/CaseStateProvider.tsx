"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import useWebSocket from "react-use-websocket";
import { useConfig } from "./ConfigProvider";
import { WsMessage } from "@/types/sockets";
import { useReceiveSocketMessage } from "@/hooks/use-receive-socket-message";
import type { ElementDto, ElementPosition } from "@/types/elements";
import { useCaseElementsQuery } from "@/hooks/use-case-elements-query";
import { useCaseElementsMutation } from "@/hooks/use-case-elements-mutation";
import { useWsCacheUpdate } from "@/hooks/use-ws-cache-update";

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
  const wsId = useRef(crypto.randomUUID())
  const { BASE_API_URL } = useConfig();

  const { data: elements } = useCaseElementsQuery(caseId);
  const { updateMutation } = useCaseElementsMutation(caseId, wsId.current);
  const { wsElementCreate } = useWsCacheUpdate(caseId);

  const [tool, setTool] = useState<Tool>("select");

  const { lastMessage,  } = useWebSocket<WsMessage>(
    `${BASE_API_URL}/cases/${caseId}/ws?wsId=${wsId.current}`,
    // {
    //   shouldReconnect: () => true,
    // }
  );

  const { parseSocketData } = useReceiveSocketMessage();

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

  useEffect(() => {
    if (!lastMessage) return;

    const { data } = lastMessage;
    const parsedData = parseSocketData(data);

    if (parsedData.type === "CREATE" ) {
      console.log('ECHOOO')
      const { payload } = parsedData;
      wsElementCreate("case-elements", payload);
    }
  }, [lastMessage, parseSocketData, wsElementCreate]);

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
  if (!context) throw new Error("useCaseContext must be used within a CaseProvider");
  return context;
}
