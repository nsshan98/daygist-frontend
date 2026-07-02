"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { ChevronRight, Check, FolderTree, X } from "lucide-react";
import { useGetCategoryTree } from "../hooks/category-query";
import { Category } from "@/types/category.types";

interface CategoryPickerValue {
  categoryId: string;
  categoryPath: string[];
}

interface CategoryPickerProps {
  value: CategoryPickerValue;
  onChange: (value: CategoryPickerValue) => void;
}

function flattenCategories(list: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of list) {
    result.push(cat);
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

function buildPath(
  root: Category[],
  targetId: string,
  trail: Category[] = []
): Category[] | null {
  for (const cat of root) {
    if (cat._id === targetId) return [...trail, cat];
    if (cat.children?.length) {
      const found = buildPath(cat.children, targetId, [...trail, cat]);
      if (found) return found;
    }
  }
  return null;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { data, isLoading } = useGetCategoryTree();
  const categories = useMemo(() => data?.data ?? [], [data?.data]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return flat.filter((cat) => cat.name.toLowerCase().includes(q));
  }, [query, flat, categories]);

  const selectedCat = value.categoryId
    ? flat.find((c) => c._id === value.categoryId)
    : null;

  const selectedLabel = selectedCat
    ? (() => {
        const p = buildPath(categories, selectedCat._id);
        return p ? p.map((c) => c.name).join(" > ") : selectedCat.name;
      })()
    : null;

  const handleSelect = (cat: Category) => {
    const path = buildPath(categories, cat._id);
    if (!path) return;
    onChange({
      categoryId: cat._id,
      categoryPath: path.map((c) => c._id),
    });
    setOpen(false);
    setQuery("");
    setExpandedIds(new Set());
  };

  const toggleExpand = (catId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setExpandedIds(new Set());
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Search categories..."
        value={open ? query : selectedLabel ?? ""}
        onFocus={() => handleOpenChange(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) handleOpenChange(true);
        }}
        endIcon={
          open || selectedLabel ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (open) {
                  setQuery("");
                } else {
                  handleOpenChange(true);
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {open ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
            </button>
          ) : undefined
        }
        readOnly={!open}
        className="cursor-pointer"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No categories found
              </div>
            ) : (
              filtered.map((cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                const isExpanded = expandedIds.has(cat._id);
                const isSelected = value.categoryId === cat._id;

                return (
                  <div key={cat._id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpand(cat._id);
                        } else {
                          handleSelect(cat);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent ${
                        isSelected ? "bg-primary/5 text-primary font-medium" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FolderTree className="w-4 h-4 text-muted-foreground shrink-0" />
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        <span className="truncate">{cat.name}</span>
                        {hasChildren && (
                          <span className="text-xs text-muted-foreground">
                            ({cat.children.length})
                          </span>
                        )}
                      </span>
                      {hasChildren && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {hasChildren && isExpanded && (
                      <div className="bg-muted/30 border-t border-b">
                        {cat.children!.map((sub) => {
                          const subHasChildren = sub.children && sub.children.length > 0;
                          const isSubSelected = value.categoryId === sub._id;
                          const isSubExpanded = expandedIds.has(sub._id);

                          return (
                            <div key={sub._id}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (subHasChildren) {
                                    toggleExpand(sub._id);
                                  } else {
                                    handleSelect(sub);
                                  }
                                }}
                                className={`w-full flex items-center justify-between pl-8 pr-3 py-2 text-sm text-left transition-colors hover:bg-accent ${
                                  isSubSelected ? "bg-primary/5 text-primary font-medium" : ""
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  {isSubSelected && (
                                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                  )}
                                  <span className="truncate">{sub.name}</span>
                                  {subHasChildren && (
                                    <span className="text-xs text-muted-foreground">
                                      ({sub.children!.length})
                                    </span>
                                  )}
                                </span>
                                {subHasChildren && (
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${
                                      isSubExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                )}
                              </button>

                              {subHasChildren && isSubExpanded && (
                                <div className="bg-muted/50 border-t border-b">
                                  {sub.children!.map((child) => {
                                    const isChildSelected = value.categoryId === child._id;
                                    return (
                                      <button
                                        key={child._id}
                                        type="button"
                                        onClick={() => handleSelect(child)}
                                        className={`w-full flex items-center gap-2 pl-14 pr-3 py-2 text-sm text-left transition-colors hover:bg-accent ${
                                          isChildSelected
                                            ? "bg-primary/5 text-primary font-medium"
                                            : ""
                                        }`}
                                      >
                                        {isChildSelected && (
                                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                        )}
                                        <span className="truncate">{child.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
