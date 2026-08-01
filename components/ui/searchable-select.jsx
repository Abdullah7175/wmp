"use client";

import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filterable single-select list (works inside Dialogs).
 * options: array of objects
 * getValue(opt) -> string id
 * getLabel(opt) -> display string
 * getSearchText(opt) -> optional extra text to match
 */
export default function SearchableSelect({
    options = [],
    value,
    onValueChange,
    placeholder = "Search and select...",
    emptyText = "No results found",
    getValue = (o) => String(o?.id ?? ""),
    getLabel = (o) => o?.name || o?.label || String(o?.id ?? ""),
    getSearchText,
    className,
    listClassName,
    disabled = false,
}) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        setQuery("");
    }, [options]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => {
            const label = String(getLabel(opt) || "").toLowerCase();
            const extra = getSearchText
                ? String(getSearchText(opt) || "").toLowerCase()
                : "";
            return label.includes(q) || extra.includes(q);
        });
    }, [options, query, getLabel, getSearchText]);

    const selected = options.find((o) => getValue(o) === String(value));

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9"
                    disabled={disabled}
                    autoComplete="off"
                />
            </div>
            {selected && (
                <p className="text-xs text-gray-600">
                    Selected: <span className="font-medium">{getLabel(selected)}</span>
                </p>
            )}
            <div
                className={cn(
                    "max-h-48 overflow-y-auto border rounded-md divide-y bg-white",
                    listClassName
                )}
            >
                {filtered.length === 0 ? (
                    <p className="text-sm text-gray-500 p-3 text-center">{emptyText}</p>
                ) : (
                    filtered.map((opt) => {
                        const id = getValue(opt);
                        const active = String(value) === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                disabled={disabled}
                                onClick={() => onValueChange?.(id)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                                    active && "bg-blue-50 text-blue-800 font-medium"
                                )}
                            >
                                {getLabel(opt)}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
