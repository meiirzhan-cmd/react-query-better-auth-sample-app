"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useInboxStore } from "@/stores/inbox-store";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { filterOptions } from "./data";

const sortOptions = [
  { label: "Newest first", field: "receivedAt", order: "desc" },
  { label: "Oldest first", field: "receivedAt", order: "asc" },
  { label: "Priority", field: "priority", order: "desc" },
  { label: "Sender (A-Z)", field: "from", order: "asc" },
  { label: "Sender (Z-A)", field: "from", order: "desc" },
] as const;

export function FilterBar() {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const {
    sort,
    setSort,
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
    selectedMessageIds,
    clearSelection,
  } = useInboxStore();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSort = sortOptions.find(
    (opt) => opt.field === sort.field && opt.order === sort.order,
  );

  const handleFilterToggle = (
    type: "status" | "priority" | "category" | "has",
    value: string,
    label: string,
  ) => {
    const filterId = `${type}-${value}`;
    const exists = activeFilters.some((f) => f.id === filterId);

    if (exists) {
      removeFilter(filterId);
    } else {
      addFilter({ id: filterId, type, label, value });
    }
  };

  const isFilterActive = (type: string, value: string) => {
    return activeFilters.some((f) => f.id === `${type}-${value}`);
  };

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Left side: Bulk actions or filters */}
      <div className="flex items-center gap-2">
        {selectedMessageIds.size > 0 ? (
          // Bulk action mode
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              <X className="mr-1 h-3 w-3" />
              Clear ({selectedMessageIds.size})
            </Button>
          </motion.div>
        ) : (
          // Filter mode
          <>
            {/* Filter dropdown */}
            <div ref={filterRef} className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "gap-1.5",
                  activeFilters.length > 0 &&
                    "text-violet-600 dark:text-violet-400",
                )}
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <span className="ml-1 rounded-full bg-violet-100 px-1.5 text-xs font-medium text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                    {activeFilters.length}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isFilterOpen && "rotate-180",
                  )}
                />
              </Button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {filterOptions.map((group) => (
                      <div key={group.group} className="mb-2 last:mb-0">
                        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          {group.group}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={item.value}
                            onClick={() =>
                              handleFilterToggle(
                                item.type,
                                item.value,
                                item.label,
                              )
                            }
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                              isFilterActive(item.type, item.value)
                                ? "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
                            )}
                          >
                            {item.icon && (
                              <item.icon
                                className="h-4 w-4"
                                style={
                                  item.color ? { color: item.color } : undefined
                                }
                              />
                            )}
                            <span className="flex-1 text-left">
                              {item.label}
                            </span>
                            {isFilterActive(item.type, item.value) && (
                              <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}

                    {activeFilters.length > 0 && (
                      <>
                        <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />
                        <button
                          onClick={clearFilters}
                          className="flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <X className="h-3 w-3" />
                          Clear all filters
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active filter pills */}
            <AnimatePresence mode="popLayout">
              {activeFilters.map((filter) => (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => removeFilter(filter.id)}
                  className="group flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:hover:bg-violet-900"
                >
                  {filter.label}
                  <X className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                </motion.button>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Right side: Sort */}
      <div ref={sortRef} className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="gap-1.5"
        >
          {sort.order === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          {currentSort?.label || "Sort"}
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              isSortOpen && "rotate-180",
            )}
          />
        </Button>

        <AnimatePresence>
          {isSortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            >
              {sortOptions.map((option) => (
                <button
                  key={`${option.field}-${option.order}`}
                  onClick={() => {
                    setSort({ field: option.field, order: option.order });
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    sort.field === option.field && sort.order === option.order
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
                  )}
                >
                  {option.label}
                  {sort.field === option.field &&
                    sort.order === option.order && (
                      <Check className="h-4 w-4" />
                    )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FilterBar;
