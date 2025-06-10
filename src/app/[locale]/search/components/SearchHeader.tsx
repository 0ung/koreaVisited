"use client";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface QuickCategory {
  category: string;
  label: string;
}

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  quickCategories: QuickCategory[];
  currentCategory: string;
  setCategory: (category: string) => void;
  viewMode: "list" | "map";
  setViewMode: Dispatch<SetStateAction<"list" | "map">>;
  t: (key: string) => string;
}

export default function SearchHeader({
  searchQuery,
  setSearchQuery,
  quickCategories,
  currentCategory,
  setCategory,
  viewMode,
  setViewMode,
  t,
}: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
        >
          {viewMode === "list" ? t("mapButton") : t("listButton")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickCategories.map(({ category, label }) => (
          <Button
            key={category}
            variant={currentCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setCategory(currentCategory === category ? "" : category)
            }
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
