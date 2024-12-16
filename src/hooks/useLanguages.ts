import { useState, useEffect } from "react";
import { getLanguages } from "../api/languagesApi";
import { Language } from "../models/Language";

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await getLanguages();
        setLanguages(data);
      } catch (error) {
        console.error("Error fetching languages", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguages();
  }, []);

  return { languages, isLoading };
};
