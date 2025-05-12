"use client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCaseContext } from "@/providers/CaseStateProvider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../global/Button";

export const Preview = () => {
  const { previewElement, setPreviewElement } = useCaseContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // derive open state straight from previewElement
  const isOpen = Boolean(previewElement);

  // when the drawer wants to close, clear out the preview
  const handleOpenChange = (open: boolean) => {
    if (!open) setPreviewElement(null);
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="h-full bg-[#E4C18E] p-1.5 border border-muted ">
          <DrawerHeader className="p-1.5">
            <DrawerTitle>Preview</DrawerTitle>
          </DrawerHeader>
          <div className="h-full bg-[#F1E1CF] border border-muted rounded-md">
            {/* {previewElement} */}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="primary" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={`hidden md:flex absolute h-[calc(100vh-64px)]  bg-[#E4C18E] p-2 border border-muted w-1/3 min-w-[450px] ${
        !isOpen ? "-translate-x-[98%]" : "translate-x-0"
      }  transition-transform  z-50 `}
    >
        <div className="h-24 w-12 flex items-center justify-center bg-[#E4C18E] absolute -right-8 -top-[0.85px] border-r border-t border-muted p-2 rounded-r-md ">
            <div className="h-full w-2 rounded-xl ml-3 bg-muted"></div>
        </div>
      <div className="flex-1 z-40 bg-[#F1E1CF] border border-muted rounded-md">
        {/* {previewElement} */}
      </div>
    </div>
  );
};
