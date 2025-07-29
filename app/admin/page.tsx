import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import StatusFilter from "./StatusFilter";
import SearchFilter from "./SearchFilter";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const sort = searchParams.sort || "createdAt:desc";
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 5;

  const where: any = {
    AND: [
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      status ? { status } : {},
    ],
  };

  const [field, direction] = sort.split(":") as [string, "asc" | "desc"];
  const total = await prisma.lead.count({ where });
  const leads = await prisma.lead.findMany({
    where,
    orderBy: { [field]: direction },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

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
                      <a href={href} className="hover:underline">
                        {label}{" "}
                        {isActive ? (sort.endsWith("asc") ? "↑" : "↓") : "↓"}
                      </a>
                    </th>
                  );
                })}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {lead.status === "REACHED_OUT" ? "Reached Out" : "Pending"}
                  </td>
                  <td className="px-4 py-3">{lead.country}</td>
                  <td className="px-4 py-3">
                    <form action="/api/admin" method="POST" className="inline">
                      <input type="hidden" name="id" value={lead.id} />
                      {lead.status === "REACHED_OUT" ? (
                        <>
                          <input type="hidden" name="status" value="PENDING" />
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const href = `?search=${search}&status=${status}&sort=${sort}&page=${p}`;
            return (
              <a
                key={p}
                href={href}
                className={`px-3 py-1 border rounded ${
                  p === page ? "bg-black text-white" : ""
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
