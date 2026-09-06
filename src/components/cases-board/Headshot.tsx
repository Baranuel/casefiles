/* eslint-disable @next/next/no-img-element */
import { memo, useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Content } from "@/types/contents";
import { PORTRAITS, toLocalImage } from "@/lib/local-images";
import { Button } from "../ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";

const LazyImage = ({
  src,
  alt,
  className = "",
  onClick,
  animated = false,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  className?: string;
  animated?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);

  const animation = `${loaded ? "scale-100" : "scale-90"} transition-all duration-300 ease-out`;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton placeholder */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        className={`object-cover w-full h-full transition-all duration-300 ease-out rounded-lg ${animated && animation}`}
        {...props}
      />
    </div>
  );
};

type SelectHeadshotProps = {
  imagePath?: string | null;
  onImageChange?: (
    newState: Partial<Content>,
    options?: { noDelay: true }
  ) => void;
};

const Headshot = memo(({ imagePath, onImageChange }: SelectHeadshotProps) => {
  const localImagePath = toLocalImage(imagePath);
  const [previewImage, setPreviewImage] = useState<string | null>(
    localImagePath || null
  );
  const [open, setOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["headshot"],
    initialPageParam: 0,
    queryFn: async (context) => {
      const { pageParam } = context;
      const limit = 10;
      const images = PORTRAITS.slice(pageParam, pageParam + limit);
      const nextCursor = pageParam + limit;

      return {
        images,
        cursor: nextCursor < PORTRAITS.length ? nextCursor : null,
      };
    },
    getNextPageParam: (lastPage: { images: string[]; cursor: number | null }) =>
      lastPage.cursor ?? undefined,
  });

  const imageData = data?.pages.flatMap((page) => page.images) || [];
  const observer = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback<IntersectionObserverCallback>(
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observer.current?.disconnect();
      if (node) {
        observer.current = new IntersectionObserver(handleIntersect, {
          root: null,
          rootMargin: "0px 0px 300px 0px",
          threshold: 0.1,
        });
        observer.current.observe(node);
      }
    },
    [handleIntersect]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img
          src={localImagePath || "/avatar-m.svg"}
          alt="Current headshot"
          className="w-full h-full cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className="border-amber-900/20 overflow-hidden w-[90vw] h-[90vh] max-w-[400px] max-h-[90vh] md:max-w-[1500px] md:max-h-[90vh] flex flex-col p-3 md:p-5 bg-[#F1E1CF]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl lg:text-2xl">
            Change Image
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>Current:</DialogDescription>
        <div className="h-full flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Current Preview */}
          <div
            onClick={() => fetchNextPage()}
            className="flex-shrink-0 md:basis-1/3 lg:basis-1/4 flex items-start md:justify-start"
          >
            {previewImage && (
              <img
                src={previewImage}
                alt="Selected headshot preview"
                className="aspect-square w-full max-w-[160px] md:max-w-[250px] rounded-md"
              />
            )}
          </div>
          {/* Scrollable Grid */}
          <div className="flex-1 overflow-scroll h-full">
            <div className="rounded-md border border-amber-900/10 bg-stone-100 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 p-2">
              {imageData.map((src, index) => (
                <div
                  ref={index === imageData.length - 1 ? sentinelRef : null}
                  key={src}
                  onClick={() => setPreviewImage(src)}
                  className="aspect-square w-full"
                >
                  <LazyImage
                    src={src}
                    alt={`headshot ${index}`}
                    animated
                    className="w-full h-full cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={previewImage === localImagePath}
            onClick={() => {
              onImageChange?.({ image: previewImage }, { noDelay: true });
              setOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

Headshot.displayName = "SelectHeadshot";

export default Headshot;
