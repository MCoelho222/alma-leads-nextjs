"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

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
    <div className="relative w-full sm:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="border px-3 py-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
      />
    </div>
  );
}
