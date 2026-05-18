import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/authService';
import departmentsData from '@/data/departments.json';
import type { User } from '@/types';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { authService.getAllUsers().then(setUsers); }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getDept = (id: string) => departmentsData.find((d) => d.id === id)?.name ?? '';

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage employees, managers, and hierarchy" />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Name', 'Email', 'Role', 'Department', 'Title', 'ID'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{u.role}</Badge></td>
                    <td className="px-4 py-3">{getDept(u.departmentId)}</td>
                    <td className="px-4 py-3">{u.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.employeeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
