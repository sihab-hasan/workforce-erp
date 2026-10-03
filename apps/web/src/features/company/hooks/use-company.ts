import { useEffect, useState, useCallback } from "react";
import { fetchAboutData, fallbackAboutData } from "../api/company.api";
import type { AboutPageData } from "../types/company.types";

export function useCompanyAbout() {
  const [data, setData] = useState<AboutPageData>(fallbackAboutData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await fetchAboutData();
      setData(result);
    } catch {
      setIsError(true);
      setData(fallbackAboutData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    isError,
    refetch: loadData,
  };
}
