"use client";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCaseContext } from "@/providers/CaseStateProvider";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { useMemo } from "react";
import { Switch } from "../ui/switch";

export const Preview = () => {
  const { previewElement, setPreviewElement } = useCaseContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isOpen = Boolean(previewElement);

  const handleOpenChange = (open: boolean) => {
    if (!open) setPreviewElement(null);
  };

  const renderPreviewContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-3 px-3 md:px-6 pt-3 md:pt-6 h-full overflow-auto  bg-[#F1E1CF] shadow-xl">
        <div className="flex gap-4 ">
          <Image
            src={"/avatar-m.svg"}
            width={100}
            height={100}
            alt="head-shot image"
            className="w-1/2 -rotate-1 rounded-sm shadow-md aspect-square border border-muted "
          />
          <div className="flex flex-col gap-4 w-1/2 text-black p-2">
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold ">Name</h5>
              <span className="text-xl font-bold">Jeremy Collins</span>
            </div>
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold">Status</h5>
              <span className="text-xl font-bold ">Suspect</span>
            </div>
          </div>
        </div>
        {/* Second Row */}
        <div className=" flex gap-2 mt-3">
          <div className=" flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-amber-800"
            >
              Name
            </label>
            <input
              name="name"
              title="name"
              type="text"
              className="border border-amber-800/40 rounded-sm bg-background-500/60 p-1 focus:outline-none focus:bg-background focus:border-amber-800"
            />
          </div>
        </div>
        {/* Third Row */}
        <div className=" flex gap-2 ">
          <div className="w-1/3 flex flex-col gap-1 p-3  bg-amber-900/20 rounded-sm">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-amber-800"
            >
              Victim
            </label>
            <Switch className="my-1 " />
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
        <div className="mb-3 md:mb-6 h-full gap-2 ">
          <div className=" flex flex-col gap-1 p-3 w-full bg-amber-900/20 rounded-sm">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-amber-800"
            >
              Notes
            </label>
            <textarea
              name="name"
              title="name"
              className="h-full min-h-[300px] p-3 border border-amber-800/40 rounded-sm bg-background-500/60 focus:outline-none focus:bg-background focus:border-amber-800"
            />
          </div>
        </div>
        {/* {previewElement} */}
      </div>
    );
  }, []);

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="h-full bg-[#E4C18E] p-1.5 border border-muted ">
          <DrawerHeader className="p-1.5">
            <DrawerTitle className="hidden">Preview</DrawerTitle>
          </DrawerHeader>
          {renderPreviewContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={`hidden md:flex absolute h-[calc(100vh-64px-64px)] top-[calc(64px+32px)] rounded-b-sm bg-[#E4C18E] p-6 border border-muted w-1/3 min-w-[450px] max-w-[650px] ${
        !isOpen ? "-translate-x-[90%] rotate-6" : "translate-x-0 rotate-0"
      }  transition-transform duration-250  z-50 `}
    >
      {/**Top Cover */}
      <div
        className={`${
          isOpen
            ? "-translate-x-[103%] -translate-y-5"
            : " -translate-x-15  -translate-y-5 shadow-lg"
        } w-full h-full absolute bg-[#E4C18E] p-6 z-50 rounded-sm transition-transform duration-250 border border-muted`}
      >
        <div className="w-full h-full bg-background/20 rounded-sm border border-muted "></div>
      </div>
      {/**Tongue */}
      <div className="h-24 w-12 flex items-center justify-center bg-[#E4C18E] absolute -right-8 -top-[0.85px] border-r border-t border-muted p-2 rounded-r-md ">
        <div className="h-full w-2 rounded-xl ml-3 bg-muted"></div>
      </div>
      {renderPreviewContent}
      {/* {previewElement} */}
    </div>
  );
};
