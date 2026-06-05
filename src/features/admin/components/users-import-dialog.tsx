'use client';

import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type DragEvent, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { importUsersAction, type ImportUsersResult } from '../actions/user-admin.action';
import { type CsvParseResult, parseCsv } from '../lib/csv-parse';

type Step = 'idle' | 'preview' | 'importing' | 'results';

export interface UsersImportLabels {
  cancel: string;
  close: string;
  emptyValue: string;
  importConfirm: string;
  importDropzone: string;
  importEmpty: string;
  importErrorColumn: string;
  importErrors: string;
  importInvalidFile: string;
  importMoreRows: string;
  importPartialSuccess: string;
  importPreview: string;
  importRowNumber: string;
  importRowError: string;
  importSelectedRows: string;
  importSuccess: string;
  importTooManyRows: string;
  importUsers: string;
  importUsersDescription: string;
  importUsersTitle: string;
  importing: string;
  phone: string;
}

interface UsersImportDialogProps {
  labels: UsersImportLabels;
}

export function UsersImportDialog({ labels }: UsersImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [parsedData, setParsedData] = useState<CsvParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportUsersResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (file: File | null) => {
    setFileError(null);
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setFileError(labels.importInvalidFile);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setFileError(labels.importEmpty);
        return;
      }

      const result = parseCsv(text);
      if (result.headers.length === 0 || result.rows.length === 0) {
        setFileError(labels.importEmpty);
        return;
      }

      if (result.rows.length > 500) {
        setFileError(labels.importTooManyRows);
        return;
      }

      setParsedData(result);
      setStep('preview');
    };
    reader.onerror = () => setFileError(labels.importInvalidFile);
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleImport = () => {
    if (!parsedData) return;

    setStep('importing');
    startTransition(async () => {
      const users = parsedData.rows.map((row) => ({
        phone: row.phone?.trim() || '',
        displayName: row.displayName?.trim() || undefined,
        email: row.email?.trim() || undefined,
        role: row.role?.trim() || undefined,
        status: row.status?.trim() || undefined,
        membershipTier: row.membershipTier?.trim() || undefined,
      }));

      const res = await importUsersAction({ users });

      if (res.ok) {
        setImportResult(res.data);
        setStep('results');
        router.refresh();
      } else {
        setFileError(res.error);
        setStep('idle');
      }
    });
  };

  const resetDialog = () => {
    setStep('idle');
    setParsedData(null);
    setImportResult(null);
    setFileError(null);
    setOpen(false);
  };

  const previewRows = parsedData?.rows.slice(0, 10) ?? [];
  const displayHeaders = parsedData?.headers.filter(
    (h) => ['phone', 'displayName', 'email', 'role', 'status', 'membershipTier'].includes(h),
  ) ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetDialog(); else setOpen(v); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-2 border-0 bg-ds-surface text-ds-text shadow-sm hover:bg-ds-surface-2"
        >
          <Upload aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{labels.importUsers}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-ds-border bg-ds-surface sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels.importUsersTitle}</DialogTitle>
          <DialogDescription>{labels.importUsersDescription}</DialogDescription>
        </DialogHeader>

        {step === 'idle' || step === 'importing' ? (
          <div className="space-y-4">
            {fileError ? (
              <p
                className="rounded-md border border-ds-error/30 bg-ds-error-subtle px-4 py-3 text-sm text-ds-error"
                role="alert"
              >
                {fileError}
              </p>
            ) : null}

            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-ds-radius-lg border-2 border-dashed border-ds-border bg-ds-bg/50 p-10 text-center transition-colors hover:border-ds-border-strong hover:bg-ds-surface-2/60"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
              aria-label={labels.importDropzone}
            >
              <Upload aria-hidden="true" className="size-8 text-ds-text-muted" />
              <span className="text-sm text-ds-text-muted">{labels.importDropzone}</span>
            </div>

            <input
              ref={inputRef}
              accept=".csv"
              className="sr-only"
              onChange={handleInputChange}
              type="file"
            />
          </div>
        ) : null}

        {step === 'preview' && parsedData ? (
          <div className="space-y-4">
            <p className="text-sm text-ds-text-muted">
              {labels.importSelectedRows.replace('{count}', parsedData.rows.length.toLocaleString())}
            </p>

            <div className="max-h-60 overflow-auto rounded-ds-radius-md border border-ds-border bg-ds-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ds-border bg-ds-surface-2/70">
                    {displayHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-medium text-ds-text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-ds-border last:border-b-0 hover:bg-ds-surface-2/60"
                    >
                      {displayHeaders.map((h) => (
                        <td key={h} className="px-3 py-2 text-ds-text">
                          {row[h] || labels.emptyValue}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.rows.length > 10 ? (
              <p className="text-xs text-ds-text-muted">
                {labels.importMoreRows.replace(
                  '{count}',
                  (parsedData.rows.length - 10).toLocaleString(),
                )}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button onClick={() => setStep('idle')} variant="outline">
                {labels.cancel}
              </Button>
              <Button
                disabled={pending}
                onClick={() => void handleImport()}
              >
                {pending ? (
                  <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                ) : null}
                {labels.importConfirm.replace('{count}', parsedData.rows.length.toLocaleString())}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 'importing' ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 aria-hidden="true" className="size-8 animate-spin text-ds-text-muted" />
            <p className="text-sm text-ds-text-muted">{labels.importing}</p>
          </div>
        ) : null}

        {step === 'results' && importResult ? (
          <div className="space-y-4">
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                importResult.errors.length === 0
                  ? 'border-ds-success/30 bg-ds-success-subtle text-ds-success'
                  : 'border-ds-warning/30 bg-ds-warning-subtle text-ds-warning'
              }`}
              role="status"
            >
              {importResult.errors.length === 0
                ? labels.importSuccess.replace('{count}', importResult.imported.toLocaleString())
                : labels.importPartialSuccess
                    .replace('{imported}', importResult.imported.toLocaleString())
                    .replace('{total}', importResult.total.toLocaleString())}
            </div>

            {importResult.errors.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-ds-error">
                  {labels.importErrors} ({importResult.errors.length})
                </p>
                <div className="max-h-40 overflow-auto rounded-ds-radius-md border border-ds-border bg-ds-surface">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ds-border bg-ds-surface-2/70">
                        <th className="px-3 py-2 text-left font-medium text-ds-text-muted">
                          {labels.importRowNumber}
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-ds-text-muted">
                          {labels.phone}
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-ds-text-muted">
                          {labels.importErrorColumn}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err) => (
                        <tr key={err.row} className="border-b border-ds-border last:border-b-0">
                          <td className="px-3 py-2 text-ds-text">{err.row}</td>
                          <td className="px-3 py-2 text-ds-text">{err.phone}</td>
                          <td className="px-3 py-2 text-ds-error">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button onClick={() => resetDialog()}>
                {labels.close}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
