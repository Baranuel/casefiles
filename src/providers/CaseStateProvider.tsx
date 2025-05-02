"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import useWebSocket from "react-use-websocket";
import { useConfig } from "./ConfigProvider";
import { WsMessage } from "@/types/sockets";
import { useSendSocketMessage } from "@/hooks/use-send-socket-message";
import { useReceiveSocketMessage } from "@/hooks/use-receive-socket-message";

export type Position = { x: number; y: number };
export type Tool = "select";

export type State = {
  elements: Position[];
  tool: Tool;
  addElement: (pos: Position) => void;
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
  const { BASE_API_URL } = useConfig();
  const [elements, setElements] = useState([{ x: 0, y: 0 }]);
  const [tool, setTool] = useState<Tool>("select");

  const { sendMessage, lastMessage } = useWebSocket<WsMessage>(
    BASE_API_URL + "/cases/" + `${caseId}` + "/ws"
  );

  const { createElementMessage } = useSendSocketMessage();
  const { parseSocketData } = useReceiveSocketMessage();

  const addElement = (pos: Position) => {
    const newState = { x: pos.x, y: pos.y };
    const createMessage = createElementMessage({
      id: "123",
      payload: { position: pos },
    });
    sendMessage(JSON.stringify(createMessage));
    setElements((p) => [...p.concat(newState)]);
  };

  //Receive socket message and update state on the client
  useEffect(() => {
    if (!lastMessage) return;

    const { data } = lastMessage;
    const parsedData = parseSocketData(data);
    if (parsedData.type === "CREATE") {
      setElements((p) => [...p.concat(parsedData.payload.position)]);
    }
  }, [lastMessage, parseSocketData]);

  const contextStateValue: State = {
    elements,
    tool,
    addElement,
    setTool,
  };

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
