"use client";

import StatusFilter from "./StatusFilter";
import SearchFilter from "./SearchFilter";
import EditLeadModal from "./EditLeadModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  website: string;
  categories: string[];
  reason: string;
  status: string;
  createdAt: string;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      const response = await fetch(`/api/admin/leads?${params}`, {
        headers: {
          Authorization: `Basic ${btoa("admin:password")}`,
        },
      });
      const data = await response.json();

      setLeads(data.leads);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleSaveLead = (updatedLead: Lead) => {
    // Update the lead in the local state
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      // Redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout API fails
      window.location.href = "/";
    }
  };

  useEffect(() => {
    fetchLeads(search, status, sort, page);
  }, [search, status, sort, page]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className="w-full lg:w-60 bg-gradient-to-br from-yellow-50 via-yellow-25 to-white p-4 lg:p-6 border-r lg:border-r border-b lg:border-b-0 relative"
        style={{
          background: "linear-gradient(to bottom right, #fffbeb, #fefce8, #ffffff)",
        }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">alma</h1>
        <nav className="text-base lg:text-lg font-medium text-left flex lg:flex-col flex-row gap-4 lg:gap-4 items-center lg:items-start justify-between lg:justify-start">
          <div className="flex lg:flex-col flex-row gap-4 items-center lg:items-start">
            <Link
              href="/admin"
              className="text-black px-3 lg:px-4 py-2 font-bold block hover:bg-gray-100 transition-colors rounded-lg"
            >
              Leads
            </Link>
            <div className="relative group">
              <Link
                href="#"
                className="text-gray-400 px-3 lg:px-4 py-2 font-bold block cursor-not-allowed rounded-lg"
                onClick={(e) => e.preventDefault()}
              >
                Settings
              </Link>
              <div className="absolute left-0 top-8 bg-gray-50 text-gray-700 text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 shadow-sm border border-gray-200">
                To be implemented
              </div>
            </div>
          </div>
          {/* Mobile logout button */}
          <button
            onClick={handleLogout}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors ml-auto"
            title="Logout"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </nav>
        <div className="hidden lg:flex absolute bottom-4 left-4 right-4 text-sm text-gray-500 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-gray-300 text-gray-700 w-8 h-8 flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-bold">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Logout"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 lg:px-10 py-6 lg:py-8">
        <h2 className="text-xl lg:text-2xl font-bold mb-4">Leads</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <SearchFilter />
          <StatusFilter />
        </div>

        {/* Table */}
        <div className="w-full border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-gray-100 text-gray-500 text-xs lg:text-sm">
                <tr>
                  {["Name", "Submitted", "Status", "Country"].map((label, i) => {
                    const fields = ["firstName", "createdAt", "status", "country"];
                    const field = fields[i];
                    const isActive = sort.startsWith(field);
                    const dir = isActive && sort.endsWith("asc") ? "desc" : "asc";
                    const href = `?search=${search}&status=${status}&sort=${field}:${dir}&page=1`;
                    return (
                      <th key={field} className="px-2 lg:px-4 py-3">
                        <Link href={href} className="hover:underline">
                          {label} {isActive ? (sort.endsWith("asc") ? "↑" : "↓") : "↓"}
                        </Link>
                      </th>
                    );
                  })}
                  <th className="px-2 lg:px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-2 lg:px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 lg:px-4 py-8 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEditLead(lead)}
                    >
                      <td className="px-2 lg:px-4 py-3">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-2 lg:px-4 py-3">
                        <span className="hidden sm:inline">
                          {new Date(lead.createdAt).toLocaleString()}
                        </span>
                        <span className="sm:hidden">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-2 lg:px-4 py-3">
                        {lead.status === "REACHED_OUT" ? "Reached Out" : "Pending"}
                      </td>
                      <td className="px-2 lg:px-4 py-3">{lead.country}</td>
                      <td className="px-2 lg:px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <form action="/api/admin" method="POST" className="inline">
                          <input type="hidden" name="id" value={lead.id} />
                          {lead.status === "REACHED_OUT" ? (
                            <>
                              <input type="hidden" name="status" value="PENDING" />
                              <button
                                type="submit"
                                className="text-xs px-2 lg:px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                <span className="hidden sm:inline">Mark as Pending</span>
                                <span className="sm:hidden">Pending</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="status" value="REACHED_OUT" />
                              <button
                                type="submit"
                                className="text-xs px-2 lg:px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                              >
                                <span className="hidden sm:inline">Mark as Reached Out</span>
                                <span className="sm:hidden">Reached</span>
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center lg:justify-end items-center space-x-2 lg:space-x-3 mt-6 lg:mt-8">
            {/* Previous Arrow */}
            <Link
              href={{
                pathname: "/admin",
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.max(1, page - 1).toString(),
                },
              }}
              className={`text-base lg:text-lg px-2 lg:px-0 ${
                page <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-black"
              }`}
            >
              &lt;
            </Link>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={{
                  pathname: "/admin",
                  query: {
                    ...Object.fromEntries(searchParams.entries()),
                    page: pageNum.toString(),
                  },
                }}
                className={`text-sm w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center ${
                  page === pageNum
                    ? "font-bold text-black border border-gray-400"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {pageNum}
              </Link>
            ))}

            {/* Next Arrow */}
            <Link
              href={{
                pathname: "/admin",
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.min(totalPages, page + 1).toString(),
                },
              }}
              className={`text-base lg:text-lg px-2 lg:px-0 ${
                page >= totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              &gt;
            </Link>
          </div>
        )}
      </main>

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
      />
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
