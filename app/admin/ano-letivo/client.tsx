"use client";

import { useState, useCallback } from "react";
import { SchoolYearList, type SchoolYear } from "../_components/school-year-list";
import { SchoolYearForm } from "../_components/school-year-form";

interface AnoLetivoClientProps {
  initialYears: SchoolYear[];
}

export function AnoLetivoClient({ initialYears }: AnoLetivoClientProps) {
  const [years, setYears] = useState<SchoolYear[]>(initialYears);

  const handleCreated = useCallback((year: SchoolYear) => {
    setYears((prev) => [year, ...prev]);
  }, []);

  const handleYearsChange = useCallback((updated: SchoolYear[]) => {
    setYears(updated);
  }, []);

  return (
    <div className="space-y-6">
      <SchoolYearForm onCreated={handleCreated} />
      <SchoolYearList years={years} onYearsChange={handleYearsChange} />
    </div>
  );
}
