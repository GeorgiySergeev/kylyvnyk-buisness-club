'use client';

import { Camera, Loader2, Pencil, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { updateMemberProfileAction } from '../actions/update-member-profile.action';

interface SelectOption {
  id: number;
  label: string;
}

export interface DashboardProfileCardLabels {
  avatarHint: string;
  bio: string;
  bioHint: string;
  cancelEdit: string;
  city: string;
  country: string;
  displayName: string;
  editProfile: string;
  email: string;
  notSet: string;
  optional: string;
  phone: string;
  phoneReadOnly: string;
  profileAvatarError: string;
  profileDescription: string;
  profileEmailInUse: string;
  profileFormError: string;
  profilePicture: string;
  profileTitle: string;
  saveProfile: string;
  uploadAvatar: string;
}

export interface DashboardProfileCardProps {
  avatarUrl: string | null;
  bio: string | null;
  cityId: number | null;
  cityName: string | null;
  countryId: number | null;
  countryName: string | null;
  displayName: string | null;
  email: string | null;
  cities: SelectOption[];
  countries: SelectOption[];
  labels: DashboardProfileCardLabels;
  locale: SupportedLocale;
  phone: string;
}

const fieldSelectClass =
  'min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 py-2 text-sm text-white transition-colors outline-none focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50';

function getInitials(value?: string | null) {
  if (!value) return 'KC';
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'KC';
}

function ProfileField({
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

export function DashboardProfileCard({
  avatarUrl,
  bio,
  cityId,
  cityName,
  countryId,
  countryName,
  displayName,
  email,
  cities,
  countries,
  labels,
  locale,
  phone,
}: DashboardProfileCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();

  const resolvedAvatarSrc = previewUrl ?? avatarUrl ?? undefined;
  const resolvedDisplayName = displayName ?? labels.notSet;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function openEditMode() {
    // Defer until after the pointer event finishes so the new Save button
    // cannot receive the same click that opened edit mode.
    requestAnimationFrame(() => {
      setIsEditing(true);
    });
  }

  function submitProfileForm() {
    formRef.current?.requestSubmit();
  }

  function handleCancel() {
    clearPreview();
    setErrorMessage(null);
    setIsEditing(false);
  }

  function applyAvatarFile(file: File | undefined) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    if (fileInputRef.current && file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    applyAvatarFile(event.target.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!pending) {
      setIsDragging(true);
    }
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (pending) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      applyAvatarFile(file);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateMemberProfileAction(locale, formData);

      if (!result.ok) {
        if (result.error.code === 'EMAIL_IN_USE') {
          setErrorMessage(labels.profileEmailInUse);
          return;
        }
        if (result.error.code === 'AVATAR_ERROR') {
          setErrorMessage(result.error.message || labels.profileAvatarError);
          return;
        }
        setErrorMessage(result.error.message || labels.profileFormError);
        return;
      }

      clearPreview();
      setIsEditing(false);
      router.refresh();
    });
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex flex-col gap-4 border-b border-border/50 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-8">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white sm:text-lg">{labels.profileTitle}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-fg/50">{labels.profileDescription}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-md border-border/50 bg-transparent text-white hover:bg-white/5 hover:text-white"
              onClick={openEditMode}
              aria-label={labels.editProfile}
            >
              <Pencil aria-hidden="true" className="mr-2 size-4" />
              {labels.editProfile}
            </Button>
          ) : (
            <>
              <Button
                className="min-h-11 rounded-md border border-border/50 bg-black text-white hover:bg-white/5"
                disabled={pending}
                type="button"
                onClick={submitProfileForm}
              >
                {pending ? (
                  <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save aria-hidden="true" className="mr-2 size-4" />
                )}
                {labels.saveProfile}
              </Button>
              <Button
                className="min-h-11 rounded-md border-border/50 bg-transparent text-white hover:bg-white/5"
                disabled={pending}
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {labels.cancelEdit}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">
        {errorMessage ? (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}

        {!isEditing ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 border border-border/50 bg-white/2">
                <AvatarImage src={resolvedAvatarSrc} alt="" />
                <AvatarFallback className="text-xl text-fg/60">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">{labels.profilePicture}</p>
                <p className="text-sm text-fg/50">{resolvedDisplayName}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField label={labels.displayName} value={resolvedDisplayName} />
              <ProfileField label={labels.email} value={email ?? labels.notSet} />
              <ProfileField label={labels.phone} mono value={phone} />
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
        ) : (
          <form
            ref={formRef}
            id={formId}
            className="space-y-8"
            noValidate
            onSubmit={handleSubmit}
          >
            <section className="space-y-4">
              <Label className="text-sm font-medium text-white">{labels.profilePicture}</Label>
              <div
                className={cn(
                  'flex flex-col gap-5 rounded-md border border-dashed border-border/50 bg-white/2 p-5 transition-colors sm:flex-row sm:items-center',
                  isDragging && 'border-white/30 bg-white/5',
                )}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <button
                  type="button"
                  className="relative mx-auto shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:mx-0"
                  disabled={pending}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={labels.uploadAvatar}
                >
                  <Avatar className="size-24 border border-border/50 bg-white/2">
                    <AvatarImage src={resolvedAvatarSrc} alt="" />
                    <AvatarFallback className="text-xl text-fg/60">{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  {!resolvedAvatarSrc ? (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Camera aria-hidden="true" className="size-7 text-fg/45" />
                    </span>
                  ) : null}
                </button>

                <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 rounded-md border-border/50 bg-transparent text-white hover:bg-white/5"
                    disabled={pending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera aria-hidden="true" className="mr-2 size-4" />
                    {labels.uploadAvatar}
                  </Button>
                  <p className="text-xs leading-5 text-fg/50">{labels.avatarHint}</p>
                  <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={pending}
                    id={`${formId}-avatar`}
                    name="avatar"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </section>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${formId}-displayName`}>
                  {labels.displayName}
                  <span aria-hidden="true" className="text-destructive">
                    {' '}
                    *
                  </span>
                </Label>
                <Input
                  required
                  aria-required="true"
                  className="min-h-11 rounded-md border-border/50 bg-transparent"
                  defaultValue={displayName ?? ''}
                  disabled={pending}
                  id={`${formId}-displayName`}
                  name="displayName"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${formId}-email`}>{labels.email}</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  className="min-h-11 rounded-md border-border/50 bg-transparent"
                  defaultValue={email ?? ''}
                  disabled={pending}
                  id={`${formId}-email`}
                  name="email"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>{labels.phone}</Label>
                <Input
                  readOnly
                  aria-readonly="true"
                  className="min-h-11 rounded-md border-border/50 bg-white/2 font-mono text-xs"
                  value={phone}
                />
                <p className="text-xs leading-5 text-fg/50">{labels.phoneReadOnly}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${formId}-countryId`}>
                  {labels.country}{' '}
                  <span className="font-normal text-fg/45">({labels.optional})</span>
                </Label>
                <select
                  defaultValue={countryId ?? ''}
                  disabled={pending}
                  id={`${formId}-countryId`}
                  name="countryId"
                  className={fieldSelectClass}
                >
                  <option value="" />
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${formId}-cityId`}>
                  {labels.city}{' '}
                  <span className="font-normal text-fg/45">({labels.optional})</span>
                </Label>
                <select
                  defaultValue={cityId ?? ''}
                  disabled={pending}
                  id={`${formId}-cityId`}
                  name="cityId"
                  className={fieldSelectClass}
                >
                  <option value="" />
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-bio`}>
                {labels.bio}{' '}
                <span className="font-normal text-muted-foreground">({labels.optional})</span>
              </Label>
              <Textarea
                className="min-h-32 rounded-md border-border/50 bg-transparent"
                defaultValue={bio ?? ''}
                disabled={pending}
                id={`${formId}-bio`}
                name="bio"
              />
              <p className="text-xs leading-5 text-fg/50">{labels.bioHint}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
