import { useState, useRef, useEffect } from 'react';

interface BottomDrawerProps {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomDrawer({ isMobile, open, onClose, children }: BottomDrawerProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const THRESHOLD = 100; // px to drag before closing

  // Reset dragOffset whenever the drawer opens/closes
  useEffect(() => {
    setDragOffset(0);
    setDragging(false);
    startYRef.current = null;
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current == null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    // only allow dragging down
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragOffset > THRESHOLD) {
      onClose();
    } else {
      // snap back
      setDragOffset(0);
    }
    startYRef.current = null;
  };

  if (!isMobile) return null;

  // We combine the open/closed percentage with the current drag offset in px
  const basePercent = open ? 0 : 100;
  const transform = `translateY(calc(${basePercent}% + ${dragOffset}px))`;
  const transition = dragging ? 'none' : 'transform 0.3s ease';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30"
          onClick={onClose}
        />
      )}

      <div
        className="fixed inset-x-0 bottom-0 z-50"
        style={{ transform, transition }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-[#E4C18E] max-h-[75vh] overflow-auto p-4 border-t border-muted rounded-t-lg">
          {children}
        </div>
      </div>
    </>
  );
}
