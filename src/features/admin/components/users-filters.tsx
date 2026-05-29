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
    allPlans: string;
    allStatuses: string;
    membership: string;
    search: string;
    searchPlaceholder: string;
    status: string;
  };
  planFilter: string;
  searchTerm: string;
  statusFilter: string;
}

export function UsersFilters({
  basePath,
  labels,
  planFilter,
  searchTerm,
  statusFilter,
}: UsersFiltersProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(planFilter || 'ALL');
  const [status, setStatus] = useState(statusFilter || 'ALL');

  function applySelectFilter(nextPlan = plan, nextStatus = status) {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (nextPlan !== 'ALL') params.set('plan', nextPlan);
    if (nextStatus !== 'ALL') params.set('status', nextStatus);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <AdminFiltersBar>
      <form className="flex w-full gap-2 sm:max-w-md" method="GET">
        <AdminSearchInput placeholder={labels.searchPlaceholder} value={searchTerm} />
        {planFilter ? <input name="plan" type="hidden" value={planFilter} /> : null}
        {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
        <Button className="h-9 rounded-md" size="sm" type="submit">
          {labels.search}
        </Button>
      </form>

      <Select
        value={plan}
        onValueChange={(value) => {
          setPlan(value);
          applySelectFilter(value, status);
        }}
      >
        <SelectTrigger className="h-9 w-36 rounded-md border-border/80 bg-background/80">
          <SelectValue placeholder={labels.membership} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{labels.allPlans}</SelectItem>
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
          applySelectFilter(plan, value);
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
