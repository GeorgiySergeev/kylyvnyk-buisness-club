import { cn } from '@/lib/utils';

export interface SelectOption {
  id: number;
  label: string;
}

export interface DashboardProfileLabels {
  avatarHint: string;
  bio: string;
  bioHint: string;
  cancelEdit: string;
  city: string;
  country: string;
  displayName: string;
  displayNameHint: string;
  editProfile: string;
  email: string;
  emailHint: string;
  notSet: string;
  optional: string;
  phone: string;
  phoneReadOnly: string;
  profileAvatarDevBypassError: string;
  profileAvatarDevBypassHint: string;
  profileAvatarError: string;
  profileDescription: string;
  profileEmailInUse: string;
  profileFormError: string;
  profilePicture: string;
  profileTitle: string;
  saveProfile: string;
  uploadAvatar: string;
  userId: string;
  userIdCopied: string;
  userIdCopy: string;
  userIdHint: string;
}

export interface DashboardProfileData {
  avatarUrl: string | null;
  bio: string | null;
  cityId: number | null;
  cityName: string | null;
  countryId: number | null;
  countryName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string;
  userId: string;
}

export const fieldSelectClass =
  'min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 py-2 text-sm text-white transition-colors outline-none focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50';

export function getInitials(value?: string | null) {
  if (!value) return 'KC';
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'KC';
}

export function ProfileField({
  label,
  value,
  mono,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">{label}</p>
      <p
        className={cn(
          'rounded-md border border-border/50 bg-white/2 px-3 py-2.5 text-sm text-fg/65',
          mono && 'font-mono text-xs',
        )}
      >
        {value}
      </p>
    </div>
  );
}
