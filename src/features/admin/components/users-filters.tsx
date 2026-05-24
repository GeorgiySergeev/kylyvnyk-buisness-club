'use client';

import { CircleDot, Search, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UsersFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  basePath: string;
}

export function UsersFilters({ searchTerm, roleFilter, statusFilter, basePath }: UsersFiltersProps) {
  const router = useRouter();

  const buildHref = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      const q = overrides.q ?? searchTerm;
      const role = overrides.role ?? roleFilter;
      const status = overrides.status ?? statusFilter;
      if (q) sp.set('q', q);
      if (role && role !== 'all') sp.set('role', role);
      else sp.delete('role');
      if (status && status !== 'all') sp.set('status', status);
      else sp.delete('status');
      const qs = sp.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [basePath, searchTerm, roleFilter, statusFilter],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchTerm}
          placeholder="Filter users by name or email..."
          className="h-9 border-0 bg-card pl-9 text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              router.push(buildHref({ q: (e.currentTarget as HTMLInputElement).value }));
            }
          }}
        />
      </div>

      <Select
        value={roleFilter || 'all'}
        onValueChange={(value) => router.push(buildHref({ role: value === 'all' ? undefined : value }))}
      >
        <SelectTrigger className="h-9 w-32 border-0 bg-card text-foreground">
          <UserCog className="mr-1 size-4 text-muted-foreground" />
          <SelectValue placeholder="Role: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Role: All</SelectItem>
          <SelectItem value="FREE">FREE</SelectItem>
          <SelectItem value="VIP">VIP</SelectItem>
          <SelectItem value="BUSINESS">BUSINESS</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={statusFilter || 'all'}
        onValueChange={(value) => router.push(buildHref({ status: value === 'all' ? undefined : value }))}
      >
        <SelectTrigger className="h-9 w-33 border-0 bg-card text-foreground">
          <CircleDot className="mr-1 size-4 text-muted-foreground" />
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: All</SelectItem>
          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
          <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          <SelectItem value="BANNED">BANNED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
