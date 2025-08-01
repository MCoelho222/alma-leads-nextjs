"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("status", e.target.value);
    } else {
      params.delete("status");
    }

    // Only reset to page 1 if we're actually changing the filter
    const currentStatus = searchParams.get("status") || "";
    if (e.target.value !== currentStatus) {
      params.set("page", "1");
    }

    router.push(`/admin?${params.toString()}`);
  };

  return (
    <select
      value={searchParams.get("status") || ""}
      onChange={handleStatusChange}
      className="border px-3 py-2 rounded w-full sm:w-auto text-sm lg:text-base"
    >
      <option value="">All Statuses</option>
      <option value="PENDING">Pending</option>
      <option value="REACHED_OUT">Reached Out</option>
    </select>
  );
}
