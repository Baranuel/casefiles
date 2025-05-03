"use client";
import {  useCaseContext } from "@/providers/CaseStateProvider";
import { Tool } from "@/types/elements";

import { Move, User, MapPin, StickyNote, ArrowUpToLine } from "lucide-react";
import { JSX } from "react";

const tools: { id: Tool; icon: JSX.Element; label: string }[] = [
  {
    id: "SELECT",
    icon: <Move className="w-5 h-5" />,
    label: "Select",
  },
  {
    id: 'PERSON',
    icon: <User className="w-5 h-5" />,
    label: "Person",
  },
  {
    id: 'LOCATION',
    icon: <MapPin className="w-5 h-5" />,
    label: "Location",
  },
  {
    id: 'NOTE',
    icon: <StickyNote className="w-5 h-5" />,
    label: "Note",
  },
  {
    id: 'POINTER',
    icon: <ArrowUpToLine className="w-5 h-5" />,
    label: "Line",
  },
] as const;

export const Toolbar = () => {
  // const params = useParams<{id:string}>()

  const { tool, setTool } = useCaseContext();
  // const {deleteAllMutation} = useCaseElementsMutation(params.id)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#2C2420] p-2 rounded-lg border border-amber-700/50 shadow-lg">
      <div className="flex gap-2 relative">
        <div
          className="absolute w-10 h-10 bg-amber-700 rounded-lg transition-transform duration-200"
          style={{
            transform: `translateX(${
              tools.findIndex((t) => t.id === tool) * (40 + 8)
            }px)`,
          }}
        />
        {tools.map((tool) => (
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
