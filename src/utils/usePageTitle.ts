import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — HomeTaste`;
    return () => {
      document.title = "HomeTaste";
    };
  }, [title]);
}
