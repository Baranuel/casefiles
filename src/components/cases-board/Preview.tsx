"use client";
import { useDebouncedCallback } from "use-debounce";
import { useForm } from "react-hook-form";
import { useCaseContext } from "@/providers/CaseStateProvider";
import { useEffect, useMemo, useRef } from "react";
import { Switch } from "../ui/switch";
import { Content } from "@/types/contents";
import { usePreviewElement } from "@/hooks/use-preview-element";
import { useCaseContentsMutation } from "@/hooks/use-case-contents-mutation";
import CustomDrawer from "./CustomDrawer";
import Headshot from "./Headshot";

export const Preview = ({ caseId }: { caseId: string }) => {
  const { previewElementId, setPreviewElementId } = useCaseContext();
  const { getPreviewElement } = usePreviewElement(caseId);
  const { updateMutation } = useCaseContentsMutation(caseId);

  const previewElement = getPreviewElement(previewElementId);
  const isOpen = Boolean(previewElement);
  const { register, getValues } = useForm<Content>({
    values: {
      id: previewElement?.content?.id || null,
      name: previewElement?.content?.name || "",
      text: previewElement?.content?.text || "no value",
      image: previewElement?.content?.image || "",
      time_of_death: previewElement?.content?.time_of_death || "",
      victim: previewElement?.content?.victim || false,
    },
  });

  const handleClose = () => setPreviewElementId(null);

  const debounce = useDebouncedCallback((newState: Partial<Content>) => {
    if (!previewElement) return;
    updateMutation.mutate({
      element_id: previewElement.id,
      value: { ...getValues(), ...newState },
    });
  }, 700);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [previewElementId]);

  const renderPreviewContent = useMemo(() => {
    return (
      <div
        ref={scrollRef}
        className="flex flex-col w-full gap-3 px-3 md:px-6 pt-3 md:pt-6 z-40 overflow-scroll bg-[#F1E1CF] shadow-xl border border-amber-800/20 "
      >
        <div className="flex gap-4">
          <div className="w-1/2 rotate-1 rounded-sm shadow-md aspect-square border border-muted relative overflow-hidden">
            <Headshot
              imagePath={previewElement?.content?.image}
              onImageChange={() => {}}
            />
          </div>
          <div className="flex flex-col gap-4 w-1/2 text-black p-2">
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold">Name</h5>
              <span className="text-xl font-bold">
                {previewElement?.content?.name}
              </span>
            </div>
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold">Status</h5>
              <span className="text-xl font-bold">Suspect</span>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex gap-2 mt-3">
          <div className="flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-amber-800"
            >
              Name
            </label>
            <input
              title="name"
              type="text"
              {...register("name")}
              onChange={(e) => debounce({ name: e.target.value })}
              className="border border-amber-800/40 rounded-sm bg-background-500/60 p-1 focus:outline-none focus:bg-background focus:border-amber-800"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="flex gap-2">
          <div className="w-1/3 flex flex-col gap-1 p-3 bg-amber-900/20 rounded-sm">
            <label
              htmlFor="victim"
              className="text-sm font-semibold text-amber-800"
            >
              Victim
            </label>
            <Switch className="my-1" />
          </div>
          <div className="w-2/3 rounded-sm">
            <div className="flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
              <label
                htmlFor="timeOfDeath"
                className="text-sm font-semibold text-amber-800"
              >
                Time of death
              </label>
              <input
                disabled
                type="datetime-local"
                id="timeOfDeath"
                name="timeOfDeath"
                className="w-full p-1 border border-amber-800/40 rounded-sm bg-background-500/60 disabled:opacity-50 hover:disabled:cursor-not-allowed focus:outline-none focus:bg-background focus:border-amber-800"
              />
            </div>
          </div>
        </div>

        {/* Fourth Row */}
        <div className="flex-1 mb-3 md:mb-6 h-full gap-2">
          <div className="flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
            <label
              htmlFor="text"
              className="text-sm font-semibold text-amber-800"
            >
              Notes
            </label>
            <textarea
              {...register("text")}
              onChange={(e) => debounce({ text: e.target.value })}
              className="h-full min-h-[50vh] p-3 border border-amber-800/40 rounded-sm bg-background-500/60 focus:outline-none focus:bg-background focus:border-amber-800"
            />
          </div>
        </div>
      </div>
    );
  }, [previewElement, register, debounce]);

  return (
    <CustomDrawer open={isOpen} onClose={handleClose}>
      {renderPreviewContent}
    </CustomDrawer>
  );
};
