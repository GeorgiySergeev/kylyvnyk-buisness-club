'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  type DashboardProfileData,
  type DashboardProfileLabels,
  getInitials,
  ProfileField,
} from './dashboard-profile-shared';

export interface DashboardProfileViewProps extends DashboardProfileData {
  labels: DashboardProfileLabels;
}

export function DashboardProfileView({
  bio,
  cityName,
  countryName,
  displayName,
  email,
  labels,
  phone,
  userId,
}: DashboardProfileViewProps) {
  const resolvedDisplayName = displayName ?? labels.notSet;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <ProfileField label={labels.displayName} value={resolvedDisplayName} />
        <ProfileField label={labels.email} value={email ?? labels.notSet} />
        <ProfileField label={labels.phone} mono value={phone} />
        <ProfileField label={labels.userId} mono value={userId} />
        <ProfileField label={labels.country} value={countryName ?? labels.notSet} />
        <ProfileField label={labels.city} value={cityName ?? labels.notSet} />
      </div>

      {bio ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">{labels.bio}</p>
          <p className="rounded-md border border-border/50 bg-white/2 px-3 py-2.5 text-sm leading-6 text-fg/65">
            {bio}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardProfileAvatar({
  avatarUrl,
  displayName,
  labels,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  labels: Pick<DashboardProfileLabels, 'notSet' | 'profilePicture'>;
}) {
  const resolvedDisplayName = displayName ?? labels.notSet;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar className="size-24 border border-border/50 bg-white/2">
        <AvatarImage src={avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-xl text-fg/60">{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{labels.profilePicture}</p>
        <p className="text-sm text-fg/50">{resolvedDisplayName}</p>
      </div>
    </div>
  );
}
