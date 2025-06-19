'use client';

import { usePathname } from "next/navigation";

export const Footer = () => {
  const path = usePathname()
  console.log("Footer path:", path);

  if(path.includes('/cases/')) return null;
  return (
    <footer className="flex items-center justify-center w-full min-h-24 bg-primary-800">
      <p className="text-sm text-center text-background-500">
        Designed and developed by <a> Samuel Baran </a>
      </p>
    </footer>
  );
};
