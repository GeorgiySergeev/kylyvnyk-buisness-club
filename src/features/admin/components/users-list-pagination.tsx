'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '@/features/admin/lib/users-list-pagination';
import { cn } from '@/lib/utils';

export interface UsersListPaginationProps {
  basePath: string;
  endRow: number;
  filteredCount: number;
  labels: {
    paginationNext: string;
    paginationPrev: string;
    rowsPerPage: string;
    showingRows: string;
  };
  page: number;
  pageSize: number;
  planFilter: string;
  searchTerm: string;
  startRow: number;
  statusFilter: string;
  totalPages: number;
}

function buildUsersHref(
  basePath: string,
  opts: {
    page?: number;
    pageSize?: number;
    plan?: string;
    q?: string;
    status?: string;
  },
): string {
  const params = new URLSearchParams();
  if (opts.q) params.set('q', opts.q);
  if (opts.plan) params.set('plan', opts.plan);
  if (opts.status) params.set('status', opts.status);
  if (opts.pageSize && opts.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(opts.pageSize));
  }
  if (opts.page && opts.page > 1) params.set('page', String(opts.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getVisiblePages(current: number, total: number, maxVisible = 5): number[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function UsersListPagination({
  basePath,
  endRow,
  filteredCount,
  labels,
  page,
  pageSize,
  planFilter,
  searchTerm,
  startRow,
  statusFilter,
  totalPages,
}: UsersListPaginationProps) {
  const router = useRouter();
  const filterParams = {
    plan: planFilter,
    q: searchTerm,
    status: statusFilter,
    pageSize,
  };

  const showingText = labels.showingRows
    .replace('{start}', String(startRow))
    .replace('{end}', String(endRow))
    .replace('{count}', filteredCount.toLocaleString());

  const visiblePages = getVisiblePages(page, totalPages);

  function handlePageSizeChange(value: string) {
    router.push(
      buildUsersHref(basePath, {
        ...filterParams,
        page: 1,
        pageSize: Number(value),
      }),
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{showingText}</p>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:hidden">
          <Button asChild disabled={page <= 1} size="sm" variant="outline" className="h-8">
            <Link
              href={buildUsersHref(basePath, { ...filterParams, page: page - 1 })}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              {labels.paginationPrev}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button asChild disabled={page >= totalPages} size="sm" variant="outline" className="h-8">
            <Link
              href={buildUsersHref(basePath, { ...filterParams, page: page + 1 })}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
            >
              {labels.paginationNext}
            </Link>
          </Button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="sr-only">{labels.rowsPerPage}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-16 border-0 bg-card text-foreground">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label={labels.rowsPerPage} className="hidden items-center gap-1 sm:flex">
          <Button
            asChild
            disabled={page <= 1}
            size="icon"
            variant="outline"
            className="size-8 border-0 bg-card text-foreground"
          >
            <Link
              href={buildUsersHref(basePath, { ...filterParams, page: 1 })}
              aria-label="First page"
            >
              <ChevronsLeft aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            disabled={page <= 1}
            size="icon"
            variant="outline"
            className="size-8 border-0 bg-card text-foreground"
          >
            <Link
              href={buildUsersHref(basePath, { ...filterParams, page: page - 1 })}
              aria-label={labels.paginationPrev}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              asChild
              size="icon"
              variant={pageNumber === page ? 'default' : 'outline'}
              className={cn(
                'size-8',
                pageNumber === page
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'border-0 bg-card text-foreground',
              )}
            >
              <Link
                href={buildUsersHref(basePath, { ...filterParams, page: pageNumber })}
                aria-current={pageNumber === page ? 'page' : undefined}
              >
                {pageNumber}
              </Link>
            </Button>
          ))}
          <Button
            asChild
            disabled={page >= totalPages}
            size="icon"
            variant="outline"
            className="size-8 border-0 bg-card text-foreground"
          >
            <Link
              href={buildUsersHref(basePath, { ...filterParams, page: page + 1 })}
              aria-label={labels.paginationNext}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            disabled={page >= totalPages}
            size="icon"
            variant="outline"
            className="size-8 border-0 bg-card text-foreground"
          >
            <Link href={buildUsersHref(basePath, { ...filterParams, page: totalPages })} aria-label="Last page">
              <ChevronsRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
}
