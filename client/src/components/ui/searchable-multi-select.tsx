import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

interface SearchableMultiSelectProps<TValue extends string> {
  id?: string;
  values: readonly TValue[];
  options: readonly SearchableSelectOption<TValue>[];
  onChange: (values: TValue[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel: string;
}

export function SearchableMultiSelect<TValue extends string>({
  id,
  values,
  options,
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search options...",
  emptyText = "No results.",
  className,
  disabled = false,
  ariaLabel,
}: SearchableMultiSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(values), [values]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet],
  );

  const toggleOption = (value: TValue) => {
    if (selectedSet.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn("h-10 w-full justify-between font-normal", className)}
          >
            <span className={cn("truncate text-left", values.length === 0 && "text-muted-foreground")}>
              {values.length > 0 ? `${values.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => toggleOption(option.value)}
                >
                  <Check className={cn("h-4 w-4", selectedSet.has(option.value) ? "opacity-100" : "opacity-0")} />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary px-2 py-1 text-xs"
              onClick={() => toggleOption(option.value)}
            >
              {option.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
