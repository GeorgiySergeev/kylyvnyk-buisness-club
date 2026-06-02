import 'server-only';

import { and, asc, desc, eq, inArray, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import {
  auditLogs,
  businesses,
  cities,
  clubCards,
  countries,
  introductions,
  memberships,
  stripeSubscriptions,
  users,
} from '@/db/schema';
import type { Resource } from '@/db/schema/permission';
import { UserAccountTabs } from '@/features/admin/components/user-account-tabs';
import { getCurrentUser } from '@/features/auth/lib/current-user';
import { resolveEffectiveMembership } from '@/features/billing/lib/membership-resolver';
import { getInitials } from '@/features/profile/components/dashboard-profile-shared';
import { getUserEffectivePermissions, isSuperAdmin } from '@/lib/auth/permissions';
import { getT } from '@/lib/i18n/t-server';

interface AdminUserDetailContentProps {
  locale: SupportedLocale;
  userId: string;
}

export async function AdminUserDetailContent({ locale, userId }: AdminUserDetailContentProps) {
  const t = getT('admin', locale);

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
    updatedAt: Date;
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
    updatedAt: Date;
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
        and(eq(auditLogs.entityId, userId), inArray(auditLogs.entityType, ['user', 'profile'])),
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
            updatedAt: true,
          },
          orderBy: [desc(clubCards.createdAt)],
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
            updatedAt: true,
          },
          orderBy: [desc(memberships.createdAt)],
          where: eq(memberships.userId, userId),
        }),
      [],
    ),
  ]);

  const viewer = await getCurrentUser();
  const viewerIsSuperAdmin = viewer ? await isSuperAdmin(viewer.id) : false;

  const [userAssignedRoles, allActiveRoles, permissionAccess] = viewerIsSuperAdmin
    ? await Promise.all([
        db.query.userRoles.findMany({
          where: (table, { eq: _eq }) => _eq(table.userId, userId),
          with: { role: { with: { permissions: true } } },
        }),
        db.query.roles.findMany({
          where: (table, { isNull: _isNull }) => _isNull(table.deletedAt),
          with: { permissions: true },
        }),
        getUserEffectivePermissions(userId),
      ])
    : [[], [], null];

  const currentRoleData = userAssignedRoles.map((ur) => ({
    id: ur.id,
    description: ur.role.description,
    roleId: ur.roleId,
    roleName: ur.role.name,
    roleSlug: ur.role.slug,
    isSystem: ur.role.isSystem,
    permissions: ur.role.permissions.map((permission) => ({
      canCreate: permission.canCreate,
      canDelete: permission.canDelete,
      canEdit: permission.canEdit,
      canView: permission.canView,
      resource: permission.resource as Resource,
    })),
  }));

  const activeBusinesses = userBusinesses.filter((b) => b.status === 'PUBLISHED').length;
  const approvedIntros = userIntroductions.filter((i) => i.status === 'APPROVED').length;
  const joinedDate = user.createdAt.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const activeCard = userCards.find((card) => card.status === 'ACTIVE') ?? null;
  const primaryMembership = resolveEffectiveMembership(userMemberships);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const roleAssignmentData = permissionAccess
    ? {
        currentRoles: currentRoleData,
        availableRoles: allActiveRoles.map((r) => ({
          id: r.id,
          description: r.description,
          name: r.name,
          slug: r.slug,
          isSystem: r.isSystem,
          permissions: r.permissions.map((permission) => ({
            canCreate: permission.canCreate,
            canDelete: permission.canDelete,
            canEdit: permission.canEdit,
            canView: permission.canView,
            resource: permission.resource as Resource,
          })),
        })),
        currentOverrides: permissionAccess.overrides,
        effectivePermissions: permissionAccess.effectivePermissions,
        basePermissions: permissionAccess.basePermissions,
      }
    : undefined;

  return (
    <UserAccountTabs
      backHref={localizeHref(locale, '/admin/users')}
      backLabel={t('backToUsers')}
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
      cardHistory={userCards.map((card) => ({
        createdAt: fmt(card.createdAt),
        expiresAt: card.expiresAt ? fmt(card.expiresAt) : null,
        id: card.id,
        memberType: card.memberType,
        number: card.number,
        status: card.status,
        updatedAt: fmt(card.updatedAt),
      }))}
      cities={allCities.map((c) => ({ id: c.id, name: c.name }))}
      countries={allCountries.map((c) => ({ id: c.id, name: c.name }))}
      fallbackInitials={getInitials(user.displayName ?? user.phone)}
      headerStats={{
        approvedIntroductions: approvedIntros,
        cardNumber: activeCard?.number,
        publishedBusinesses: activeBusinesses,
      }}
      introductions={userIntroductions.map((intro) => ({
        businessName: intro.targetBusiness?.name ?? 'N/A',
        clientContact: intro.clientContact,
        clientName: intro.clientName,
        createdAt: fmt(intro.createdAt),
        id: intro.id,
        message: intro.message,
        status: intro.status,
      }))}
      joinedDate={joinedDate}
      membershipLabel={primaryMembership?.planCode ?? t('noMembership')}
      effectiveMembershipTier={primaryMembership?.planCode ?? null}
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
      roleAssignmentData={roleAssignmentData}
    />
  );
}
