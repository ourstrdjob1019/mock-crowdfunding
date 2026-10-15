import React from "react";

interface SectionDividerProps {
  weight?: "thin" | "medium" | "thick" | "ultra";
  withPunctuation?: boolean;
  label?: string;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  weight = "thick",
  withPunctuation = true,
  label,
  className = "",
}) => {
  const heightStyles = {
    thin: "h-[1px]",
    medium: "h-[2px]",
    thick: "h-[4px]",
    ultra: "h-[8px]",
  };

  return (
    <div className={`relative flex items-center my-12 md:my-16 ${className}`}>
      <div className={`w-full bg-black ${heightStyles[weight]}`} />
      {withPunctuation && (
        <div className="absolute right-0 flex items-center space-x-2 pl-4 bg-white">
          {label && (
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 font-semibold">
              {label}
            </span>
          )}
          <div className="w-3 h-3 bg-black border border-white outline outline-1 outline-black" />
        </div>
      )}
    </div>
  );
};
