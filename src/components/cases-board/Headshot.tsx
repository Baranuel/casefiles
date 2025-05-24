/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@/types/contents";
import { useCdnApi } from "@/hooks/use-cdn-api";

type SelectHeadshotProps = {
  imagePath?: string | null;
  onImageChange?: (
    newState: Partial<Content>,
    options?: { noDelay: true }
  ) => void;
};

const Headshot = memo(({ imagePath, onImageChange }: SelectHeadshotProps) => {
  const cdnApi = useCdnApi();
  const { data } = useQuery({
    queryKey: ["headshot"],
    queryFn: async () => {
        const data = await cdnApi.getImages();
        return data
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imagePath || "/avatar-m.svg"}
          alt="Default Headshot"
          className="w-full h-full object-cover cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className=" border-amber-900/20 overflow-hidden w-[90vw] h-[90vh] max-w-[400px] max-h-[90vh] md:max-w-[1200px] md:max-h-[90vh] flex flex-col p-3 md:p-5 bg-[#F1E1CF]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl lg:text-2xl">
            Change Image
          </DialogTitle>
        </DialogHeader>
        <div className=" h-full flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Current Preview */}
          <div className="flex-shrink-0  md:basis-1/3 lg:basis-1/4 flex items-start  md:justify-start ">
            <img
              src={imagePath || ""}
              alt="current headshot"
              className="aspect-square w-full max-w-[160px] md:max-w-[200px] lg:max-w-[280px] object-cover rounded"
            />
          </div>
          {/* Scrollable Grid */}
          <div className="flex-1 overflow-scroll h-full ">
            <div className="rounded-md border border-amber-900/10 bg-stone-100 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-2">
              {data?.map((src: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square w-full overflow-hidden rounded-lg"
                  onClick={() =>
                    onImageChange?.({ image: src }, { noDelay: true })
                  }
                >
                  <img
                    src={src}
                    alt={`headshot ${index}`}
                    className="object-cover w-full h-full cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

Headshot.displayName = "SelectHeadshot";

export default Headshot;
