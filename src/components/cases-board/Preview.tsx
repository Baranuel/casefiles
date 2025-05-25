"use client";
import { useDebouncedCallback } from "use-debounce";
import { Controller, useForm } from "react-hook-form";
import { useCaseContext } from "@/providers/CaseStateProvider";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Switch } from "../ui/switch";
import { Content } from "@/types/contents";
import { usePreviewElement } from "@/hooks/use-preview-element";
import { useCaseContentsMutation } from "@/hooks/use-case-contents-mutation";
import CustomDrawer from "./CustomDrawer";
import dayjs from "dayjs";
import React from "react";

const Headshot = React.lazy(() => import("./Headshot"));

export const Preview = ({ caseId }: { caseId: string }) => {
  const { previewElementId, setPreviewElementId } = useCaseContext();
  const { getPreviewElement } = usePreviewElement(caseId);
  const { updateMutation } = useCaseContentsMutation(caseId);
  const previewElement = getPreviewElement(previewElementId);

  const emptyContent: Content = useMemo(() => {
    return {
      id: previewElement?.content?.id ?? crypto.randomUUID(),
      name: "",
      text: "",
      image: null,
      time_of_death: null,
      victim: false,
    };
  }, [previewElement?.content?.id]);

  const isOpen = Boolean(previewElement);

  const { register, getValues, control } = useForm<Content>({
    values: {
      ...emptyContent,
      ...previewElement?.content,
    },
  });

  const handleClose = () => {
    setPreviewElementId(null);
  };

  const debounce = useDebouncedCallback((newState: Partial<Content>) => {
    if (!previewElement) return;
    updateMutation.mutate({
      element_id: previewElement.id,
      value: { ...getValues(), ...newState },
    });
  }, 700);

  const mutationWrapper = useCallback(
    (newState: Partial<Content>, options?: { noDelay: boolean }) => {
      if (!previewElement) return;

      if (options?.noDelay) {
        return updateMutation.mutate({
          element_id: previewElement.id,
          value: { ...getValues(), ...newState },
        });
      } else {
        return debounce(newState);
      }
    },
    [previewElement, getValues, updateMutation, debounce]
  );

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
        className="flex h-full flex-col w-full gap-3 px-3 md:px-6 pt-3 md:pt-6 z-40 overflow-scroll bg-[#F1E1CF] shadow-xl border border-amber-800/20 "
      >
        {previewElement?.type === "PERSON" && (
          <div className="flex gap-4">
            <div className="w-1/2 rotate-1 rounded-sm shadow-md aspect-square border border-muted relative overflow-hidden">
              <Suspense fallback={null}>
                <Headshot
                  imagePath={previewElement?.content?.image}
                  onImageChange={mutationWrapper}
                />
              </Suspense>
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
                <span className="text-xl font-bold">
                  {previewElement?.content?.victim ? "Victim" : "Suspect"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Second Row */}
        {previewElement?.type !== "NOTE" && (
          <div className="flex gap-2 mt-3">
            <div className="flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-amber-800"
              >
                Name
              </label>
              <input
                placeholder="Enter name"
                title="name"
                type="text"
                {...register("name")}
                onChange={(e) => mutationWrapper({ name: e.target.value })}
                className="border border-amber-800/40 rounded-sm bg-background-500/60 p-1 focus:outline-none focus:bg-background focus:border-amber-800"
              />
            </div>
          </div>
        )}

        {/* Third Row */}
        {previewElement?.type === "PERSON" && (
          <div className="flex gap-2">
            <div className="w-1/3 flex flex-col gap-1 p-3 bg-amber-900/20 rounded-sm">
              <label
                htmlFor="victim"
                className="text-sm font-semibold text-amber-800"
              >
                Victim
              </label>
              <Controller
                name="victim"
                control={control}
                render={({ field }) => {
                  return (
                    <Switch
                      className="my-1"
                      checked={field.value || false}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        mutationWrapper({ victim: checked }, { noDelay: true });
                      }}
                    />
                  );
                }}
              />
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
                  {...register("time_of_death")}
                  value={
                    previewElement?.content?.time_of_death
                      ? dayjs(previewElement.content.time_of_death).format(
                          "YYYY-MM-DDTHH:mm"
                        )
                      : ""
                  }
                  disabled={!previewElement?.content?.victim}
                  onChange={(e) => {
                    const value = e.target.value
                      ? dayjs(e.target.value).toString()
                      : null;
                    mutationWrapper({ time_of_death: value });
                  }}
                  placeholder="YYYY-MM-DD HH:MM"
                  type="datetime-local"
                  className="w-full p-1 border border-amber-800/40 rounded-sm bg-background-500/60 disabled:opacity-50 hover:disabled:cursor-not-allowed focus:outline-none focus:bg-background focus:border-amber-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Fourth Row */}
        <div className="flex-1 mb-3 md:mb-6 h-full gap-2">
          <div className="h-full flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
            <label
              htmlFor="text"
              className="text-sm font-semibold text-amber-800"
            >
              Notes
            </label>
            <textarea
              placeholder="Enter notes here..."
              {...register("text")}
              onChange={(e) => mutationWrapper({ text: e.target.value })}
              className="h-full min-h-[50vh] p-3 border border-amber-800/40 rounded-sm bg-background-500/60 focus:outline-none focus:bg-background focus:border-amber-800"
            />
          </div>
        </div>
      </div>
    );
  }, [
    previewElement?.type,
    previewElement?.content?.image,
    previewElement?.content?.name,
    previewElement?.content?.victim,
    previewElement?.content?.time_of_death,
    mutationWrapper,
    register,
    control,
  ]);

  return (
    <CustomDrawer open={isOpen} onClose={handleClose}>
      {renderPreviewContent}
    </CustomDrawer>
  );
};
