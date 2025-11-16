"use client"

import { useState, useEffect, useRef } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn2 } from '@/lib/utils';

export function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an item...",
  className,
  onSearch,
  isLoading = false,
  emptyMessage = "No results found.",
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const popoverRef = useRef(null);
  const selectingRef = useRef(false);

  useEffect(() => {
    if (!onSearch) return;
    const handle = setTimeout(() => {
      onSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm, onSearch]);

  const filteredOptions = onSearch
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          {value && value !== 'none'
            ? options.find((option) => String(option.value) === String(value))?.label || placeholder
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" ref={popoverRef} align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false} filter={() => 1}>
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.length === 0 && !isLoading && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                  {emptyMessage}
                </div>
              )}
              {filteredOptions.map((option) => {
                const optionValueStr = String(option.value);
                const currentValueStr = value ? String(value) : '';
                const isSelected = currentValueStr === optionValueStr;
                const handleItemClick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (selectingRef.current) return;
                      selectingRef.current = true;
                      const valueToSet = option.value;
                      console.log('[SearchableDropdown] Item clicked:', valueToSet, option.label);
                      if (onChange) {
                        onChange(valueToSet);
                      }
                      setOpen(false);
                      setSearchTerm("");
                      setTimeout(() => {
                        selectingRef.current = false;
                      }, 200);
                    };
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={handleItemClick}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleItemClick(e);
                    }}
                    className={cn2(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground"
                    )}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Check
                      className={cn2(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}