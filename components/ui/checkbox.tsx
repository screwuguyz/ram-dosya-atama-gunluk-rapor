"use client";
import * as React from "react";

type Props = {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked">;

export const Checkbox: React.FC<Props> = ({ checked, onCheckedChange, className, ...rest }) => (
  <input
    type="checkbox"
    className={`h-4 w-4 rounded border ${className || ""}`}
    checked={!!checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    {...rest}
  />
);
