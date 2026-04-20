'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

type FlatAnalyticsRow = {
  flatNumber: string;
  initiativeName: string;
  initiativeSlug: string;
  paid: number;
  expected: number;
  balance: number;
  paymentCount: number;
  lastPaidAt: string | null;
  email: string | null;
};

export default function AnalyticsPage() {
  const [allData, setAllData] = useState<FlatAnalyticsRow[]>([]);
  const [filteredData, setFilteredData] = useState<FlatAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedInitiative, setSelectedInitiative] = useState('*');
  const [selectedFlat, setSelectedFlat] = useState('*');

  // Get unique initiatives and flats for filter options
  const initiatives = Array.from(
    new Map(allData.map((row) => [row.initiativeSlug, { slug: row.initiativeSlug, name: row.initiativeName }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const flats = Array.from(new Set(allData.map((row) => row.flatNumber))).sort((a, b) =>
    a.localeCompare(b)
  );

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch('/api/analytics/all');
        const result = await res.json();
        setAllData(result);
        setFilteredData(result);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = allData;

    if (selectedInitiative !== '*') {
      filtered = filtered.filter((row) => row.initiativeSlug === selectedInitiative);
    }

    if (selectedFlat !== '*') {
      filtered = filtered.filter((row) => row.flatNumber === selectedFlat);
    }

    setFilteredData(filtered);
  }, [selectedInitiative, selectedFlat, allData]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef8f2_0%,_#f8fbf8_42%,_#eef6f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f7a5e]"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2937]">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              Initiative = {selectedInitiative === '*' ? '*' : selectedInitiative} | Flats = {selectedFlat === '*' ? '*' : selectedFlat}
            </p>
          </div>
          <UserButton />
        </header>

        {/* Filters */}
        <div className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
            Filter options
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Initiative Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#2f7a5e]">
                Initiative Filter
              </label>
              <select
                value={selectedInitiative}
                onChange={(e) => setSelectedInitiative(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d7e6dc] bg-white px-4 py-2 text-[#1f2937] focus:border-[#2f7a5e] focus:outline-none focus:ring-2 focus:ring-[#2f7a5e]/20"
              >
                <option value="*">* (All Initiatives)</option>
                {initiatives.map((init) => (
                  <option key={init.slug} value={init.slug}>
                    {init.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Flat Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#2f7a5e]">
                Flat Filter
              </label>
              <select
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d7e6dc] bg-white px-4 py-2 text-[#1f2937] focus:border-[#2f7a5e] focus:outline-none focus:ring-2 focus:ring-[#2f7a5e]/20"
              >
                <option value="*">* (All Flats)</option>
                {flats.map((flat) => (
                  <option key={flat} value={flat}>
                    {flat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
            Payment analytics
          </p>
          {loading ? (
            <div className="mt-6 text-center text-[#6b7280]">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="mt-6 text-center text-[#6b7280]">No data available</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#dfebe4] bg-[#fbfdfb]">
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Flat</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Initiative</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Expected</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Paid</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Balance</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Payments</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#2f7a5e]">Last Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr
                      key={`${row.flatNumber}-${row.initiativeSlug}-${idx}`}
                      className="border-b border-[#e7efe9] hover:bg-[#f7fbf8] transition"
                    >
                      <td className="px-4 py-4 font-semibold text-[#1f2937]">
                        {row.flatNumber}
                      </td>
                      <td className="px-4 py-4 text-[#6b7280]">
                        {row.initiativeName}
                      </td>
                      <td className="px-4 py-4 text-[#6b7280]">
                        Rs {row.expected.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#215b47]">
                        Rs {row.paid.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-4 py-4 font-semibold ${
                        row.balance > 0 ? 'text-[#b91c1c]' : 'text-[#215b47]'
                      }`}>
                        Rs {row.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-[#1f2937]">
                        {row.paymentCount}
                      </td>
                      <td className="px-4 py-4 text-[#6b7280]">
                        {row.lastPaidAt
                          ? new Date(row.lastPaidAt).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[#e7efe9] bg-[#f7fbf8] px-4 py-3 text-sm text-[#6b7280]">
                Showing {filteredData.length} of {allData.length} records
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
