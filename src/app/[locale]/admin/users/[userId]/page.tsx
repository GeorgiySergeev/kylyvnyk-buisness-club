import { and, asc, desc, eq, inArray, or } from 'drizzle-orm';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CreditCard,
  Handshake,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/db/client';
import { auditLogs, businesses, cities, clubCards, countries, introductions, memberships, stripeSubscriptions, users } from '@/db/schema';
import { AdminStatusBadge, getAdminStatusTone } from '@/features/admin/components/admin-ui';
import { UserAccountTabs } from '@/features/admin/components/user-account-tabs';

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

  const user = await db.query.users.findFirst({
    columns: {
      createdAt: true,
      deletedAt: true,
      displayName: true,
      email: true,
      id: true,
      phone: true,
      role: true,
      status: true,
      supabaseUserId: true,
      updatedAt: true,
    },
    where: eq(users.id, userId),
    with: { profile: true },
  });

  if (!user) redirect(localizeHref(locale, '/admin/users'));

  type SubscriptionRow = {
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    currentPeriodEnd: Date | null;
    id: string;
    status: string;
    stripeSubscriptionId: string;
  };
  type MembershipRow = {
    createdAt: Date;
    endsAt: Date | null;
    id: string;
    planCode: string;
    startsAt: Date;
    status: string;
  };
  type UserBusinessRow = {
    id: string;
    status: string;
  };
  type UserIntroductionRow = {
    adminNote: string | null;
    clientContact: string;
    clientName: string;
    createdAt: Date;
    id: string;
    message: string | null;
    status: string;
    targetBusiness: { id: string; name: string } | null;
    targetBusinessId: string;
  };
  type AuditLogRow = {
    action: string;
    createdAt: Date;
    id: string;
    ipAddress: string | null;
  };
  type NamedRow = {
    id: number;
    name: string;
  };
  type UserCardRow = {
    createdAt: Date;
    expiresAt: Date | null;
    id: string;
    memberType: string;
    number: string;
    status: string;
  };

  async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  }

  const [
    userBusinesses,
    userIntroductions,
    recentAuditLogs,
    allCountries,
    allCities,
    userCards,
    userSubscriptions,
    userMemberships,
  ]: [
    UserBusinessRow[],
    UserIntroductionRow[],
    AuditLogRow[],
    NamedRow[],
    NamedRow[],
    UserCardRow[],
    SubscriptionRow[],
    MembershipRow[],
  ] = await Promise.all([
    db.query.businesses.findMany({
      columns: { id: true, status: true },
      where: eq(businesses.userId, userId),
    }),
    db.query.introductions.findMany({
      columns: {
        adminNote: true,
        clientContact: true,
        clientName: true,
        createdAt: true,
        id: true,
        message: true,
        status: true,
        targetBusinessId: true,
      },
      orderBy: [desc(introductions.createdAt)],
      where: eq(introductions.requesterId, userId),
      with: {
        targetBusiness: {
          columns: { id: true, name: true },
        },
      },
    }),
    db.query.auditLogs.findMany({
      columns: { action: true, createdAt: true, id: true, ipAddress: true },
      limit: 100,
      orderBy: [desc(auditLogs.createdAt)],
      where: or(
        eq(auditLogs.actorUserId, userId),
        and(
          eq(auditLogs.entityId, userId),
          inArray(auditLogs.entityType, ['user', 'profile']),
        ),
      ),
    }),
    db.query.countries.findMany({
      columns: { id: true, name: true },
      orderBy: [asc(countries.name)],
    }),
    db.query.cities.findMany({
      columns: { id: true, name: true },
      orderBy: [asc(cities.name)],
    }),
    safeQuery(
      () =>
        db.query.clubCards.findMany({
          columns: {
            createdAt: true,
            expiresAt: true,
            id: true,
            memberType: true,
            number: true,
            status: true,
          },
          where: eq(clubCards.userId, userId),
        }),
      [],
    ),
    safeQuery<SubscriptionRow[]>(
      () =>
        db.query.stripeSubscriptions.findMany({
          columns: {
            cancelAtPeriodEnd: true,
            createdAt: true,
            currentPeriodEnd: true,
            id: true,
            status: true,
            stripeSubscriptionId: true,
          },
          orderBy: [desc(stripeSubscriptions.createdAt)],
          where: eq(stripeSubscriptions.userId, userId),
        }),
      [],
    ),
    safeQuery<MembershipRow[]>(
      () =>
        db.query.memberships.findMany({
          columns: {
            createdAt: true,
            endsAt: true,
            id: true,
            planCode: true,
            startsAt: true,
            status: true,
          },
          orderBy: [desc(memberships.createdAt)],
          where: eq(memberships.userId, userId),
        }),
      [],
    ),
  ]);

  const activeBusinesses = userBusinesses.filter((b) => b.status === 'PUBLISHED').length;
  const approvedIntros = userIntroductions.filter((i) => i.status === 'APPROVED').length;
  const joinedDate = user.createdAt.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const activeCard = userCards[0] ?? null;
  const primaryMembership =
    userMemberships.find((m) => m.status === 'ACTIVE') ?? userMemberships[0] ?? null;

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        href={localizeHref(locale, '/admin/users')}
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      {/* Hero Profile Card */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card/95">
        <div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-transparent sm:h-32" />

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="size-20 border-4 border-card shadow-lg sm:size-24">
                {user.profile?.avatarUrl ? (
                  <AvatarImage
                    alt={user.displayName ?? 'User avatar'}
                    src={user.profile.avatarUrl}
                  />
                ) : null}
                <AvatarFallback className="bg-muted text-lg text-muted-foreground sm:text-xl">
                  {getInitials(user.displayName ?? user.phone)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 pb-1">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {user.displayName ?? 'No display name'}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5">
                  <AdminStatusBadge>{user.role}</AdminStatusBadge>
                  {primaryMembership ? (
                    <AdminStatusBadge tone={getAdminStatusTone(primaryMembership.planCode)}>
                      {primaryMembership.planCode}
                    </AdminStatusBadge>
                  ) : (
                    <AdminStatusBadge tone="muted">NO MEMBERSHIP</AdminStatusBadge>
                  )}
                  <AdminStatusBadge>{user.status}</AdminStatusBadge>
                  {user.deletedAt ? (
                    <AdminStatusBadge tone="danger">DELETED</AdminStatusBadge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase aria-hidden="true" className="size-4" />
                <span className="font-medium text-foreground">{activeBusinesses}</span>
                <span className="hidden sm:inline">businesses</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Handshake aria-hidden="true" className="size-4" />
                <span className="font-medium text-foreground">{approvedIntros}</span>
                <span className="hidden sm:inline">introductions</span>
              </div>
              {activeCard ? (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CreditCard aria-hidden="true" className="size-4" />
                  <span className="font-medium text-foreground">#{activeCard.number}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Phone aria-hidden="true" className="size-3.5" />
              {user.phone}
            </span>
            {user.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail aria-hidden="true" className="size-3.5" />
                {user.email}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              Joined {joinedDate}
            </span>
          </div>
        </div>
      </div>

      <UserAccountTabs
        card={
          activeCard
            ? {
                createdAt: fmt(activeCard.createdAt),
                expiresAt: activeCard.expiresAt ? fmt(activeCard.expiresAt) : null,
                id: activeCard.id,
                memberType: activeCard.memberType,
                number: activeCard.number,
                status: activeCard.status,
              }
            : null
        }
        cities={allCities.map((c) => ({ id: c.id, name: c.name }))}
        countries={allCountries.map((c) => ({ id: c.id, name: c.name }))}
        introductions={userIntroductions.map((intro) => ({
          businessName: intro.targetBusiness?.name ?? 'N/A',
          clientContact: intro.clientContact,
          clientName: intro.clientName,
          createdAt: fmt(intro.createdAt),
          id: intro.id,
          message: intro.message,
          status: intro.status,
        }))}
        memberships={userMemberships.map((m) => ({
          createdAt: fmt(m.createdAt),
          endsAt: m.endsAt ? fmt(m.endsAt) : null,
          id: m.id,
          planCode: m.planCode,
          startsAt: fmt(m.startsAt),
          status: m.status,
        }))}
        profile={
          user.profile
            ? {
                avatarUrl: user.profile.avatarUrl,
                bio: user.profile.bio,
                cityId: user.profile.cityId,
                countryId: user.profile.countryId,
              }
            : null
        }
        recentAuditLogs={recentAuditLogs.map((log) => ({
          action: log.action,
          createdAt: log.createdAt.toLocaleString(),
          id: log.id,
          ipAddress: log.ipAddress,
        }))}
        subscriptions={userSubscriptions.map((sub) => ({
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          createdAt: fmt(sub.createdAt),
          currentPeriodEnd: sub.currentPeriodEnd ? fmt(sub.currentPeriodEnd) : null,
          id: sub.id,
          status: sub.status,
          stripeSubscriptionId: sub.stripeSubscriptionId,
        }))}
        user={{
          deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
          displayName: user.displayName,
          email: user.email,
          id: user.id,
          phone: user.phone,
          role: user.role,
          status: user.status,
        }}
      />
    </div>
  );
}
