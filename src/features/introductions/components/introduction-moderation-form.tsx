'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { setIntroductionStatusAction } from '../actions/set-introduction-status.action';

interface IntroductionModerationFormLabels {
  adminNotePlaceholder: string;
  approve: string;
  reject: string;
  save: string;
  statusUpdated: string;
  underReview: string;
  updateError: string;
}

interface IntroductionModerationFormProps {
  currentNote: string | null;
  currentStatus: string;
  introductionId: string;
  labels: IntroductionModerationFormLabels;
}

const MODERATION_STATUSES = [
  { labelKey: 'UNDER_REVIEW', value: 'UNDER_REVIEW' },
  { labelKey: 'APPROVED', value: 'APPROVED' },
  { labelKey: 'REJECTED', value: 'REJECTED' },
] as const;

function getStatusLabel(
  value: string,
  labels: Pick<IntroductionModerationFormLabels, 'approve' | 'reject' | 'underReview'>,
) {
  if (value === 'APPROVED') return labels.approve;
  if (value === 'REJECTED') return labels.reject;
  return labels.underReview;
}

export function IntroductionModerationForm({
  currentNote,
  currentStatus,
  introductionId,
  labels,
}: IntroductionModerationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [adminNote, setAdminNote] = useState(currentNote ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function submit() {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await setIntroductionStatusAction({
        adminNote,
        introductionId,
        status,
      });

      if (!result.ok) {
        setIsError(true);
        setMessage(result.error || labels.updateError);
        return;
      }

      setIsError(false);
      setMessage(labels.statusUpdated);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Select disabled={pending} value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-8 rounded-md border-border/80 bg-background/80 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODERATION_STATUSES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {getStatusLabel(item.labelKey, labels)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        className="min-h-20 rounded-md border-border/80 bg-background/80 text-sm"
        disabled={pending}
        maxLength={500}
        placeholder={labels.adminNotePlaceholder}
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
      />

      <Button
        className="h-8 w-full rounded-md"
        disabled={pending}
        size="sm"
        type="button"
        onClick={submit}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {labels.save}
      </Button>

      {message ? (
        <p className={`text-xs ${isError ? 'text-destructive' : 'text-emerald-600'}`}>{message}</p>
      ) : null}
    </div>
  );
}
