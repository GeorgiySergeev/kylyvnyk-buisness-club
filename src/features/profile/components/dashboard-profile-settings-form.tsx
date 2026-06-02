'use client';

import { Camera, Check, Copy, Loader2, Save } from 'lucide-react';
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
import {
  type DashboardProfileData,
  type DashboardProfileLabels,
  fieldSelectClass,
  getInitials,
  type SelectOption,
} from './dashboard-profile-shared';

export interface DashboardProfileSettingsFormProps extends DashboardProfileData {
  cities: SelectOption[];
  countries: SelectOption[];
  labels: DashboardProfileLabels;
  locale: SupportedLocale;
}

export function DashboardProfileSettingsForm({
  avatarUrl,
  bio,
  cityId,
  cities,
  countries,
  countryId,
  displayName,
  email,
  labels,
  locale,
  phone,
  userId,
}: DashboardProfileSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUserIdCopied, setIsUserIdCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();

  const resolvedAvatarSrc = previewUrl ?? avatarUrl ?? undefined;

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

    const formData = new FormData(event.currentTarget);

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
      router.refresh();
    });
  }

  async function handleCopyUserId() {
    try {
      await navigator.clipboard.writeText(userId);
      setIsUserIdCopied(true);
      window.setTimeout(() => setIsUserIdCopied(false), 1800);
    } catch {
      setIsUserIdCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <form ref={formRef} id={formId} className="space-y-8" noValidate onSubmit={handleSubmit}>
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
            <p className="text-xs leading-5 text-fg/50">{labels.displayNameHint}</p>
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
            <p className="text-xs leading-5 text-fg/50">{labels.emailHint}</p>
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

          <div className="space-y-2 sm:col-span-2">
            <Label>{labels.userId}</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                aria-readonly="true"
                className="min-h-11 rounded-md border-border/50 bg-white/2 font-mono text-xs"
                value={userId}
              />
              <Button
                type="button"
                variant="outline"
                className="min-h-11 shrink-0 rounded-md border-border/50 bg-white/2 px-3 text-xs text-white hover:bg-white/5"
                onClick={handleCopyUserId}
                disabled={pending}
              >
                {isUserIdCopied ? (
                  <Check aria-hidden="true" className="mr-2 size-4" />
                ) : (
                  <Copy aria-hidden="true" className="mr-2 size-4" />
                )}
                {isUserIdCopied ? labels.userIdCopied : labels.userIdCopy}
              </Button>
            </div>
            <p className="text-xs leading-5 text-fg/50">{labels.userIdHint}</p>
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

        <Button
          className="min-h-11 rounded-md border border-border/50 bg-black text-white hover:bg-white/5"
          disabled={pending}
          type="submit"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="mr-2 size-4" />
          )}
          {labels.saveProfile}
        </Button>
      </form>
    </div>
  );
}
