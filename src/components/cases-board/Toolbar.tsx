"use client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCaseContext } from "@/providers/CaseStateProvider";
import { Tool } from "@/types/elements";

import {
  Move,
  User,
  MapPin,
  StickyNote,
  ArrowUpFromDot,
  Hand,
} from "lucide-react";
import { JSX, useMemo } from "react";

const tools: { id: Tool; icon: JSX.Element; label: string }[] = [
  {
    id: "MOVE",
    icon: <Hand className="w-5 h-5" />,
    label: "Move",
  },
  {
    id: "SELECT",
    icon: <Move className="w-5 h-5" />,
    label: "Select",
  },
  {
    id: "PERSON",
    icon: <User className="w-5 h-5" />,
    label: "Person",
  },
  {
    id: "LOCATION",
    icon: <MapPin className="w-5 h-5" />,
    label: "Location",
  },
  {
    id: "POINTER",
    icon: <ArrowUpFromDot className="w-5 h-5" />,
    label: "Line",
  },
  {
    id: "NOTE",
    icon: <StickyNote className="w-5 h-5" />,
    label: "Note",
  },
] as const;

export const Toolbar = () => {
  // const params = useParams<{id:string}>()
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { tool, setTool } = useCaseContext();

  const toolsArray = useMemo(() => {
    if (!isMobile) {
      return tools.filter((t) => t.id !== "MOVE");
    }
    return tools;
  }, [isMobile]);
  // const {deleteAllMutation} = useCaseElementsMutation(params.id)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#2C2420] p-2 rounded-lg border border-amber-700/50 shadow-lg z-30">
      <div className="flex gap-2 relative">
        <div
          className="absolute w-10 h-10 bg-amber-700 rounded-lg transition-transform duration-200"
          style={{
            transform: `translateX(${
              tools.findIndex((t) => t.id === tool) * (40 + 8)
            }px)`,
          }}
        />
        {toolsArray.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              setTool(tool.id as Tool);
              // deleteAllMutation.mutate()
            }}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative hover:bg-amber-900/30`}
            title={tool.label}
          >
            <span className={`text-xl text-amber-300 relative z-10 `}>
              {tool.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
