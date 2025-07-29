"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  // Debounce the search term to avoid too many API calls
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Only update URL if the search term actually changed from what's in URL
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearchTerm !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());

      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page when searching

      router.push(`/admin?${params.toString()}`);
    }
  }, [debouncedSearchTerm, router, searchParams]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      className="border px-3 py-2 rounded w-64"
    />
  );
}
