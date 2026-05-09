'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { FlatAnalyticsRow } from '@/types/analytics';
import { exportTransformFromDataArray, generateAndDownloadCsv } from '@/lib/csv';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnalyticsPage() {

  // ######################################################################################### //
  //                             States for all and filter data.                               //
  // ######################################################################################### //

  /** allData: Stores the complete analytics data fetched from the server.*/
  const [allData, setAllData] = useState<FlatAnalyticsRow[]>([]);

  /** filteredData: Stores the analytics data after applying initiative and flat filters.*/
  const [filteredData, setFilteredData] = useState<FlatAnalyticsRow[]>([]);


  // ######################################################################################### //
  //                                   States for loading.                                     //
  // ######################################################################################### //

  /** loading: Indicates whether the data is currently being fetched.*/
  const [loading, setLoading] = useState(true);


  // ######################################################################################### //
  //                                   States for filters.                                     //
  // ######################################################################################### //

  /** selectedInitiative: Stores the slug of the currently selected initiative for filtering.*/
  const [selectedInitiative, setSelectedInitiative] = useState('*');

  /** selectedFlat: Stores the flat number of the currently selected flat for filtering.*/
  const [selectedFlat, setSelectedFlat] = useState('*');


  // ######################################################################################### //
  //                                   Analytics Part States.                                  //
  // ######################################################################################### //

  /** selectedAnalytics: Stores the currently selected type of analytics view (e.g., "Table view", "Graph view").*/
  const [selectedAnalytics, setSelectedAnalytics] = useState<string>("Table view");


  // ######################################################################################### //
  //                                   filter options.                                         //
  // ######################################################################################### //
  const initiatives = getInitiatives(allData);
  const flats = getFlats(allData);


  // ######################################################################################### //
  //                             Fetching data on component mount.                             //
  // ######################################################################################### //
  useEffect(() => { fetchAllData(); }, []);
  useEffect(() => {
    let filtered = allData;
    if (selectedInitiative !== '*') filtered = filtered.filter((row) => row.initiativeSlug === selectedInitiative);
    if (selectedFlat !== '*') filtered = filtered.filter((row) => row.flatNumber === selectedFlat);
    setFilteredData(filtered);
  }, [selectedInitiative, selectedFlat, allData]);


  // ######################################################################################### //
  //                             Helper functions to extract filter options.                   //       
  // ######################################################################################### //

  /** getInitiatives: Extracts unique initiatives from the analytics data for filter options. */
  function getInitiatives(allData: FlatAnalyticsRow[]) {
    return Array.from(
      new Map(
        allData.map((row) => [
          row.initiativeSlug,
          { slug: row.initiativeSlug, name: row.initiativeName },
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  /** getFlats: Extracts unique flat numbers from the analytics data for filter options. */
  function getFlats(allData: FlatAnalyticsRow[]) {
    return Array.from(
      new Set(allData.map((row) => row.flatNumber))
    ).sort((a, b) => a.localeCompare(b));
  }

  /** fetchAllData: Fetches all analytics data from the API. */
  async function fetchAllData() {
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
  }

  // ######################################################################################### //
  //                                       UI STUFF                                            //       
  // ######################################################################################### //

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef8f2_0%,#f8fbf8_42%,#eef6f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AnalyticsPageHeader selectedInitiative={selectedInitiative} selectedFlat={selectedFlat} />
        <AnalyticsPageFilterBand
          selectedInitiative={selectedInitiative}
          setSelectedInitiative={setSelectedInitiative}
          selectedFlat={selectedFlat}
          setSelectedFlat={setSelectedFlat}
          initiatives={initiatives}
          flats={flats} />
        <AnalyticsPortion
          loading={loading}
          filteredData={filteredData}
          allData={allData}
          typeOfView={selectedAnalytics}
          setTypeOfView={setSelectedAnalytics}
        />
      </div>
    </main>
  );

}

// ######################################################################################### //
//                                       Header                                              //       
// ######################################################################################### //

function AnalyticsPageHeader({
  selectedInitiative,
  selectedFlat
}: {
  selectedInitiative: string;
  selectedFlat: string;
}) {
  return (
    <Card className="shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2f7a5e]">
              Back to dashboard
            </Link>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">
              Analytics
            </div>
          </div>
          <UserButton />
        </CardTitle>
        <CardDescription>
          Initiative: <span className="font-medium text-foreground">{selectedInitiative === "*" ? "All" : selectedInitiative}</span>
          {" · "}
          Flat: <span className="font-medium text-foreground">{selectedFlat === "*" ? "All" : selectedFlat}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

// ######################################################################################### //
//                                       Filter Band                                         //       
// ######################################################################################### //

function AnalyticsPageFilterBand({
  selectedInitiative,
  setSelectedInitiative,
  selectedFlat,
  setSelectedFlat,
  initiatives,
  flats,
}: {
  selectedInitiative: string;
  setSelectedInitiative: (slug: string) => void;
  selectedFlat: string;
  setSelectedFlat: (slug: string) => void;
  initiatives: { slug: string; name: string }[];
  flats: string[];
}) {
  return (
    <Card className="shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
      <CardHeader className="border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
          Filter options
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <InitiativeFilter
              selectedInitiative={selectedInitiative}
              setSelectedInitiative={setSelectedInitiative}
              initiatives={initiatives}
            />
          </div>

          <div className="flex items-center gap-2">
            <FlatFilter
              selectedFlat={selectedFlat}
              setSelectedFlat={setSelectedFlat}
              flats={flats}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InitiativeFilter({
  selectedInitiative,
  setSelectedInitiative,
  initiatives,
}: {
  selectedInitiative: string;
  setSelectedInitiative: (slug: string) => void;
  initiatives: { slug: string; name: string }[];
}) {
  return (
    <div className = "flex items-center gap-3">
      <label className="block text-sm font-medium text-foreground pt-2.5">
        INITIATIVES:
      </label>
      <div className="mt-2">
        <Select value={selectedInitiative} onValueChange={setSelectedInitiative}>
          <SelectTrigger>
            <SelectValue placeholder="All initiatives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="*">All initiatives</SelectItem>
            {initiatives.map((init) => (
              <SelectItem key={init.slug} value={init.slug}>
                {init.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


function FlatFilter({
  selectedFlat,
  setSelectedFlat,
  flats,
}: {
  selectedFlat: string;
  setSelectedFlat: (slug: string) => void;
  flats: string[];
}) {
  return (
    <div className = "flex items-center gap-3">
      <label className="block text-sm font-medium text-foreground pt-2.5">
        FLATS:
      </label>
      <div className="mt-2">
        <Select value={selectedFlat} onValueChange={setSelectedFlat}>
          <SelectTrigger>
            <SelectValue placeholder="All flats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="*">All flats</SelectItem>
            {flats.map((flat) => (
              <SelectItem key={flat} value={flat}>
                {flat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

  );
}

// ######################################################################################### //
//                                   Analytics Portion                                       //       
// ######################################################################################### //

function AnalyticsPortion({
  loading,
  filteredData,
  allData,
  typeOfView,
  setTypeOfView
}: {
  loading: boolean;
  filteredData: FlatAnalyticsRow[];
  allData: FlatAnalyticsRow[];
  typeOfView: string;
  setTypeOfView: (view: string) => void;
}) {
  return (
    <Card className="shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
      <AnalyticsPortionHeader filteredData={filteredData} setTypeOfView={setTypeOfView} />
      <ViewRouter
        typeOfView={typeOfView}
        loading={loading}
        filteredData={filteredData}
        allData={allData}
        filteredDataLength={filteredData.length}
      />
    </Card>
  );
}

// ######################################################################################### //
//                                   Analytics Header                                        //       
// ######################################################################################### //

function AnalyticsPortionHeader({
  filteredData,
  setTypeOfView
}: {
  filteredData: FlatAnalyticsRow[];
  setTypeOfView: (view: string) => void;
}) {
  return (
    <CardHeader className="border-b">
      <CardTitle className="text-xs font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
        Payment analytics
      </CardTitle>
      <CardAction className="flex items-center gap-2">
        <TableViewButton setTypeOfView={setTypeOfView} />
        <GraphViewButton setTypeOfView={setTypeOfView} />
        <ExportCsvButton filteredData={filteredData} />
      </CardAction>
    </CardHeader>

  )
}

// ######################################################################################### //
//                                       Buttons                                             //       
// ######################################################################################### //

function TableViewButton({
  setTypeOfView
}: {
  setTypeOfView: (view: string) => void;
}) {
  return (
    <Button onClick={() => setTypeOfView('Table view')} variant="outline" size="icon" title="Show table" aria-label="Show table">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </Button>
  )
}

function GraphViewButton({
  setTypeOfView
}: {
  setTypeOfView: (view: string) => void;
}) {
  return (
    <Button onClick={() => setTypeOfView('Graph view')} variant="outline" size="icon" title="Show graph" aria-label="Show graph">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v4m6-10v10m6-6v6m6-14v14" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h4m4-4h4m4-4h4" />
      </svg>
    </Button>
  )
}

function ExportCsvButton({
  filteredData
}: {
  filteredData: FlatAnalyticsRow[];
}) {
  return (
    <Button
      onClick={() => {
        const transformedData = exportTransformFromDataArray(filteredData);
        generateAndDownloadCsv(transformedData);
      }}
      size="icon"
      className="bg-[#2f7a5e] text-white hover:bg-[#215b47]"
      title="Export CSV"
      aria-label="Export CSV"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </Button>
  )
}


// ######################################################################################### //
//                                    View Router.                                           //       
// ######################################################################################### //

function ViewRouter({
  typeOfView,
  loading,
  filteredData,
  allData,
  filteredDataLength
}: {
  typeOfView: string
  loading: boolean
  filteredData: FlatAnalyticsRow[];
  allData: FlatAnalyticsRow[];
  filteredDataLength: number
}) {

  if (loading) return <LoadingScreen />
  if (filteredDataLength === 0) return <NoDataAvailable />
  switch (typeOfView) {
    case "Table view": return <TableView filteredData={filteredData} allData={allData} />
    case "Graph view": return <GraphView filteredData={filteredData} />
    default: return <div>please refresh the page</div>
  }
}

function LoadingScreen() {
  return (
    <CardContent>
      <div className="text-center text-muted-foreground">Loading...</div>
    </CardContent>
  );
}

function NoDataAvailable() {
  return (
    <CardContent>
      <div className="text-center text-muted-foreground">No data available</div>
    </CardContent>
  );
}


// ######################################################################################### //
//                                   Table View                                              //       
// ######################################################################################### //


function TableView({
  filteredData,
  allData
}: {
  filteredData: FlatAnalyticsRow[];
  allData: FlatAnalyticsRow[];
}) {

  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flat</TableHead>
            <TableHead>Initiative</TableHead>
            <TableHead>Expected</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Payments</TableHead>
            <TableHead>Last Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((row, idx) => (
            <TableRow key={`${row.flatNumber}-${row.initiativeSlug}-${idx}`}>
              <TableCell className="font-medium">{row.flatNumber}</TableCell>
              <TableCell className="text-muted-foreground">{row.initiativeName}</TableCell>
              <TableCell className="text-muted-foreground">Rs {row.expected.toLocaleString('en-IN')}</TableCell>
              <TableCell className="font-semibold text-[#215b47]">Rs {row.paid.toLocaleString('en-IN')}</TableCell>
              <TableCell className={row.balance > 0 ? 'font-semibold text-[#b91c1c]' : 'font-semibold text-[#215b47]'}>
                Rs {row.balance.toLocaleString('en-IN')}
              </TableCell>
              <TableCell>{row.paymentCount}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.lastPaidAt ? new Date(row.lastPaidAt).toLocaleDateString('en-IN') : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filteredData.length} of {allData.length} records
      </div>
    </CardContent>
  )
}

// ######################################################################################### //
//                                   Graph View                                              //       
// ######################################################################################### //

function GraphView({
  filteredData
}: {
  filteredData: FlatAnalyticsRow[];
}) {
  const [visibleGraphs, setVisibleGraphs] = useState({
    overview: false,
    initiative: false,
    summary: false,
  });

  const chartData = filteredData.map(row => ({
    name: `${row.flatNumber} - ${row.initiativeName}`,
    initiative: row.initiativeName,
    expected: row.expected,
    paid: row.paid,
    balance: row.balance,
    paymentCount: row.paymentCount,
  }));

  const initiativeChartData = Object.values(
    filteredData.reduce<
      Record< string,
        {
          name: string;
          expected: number;
          paid: number;
        }
      >
    >((acc, row) => {
      const key = row.initiativeName;

      if (!acc[key]) {
        acc[key] = {
          name: key,
          expected: 0,
          paid: 0,
        };
      }

      acc[key].expected += Number(row.expected ?? 0);
      acc[key].paid += Number(row.paid ?? 0);

      return acc;
    }, {})
  );

  const totalPaid = chartData.reduce((sum, d) => sum + d.paid, 0);
  const totalExpected = chartData.reduce((sum, d) => sum + d.expected, 0);
  const totalBalance = chartData.reduce((sum, d) => sum + d.balance, 0);

  return (
    <CardContent>
      <div className="grid gap-6">
        <GraphOptionsSelect visibleGraphs={visibleGraphs} setVisibleGraphs={setVisibleGraphs} />
      {visibleGraphs.overview && (
      <div className="rounded-3xl border b   order-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e] mb-4">
          Flat-wise Collection Overview
        </h3>
        <div className="w-full" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7efe9" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f7fbf8', border: '1px solid #d7e6dc', borderRadius: '12px' }}
              />
              <Legend />
              <Bar dataKey="expected" fill="pink" name="Expected" />
              <Bar dataKey="paid" fill="#215b47" name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
      
       {visibleGraphs.initiative && (
      <div className="rounded-3xl border b   order-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e] mb-4">
          Initiative-wise Collection Overview
        </h3>
        <div className="w-full" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={initiativeChartData} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7efe9" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f7fbf8', border: '1px solid #d7e6dc', borderRadius: '12px' }}
              />
              <Legend />
              <Bar dataKey="expected" fill="pink" name="Expected" />
              <Bar dataKey="paid" fill="#215b47" name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {visibleGraphs.summary && (
      <div className="rounded-3xl border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e] mb-4">
          Overall Collection Summary
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-1 flex items-center justify-center" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: totalPaid },
                    { name: 'Left', value: totalBalance },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={
                    (props: { name?: string; value?: number }) =>
                    `${props.name ?? ''}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#2f7a5e" />
                  <Cell fill="pink" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#f7fbf8', border: '1px solid #d7e6dc', borderRadius: '12px' }}
                  formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                    const normalized = Array.isArray(value) ? value[0] : value;
                    const amount = typeof normalized === 'number' ? normalized : Number(normalized ?? 0);
                    return `Rs ${amount.toLocaleString('en-IN')}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-4">
            <div className="rounded-3xl border border-[#d7e6dc] bg-[linear-gradient(to_bottom_right,#edf7f2,white)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">Total Expected</p>
              <p className="mt-2 text-2xl font-semibold text-[#1f2937]">Rs {totalExpected.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-3xl border border-[#d7e6dc] bg-[linear-gradient(to_bottom_right,#edf7f2,white)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#215b47]">Total Collected</p>
              <p className="mt-2 text-2xl font-semibold text-[#215b47]">Rs {totalPaid.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-[#6b7280]">
                {totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : '0.0'}% collection rate
              </p>
            </div>
            <div className="rounded-3xl border border-[#d7e6dc] bg-[linear-gradient(to_bottom_right,#fee2e2,white)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b91c1c]">Outstanding Balance</p>
              <p className="mt-2 text-2xl font-semibold text-[#b91c1c]">Rs {totalBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
      )}
      </div>
    </CardContent>
  );
}

// ######################################################################################### //
//                                   Graph Options                                           //       
// ######################################################################################### //

type VisibleGraphs = Record<'overview' | 'initiative' | 'summary', boolean>;

const graphOptions = [
  { value: 'overview', label: 'Overview' },
  { value: 'initiative', label: 'By Initiative' },
  { value: 'summary', label: 'Summary' },
] as const;

function GraphOptionsSelect({
  visibleGraphs,
  setVisibleGraphs,
}: {
  visibleGraphs: VisibleGraphs;
  setVisibleGraphs: Dispatch<SetStateAction<VisibleGraphs>>;
}) {
  const selected = graphOptions.filter((opt) => visibleGraphs[opt.value]);
  const selectedCount = selected.length;

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-foreground">Graphs</div>
        <div className="text-xs text-muted-foreground">
          Choose which graphs to show on this page.
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Graph filter
            <Badge variant="secondary">{selectedCount}</Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Visible graphs</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {graphOptions.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={visibleGraphs[opt.value]}
              onCheckedChange={(checked) => {
                setVisibleGraphs((prev) => ({ ...prev, [opt.value]: Boolean(checked) }));
              }}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
