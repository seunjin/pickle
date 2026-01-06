"use client";
import { useState } from "react";
import { cn } from "../lib/utils";
import {
  Select as OriginSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./origin-select";

export type SelectOptionValue = string;

export type SelectOption = {
  value: SelectOptionValue;
  label: string;
  disabled?: boolean;
};

interface SelectProps {
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  placeholder?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}
export function Select({
  options,
  defaultValue,
  placeholder,
  value,
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div>
      <OriginSelect
        open={open}
        onOpenChange={setOpen}
        value={value ?? defaultValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          className={cn(
            "w-[180px]",
            open && "outline outline-base-primary [&_svg]:rotate-180",
          )}
        >
          <SelectValue placeholder={placeholder ?? "select"} />
        </SelectTrigger>
        <SelectContent position="popper" align="start" sideOffset={4}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </OriginSelect>
    </div>
  );
}
