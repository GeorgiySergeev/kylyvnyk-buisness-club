'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AdminFiltersBar, AdminSearchInput } from './admin-ui';

interface UsersFiltersProps {
  basePath: string;
  labels: {
    allRoles: string;
    allStatuses: string;
    role: string;
    search: string;
    searchPlaceholder: string;
    status: string;
  };
  roleFilter: string;
  searchTerm: string;
  statusFilter: string;
}

export function UsersFilters({
  basePath,
  labels,
  roleFilter,
  searchTerm,
  statusFilter,
}: UsersFiltersProps) {
  const router = useRouter();
  const [role, setRole] = useState(roleFilter || 'ALL');
  const [status, setStatus] = useState(statusFilter || 'ALL');

  function applySelectFilter(nextRole = role, nextStatus = status) {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (nextRole !== 'ALL') params.set('role', nextRole);
    if (nextStatus !== 'ALL') params.set('status', nextStatus);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <AdminFiltersBar>
      <form className="flex w-full gap-2 sm:max-w-md" method="GET">
        <AdminSearchInput placeholder={labels.searchPlaceholder} value={searchTerm} />
        {roleFilter ? <input name="role" type="hidden" value={roleFilter} /> : null}
        {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
        <Button className="h-9 rounded-md" size="sm" type="submit">
          {labels.search}
        </Button>
      </form>

      <Select
        value={role}
        onValueChange={(value) => {
          setRole(value);
          applySelectFilter(value, status);
        }}
      >
        <SelectTrigger className="h-9 w-36 rounded-md border-border/80 bg-background/80">
          <SelectValue placeholder={labels.role} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{labels.allRoles}</SelectItem>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="VIP">VIP</SelectItem>
          <SelectItem value="BUSINESS">Business</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          applySelectFilter(role, value);
        }}
      >
        <SelectTrigger className="h-9 w-36 rounded-md border-border/80 bg-background/80">
          <SelectValue placeholder={labels.status} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{labels.allStatuses}</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="BANNED">Banned</SelectItem>
        </SelectContent>
      </Select>
    </AdminFiltersBar>
  );
}
