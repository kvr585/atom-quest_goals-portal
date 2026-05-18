import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { reportService } from '@/services/reportService';
import { exportToCSV } from '@/utils/format';
import departmentsData from '@/data/departments.json';
import usersData from '@/data/users.json';

const ALL = '__all__';

export function ReportsPage() {
  const [filters, setFilters] = useState({
    department: ALL,
    quarter: ALL,
    employee: ALL,
    manager: ALL,
    status: ALL,
  });
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const employees = usersData.filter((u) => u.role === 'employee');
  const managers = usersData.filter((u) => u.role === 'manager');

  const toFilter = (v: string) => (v === ALL ? undefined : v);

  const runReport = async () => {
    setLoading(true);
    try {
      const result = await reportService.getFilteredGoals({
        department: toFilter(filters.department),
        employee: toFilter(filters.employee),
        manager: toFilter(filters.manager),
        status: toFilter(filters.status),
      });
      setData(result);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data.length) {
      toast.error('Run report first');
      return;
    }
    exportToCSV(data, `atomquest-report-${Date.now()}`);
    toast.success('CSV downloaded');
  };

  const handleExportExcel = () => {
    if (!data.length) {
      toast.error('Run report first');
      return;
    }
    exportToCSV(data, `atomquest-report-excel-${Date.now()}`);
    toast.success('Excel-compatible CSV downloaded');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export performance reports" />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(v) => setFilters({ ...filters, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All departments</SelectItem>
                  {departmentsData.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quarter</Label>
              <Select
                value={filters.quarter}
                onValueChange={(v) => setFilters({ ...filters, quarter: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All quarters</SelectItem>
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={filters.employee}
                onValueChange={(v) => setFilters({ ...filters, employee: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All employees</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Manager</Label>
              <Select
                value={filters.manager}
                onValueChange={(v) => setFilters({ ...filters, manager: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All managers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All managers</SelectItem>
                  {managers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  {['draft', 'submitted', 'approved', 'rejected', 'on_track', 'completed', 'delayed'].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={runReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({data.length} rows)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {Object.keys(data[0]).map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2">
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
