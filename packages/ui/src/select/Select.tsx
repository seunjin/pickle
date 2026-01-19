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
  options: SelectOption[];
  disabled?: boolean;
  defaultValue?: SelectOptionValue;
  placeholder?: React.ReactNode;
  value?: SelectOptionValue;
  onValueChange?: (value: SelectOptionValue) => void;
}
export function Select({
  options,
  disabled,
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
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "w-full bg-form-input-background",
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
