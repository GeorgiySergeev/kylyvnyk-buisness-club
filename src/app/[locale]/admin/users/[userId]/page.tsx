import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  LogIn,
  Mail,
  MessageSquare,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { db } from '@/db/client';
import { UserRoleForm } from '@/features/admin/components/user-role-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminUserDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    userId: string;
  }>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { locale, userId } = await params;

  const t = getT('admin');

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      displayName: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      supabaseUserId: true,
      createdAt: true,
      updatedAt: true,
    },
    where: (users, { eq, isNull, and }) => and(eq(users.id, userId), isNull(users.deletedAt)),
    with: {
      profile: true,
    },
  });

  if (!user) {
    redirect(localizeHref(locale, '/admin/users'));
  }

  const userBusinesses = await db.query.businesses.findMany({
    columns: { id: true, status: true },
    where: (businesses, { eq }) => eq(businesses.userId, userId),
  });

  const userIntroductions = await db.query.introductions.findMany({
    columns: { id: true, status: true },
    where: (introductions, { eq }) => eq(introductions.requesterId, userId),
  });

  const activeBusinesses = userBusinesses.filter((b) => b.status === 'PUBLISHED').length;
  const pendingBusinesses = userBusinesses.filter((b) => b.status === 'PENDING').length;
  const totalBusinesses = userBusinesses.length;

  const acceptedIntroductions = userIntroductions.filter((i) => i.status === 'APPROVED').length;
  const pendingIntroductions = userIntroductions.filter((i) => i.status === 'SUBMITTED').length;
  const totalIntroductions = userIntroductions.length;

  // get recent audit logs for this user
  const recentAuditLogs = await db.query.auditLogs.findMany({
    columns: {
      id: true,
      action: true,
      payload: true,
      ipAddress: true,
      createdAt: true,
    },
    where: (auditLogs, { eq }) => eq(auditLogs.actorUserId, userId),
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    limit: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5 text-muted-foreground hover:text-foreground" asChild>
          <Link href={localizeHref(locale, '/admin/users')}>
            <ArrowLeft className="size-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Mail className="size-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Ban className="size-4" />
            <span className="hidden sm:inline">Suspend</span>
          </Button>
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="destructive" size="sm" className="h-9 gap-2">
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <Card className="border-0 bg-card p-4 sm:p-6">
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="size-16 shrink-0 sm:size-20">
            <AvatarFallback className="bg-muted text-xl text-muted-foreground">
              {getInitials(user.displayName ?? user.phone)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {user.displayName ?? '—'}
                  </h1>
                  <Badge
                    variant={
                      user.role === 'ADMIN'
                        ? 'default'
                        : user.role === 'BUSINESS'
                          ? 'secondary'
                          : user.role === 'VIP'
                            ? 'default'
                            : 'outline'
                    }
                    className={
                      user.role === 'VIP'
                        ? 'border-[1px] border-amber-700 bg-amber-950 text-amber-400'
                        : user.role !== 'ADMIN' && user.role !== 'BUSINESS'
                          ? 'bg-muted text-muted-foreground'
                          : ''
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    className={
                      user.status === 'ACTIVE'
                        ? 'border-[1px] border-emerald-900 bg-emerald-950 text-emerald-400'
                        : user.status === 'BANNED'
                          ? 'border-[1px] border-red-900 bg-red-950 text-red-400'
                          : 'border-[1px] border-neutral-700 bg-neutral-800 text-neutral-400'
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  User ID &middot; {user.supabaseUserId?.slice(0, 16) ?? user.id.slice(0, 16)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4 sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-sm text-foreground">{user.email ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Phone</span>
                <span className="text-sm text-foreground">{user.phone}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Joined</span>
                <span className="text-sm text-foreground">
                  {user.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Last Updated</span>
                <span className="text-sm text-foreground">
                  {user.updatedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-card p-4">
          <CardHeader className="flex-row items-center justify-between gap-1 space-y-0 p-0">
            <span className="text-xs text-muted-foreground">Businesses Owned</span>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1 p-0 pt-2">
            <div className="text-2xl font-semibold text-foreground">{totalBusinesses}</div>
            <span className="text-xs text-muted-foreground">
              {activeBusinesses} active &middot; {pendingBusinesses} pending
            </span>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card p-4">
          <CardHeader className="flex-row items-center justify-between gap-1 space-y-0 p-0">
            <span className="text-xs text-muted-foreground">Introductions</span>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1 p-0 pt-2">
            <div className="text-2xl font-semibold text-foreground">{totalIntroductions}</div>
            <span className="text-xs text-muted-foreground">
              {acceptedIntroductions} accepted &middot; {pendingIntroductions} pending
            </span>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card p-4">
          <CardHeader className="flex-row items-center justify-between gap-1 space-y-0 p-0">
            <span className="text-xs text-muted-foreground">Account Status</span>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1 p-0 pt-2">
            <div className="text-2xl font-semibold text-foreground">
              {user.status === 'ACTIVE' ? 'Active' : user.status === 'BANNED' ? 'Banned' : 'Inactive'}
            </div>
            <span className="text-xs text-muted-foreground">
              Role: {user.role}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-0 bg-card p-6 lg:col-span-2">
          <CardHeader className="flex flex-col gap-1 p-0">
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <span className="text-xs text-muted-foreground">
              Latest actions performed by this user
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0 pt-4">
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <LogIn className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm text-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.ipAddress ?? 'N/A'} &middot;{' '}
                      {log.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserPlus className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm text-foreground">Account created</span>
                <span className="text-xs text-muted-foreground">
                  Signed up via phone &middot;{' '}
                  {user.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card p-6">
          <CardHeader className="flex flex-col gap-1 p-0">
            <h3 className="text-base font-semibold text-foreground">Account Details</h3>
            <span className="text-xs text-muted-foreground">
              Permissions and status
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Role</span>
              <Badge
                variant={
                  user.role === 'ADMIN'
                    ? 'default'
                    : user.role === 'BUSINESS'
                      ? 'secondary'
                      : user.role === 'VIP'
                        ? 'default'
                        : 'outline'
                }
                className={
                  user.role === 'VIP'
                    ? 'border-[1px] border-amber-700 bg-amber-950 text-amber-400'
                    : user.role !== 'ADMIN' && user.role !== 'BUSINESS'
                      ? 'bg-muted text-muted-foreground'
                      : ''
                }
              >
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge
                className={
                  user.status === 'ACTIVE'
                    ? 'border-[1px] border-emerald-900 bg-emerald-950 text-emerald-400'
                    : user.status === 'BANNED'
                      ? 'border-[1px] border-red-900 bg-red-950 text-red-400'
                      : 'border-[1px] border-neutral-700 bg-neutral-800 text-neutral-400'
                }
              >
                {user.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-xs text-foreground">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Email Verified</span>
              <span className="flex items-center gap-1 text-xs text-foreground">
                <CheckCircle2 className="size-3 text-emerald-500" />
                {user.email ? 'Verified' : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Last Active</span>
              <span className="text-xs text-foreground">
                {user.updatedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full gap-2 border-0 bg-muted text-foreground"
            >
              <KeyRound className="size-4" />
              Reset Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card p-6">
        <CardHeader className="flex flex-col gap-1.5 p-0">
          <h3 className="text-base font-semibold text-foreground">{t('changeRole')}</h3>
          <span className="text-xs text-muted-foreground">Manage user role and status</span>
        </CardHeader>
        <CardContent className="p-0 pt-5">
          <UserRoleForm userId={userId} currentRole={user.role} currentStatus={user.status} />
        </CardContent>
      </Card>
    </div>
  );
}
