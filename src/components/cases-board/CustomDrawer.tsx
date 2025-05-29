import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { memo, useEffect } from "react";

 const CustomDrawer = memo(({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isMobile) {
    return (
      <>
        <div
          className={`${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } transition-opacity fixed inset-0 bg-black/30 z-50`}
          onClick={onClose}
        />
        <div
          className={`${
            !open ? "translate-y-[100%]" : "translate-y-0"
          }  transition-transform fixed inset-x-0 bottom-0 z-50`}
        >
          <div  className="flex flex-col gap-2 bg-[#E4C18E] h-[90vh] overflow-auto px-2 pt-2 border-t border-muted rounded-t-lg">
            <Button
              size={"xs"}
              className="bg-amber-900/80 text-white absolute z-50 right-4 top-4  max-w-8  self-end rounded-sm"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            {children}
          </div>
        </div>
      </>
    );
  } else
    return (
      <div
        className={`hidden md:flex absolute h-[calc(100vh-64px-64px)] top-[calc(64px+32px)] rounded-b-sm bg-[#E4C18E] p-6 border border-muted w-1/3 min-w-[450px] max-w-[650px] ${
          !open ? "-translate-x-[90%] rotate-6" : "translate-x-0 rotate-0"
        }  transition-transform duration-250  z-30 `}
      >
        {/**Top Cover */}
        <div
          className={`${
            open
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
        <div className="flex flex-col gap-2 h-full w-full relative z-40 overflow-auto">
        {children}
        </div>
      </div>
    );
  })

CustomDrawer.displayName = "CustomDrawer";
export default CustomDrawer;