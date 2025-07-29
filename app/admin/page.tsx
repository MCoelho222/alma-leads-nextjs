"use client";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import StatusFilter from "./StatusFilter";
import SearchFilter from "./SearchFilter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: string;
  createdAt: Date;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 5;

  const totalPages = Math.ceil(total / pageSize);

  // Create a stable reference for the fetch function
  const fetchLeads = async (
    searchValue: string,
    statusValue: string,
    sortValue: string,
    pageValue: number
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        status: statusValue,
        sort: sortValue,
        page: pageValue.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/leads?${params}`);
      const data = await response.json();

      setLeads(data.leads);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(search, status, sort, page);
  }, [search, status, sort, page]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-[#f7f7ef] p-6 border-r">
        <h1 className="text-2xl font-bold mb-8">alma</h1>
        <nav className="space-y-4 text-sm font-medium">
          <div className="text-black">Leads</div>
          <div className="text-gray-400">Settings</div>
        </nav>
        <div className="absolute bottom-4 left-6 text-xs text-gray-500">
          <div className="rounded-full bg-black text-white w-7 h-7 flex items-center justify-center mb-1">
            A
          </div>
          Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-10 py-8">
        <h2 className="text-2xl font-bold mb-4">Leads</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <SearchFilter />
          <StatusFilter />
        </div>

        {/* Table */}
        <div className="w-full border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                {["Name", "Submitted", "Status", "Country"].map((label, i) => {
                  const fields = [
                    "firstName",
                    "createdAt",
                    "status",
                    "country",
                  ];
                  const field = fields[i];
                  const isActive = sort.startsWith(field);
                  const dir = isActive && sort.endsWith("asc") ? "desc" : "asc";
                  const href = `?search=${search}&status=${status}&sort=${field}:${dir}&page=1`;
                  return (
                    <th key={field} className="px-4 py-3">
                      <Link href={href} className="hover:underline">
                        {label}{" "}
                        {isActive ? (sort.endsWith("asc") ? "↑" : "↓") : "↓"}
                      </Link>
                    </th>
                  );
                })}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {lead.status === "REACHED_OUT"
                        ? "Reached Out"
                        : "Pending"}
                    </td>
                    <td className="px-4 py-3">{lead.country}</td>
                    <td className="px-4 py-3">
                      <form
                        action="/api/admin"
                        method="POST"
                        className="inline"
                      >
                        <input type="hidden" name="id" value={lead.id} />
                        {lead.status === "REACHED_OUT" ? (
                          <>
                            <input
                              type="hidden"
                              name="status"
                              value="PENDING"
                            />
                            <button
                              type="submit"
                              className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Mark as Pending
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="hidden"
                              name="status"
                              value="REACHED_OUT"
                            />
                            <button
                              type="submit"
                              className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                            >
                              Mark as Reached Out
                            </button>
                          </>
                        )}
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {/* Previous Button */}
            <Link
              href={{
                pathname: "/admin",
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.max(1, page - 1).toString(),
                },
              }}
              className={`px-3 py-2 rounded ${
                page <= 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </Link>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={{
                    pathname: "/admin",
                    query: {
                      ...Object.fromEntries(searchParams.entries()),
                      page: pageNum.toString(),
                    },
                  }}
                  className={`px-3 py-2 rounded ${
                    page === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}

            {/* Next Button */}
            <Link
              href={{
                pathname: "/admin",
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.min(totalPages, page + 1).toString(),
                },
              }}
              className={`px-3 py-2 rounded ${
                page >= totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
