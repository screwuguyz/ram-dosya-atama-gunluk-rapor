"use client";
import React, {createContext, useContext, useState, useRef, useEffect} from "react";

type Ctx = {
  value?: string;
  label?: string;
  onValueChange?: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  setLabel: (s: string) => void;
};
const SelectCtx = createContext<Ctx | null>(null);

export function Select({
  children, value, onValueChange,
}: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void; }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string>("");
  return (
    <SelectCtx.Provider value={{ value, onValueChange, open, setOpen, label, setLabel }}>
      <div className="relative inline-block">{children}</div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger(
  { className, ...props }: React.ComponentPropsWithoutRef<"button">
) {
  const ctx = useContext(SelectCtx)!;
  return (
    <button type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm bg-white ${className||""}`}
      {...props}
    />
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectCtx)!;
  return <span>{ctx.label || ctx.value || placeholder || "Seç"}</span>;
}

export function SelectContent(
  { children, className }: { children: React.ReactNode; className?: string }
) {
  const ctx = useContext(SelectCtx)!;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) ctx.setOpen(false);
    }
    if (ctx.open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [ctx]);

  if (!ctx.open) return null;
  return (
    <div ref={ref}
      className={`absolute z-50 mt-1 min-w-[8rem] rounded-md border bg-white shadow p-1 ${className||""}`}>
      {children}
    </div>
  );
}

export function SelectItem(
  { children, value, className, ...props }:
  { children: React.ReactNode; value: string; className?: string } & React.ComponentPropsWithoutRef<"div">
) {
  const ctx = useContext(SelectCtx)!;
  return (
    <div role="option"
      onClick={() => { ctx.onValueChange?.(value); ctx.setLabel(String(children)); ctx.setOpen(false); }}
      className={`cursor-pointer px-2 py-1 text-sm rounded hover:bg-gray-100 ${className||""}`}
      {...props}
    >
      {children}
    </div>
  );
}
