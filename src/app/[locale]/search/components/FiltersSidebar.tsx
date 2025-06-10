"use client";
import { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import type { SearchFilters } from "@/types";

interface Props {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  t: (key: string) => string;
}

export default function FiltersSidebar({ filters, setFilters, t }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">{t("filterTitle")}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("labelMinRating")}
          </label>
          <select
            value={filters.rating}
            onChange={(e) =>
              setFilters((p) => ({ ...p, rating: Number(e.target.value) }))
            }
            className="w-full p-2 border rounded-md"
          >
            <option value={0}>{t("optionAll")}</option>
            <option value={4}>{t("optionRating4")}</option>
            <option value={4.5}>{t("optionRating45")}</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("labelDataQuality")}
          </label>
          <select
            value={filters.dataQuality}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                dataQuality: Number(e.target.value),
              }))
            }
            className="w-full p-2 border rounded-md"
          >
            <option value={70}>{t("optionQuality70")}</option>
            <option value={80}>{t("optionQuality80")}</option>
            <option value={90}>{t("optionQuality90")}</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("labelCrowdLevel")}
          </label>
          <select
            value={filters.crowdLevel}
            onChange={(e) =>
              setFilters((p) => ({ ...p, crowdLevel: e.target.value }))
            }
            className="w-full p-2 border rounded-md"
          >
            <option value="">{t("optionAll")}</option>
            <option value="low">{t("optionCrowdLow")}</option>
            <option value="medium">{t("optionCrowdMedium")}</option>
            <option value="high">{t("optionCrowdHigh")}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
