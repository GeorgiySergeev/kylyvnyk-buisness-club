'use client';

import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition, type ChangeEvent, type DragEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { importBusinessesAction, type ImportBusinessesResult } from '../actions/business-admin.action';
import { parseCsv, type CsvParseResult } from '../lib/csv-parse';

type Step = 'idle' | 'preview' | 'importing' | 'results';

export interface BusinessesImportLabels {
  cancel: string;
  close: string;
  importBusinesses: string;
  importBusinessesTitle: string;
  importBusinessesDescription: string;
  importDropzone: string;
  importPreview: string;
  importSelectedRows: string;
  importConfirm: string;
  importing: string;
  importSuccess: string;
  importPartialSuccess: string;
  importErrors: string;
  importRowError: string;
  importInvalidFile: string;
  importTooManyRows: string;
  importEmpty: string;
}

interface BusinessesImportDialogProps {
  labels: BusinessesImportLabels;
}

export function BusinessesImportDialog({ labels }: BusinessesImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [parsedData, setParsedData] = useState<CsvParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportBusinessesResult | null>(null);
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
      const businesses = parsedData.rows.map((row) => ({
        ownerPhone: row.ownerPhone?.trim() || '',
        name: row.name?.trim() || '',
        slug: row.slug?.trim() || undefined,
        description: row.description?.trim() || undefined,
        website: row.website?.trim() || undefined,
        phone: row.phone?.trim() || undefined,
        email: row.email?.trim() || undefined,
        status: row.status?.trim() || undefined,
      }));

      const res = await importBusinessesAction({ businesses });

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
    (h) => ['ownerPhone', 'name', 'slug', 'status'].includes(h),
  ) ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetDialog(); else setOpen(v); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-2 border-0 bg-card text-foreground"
        >
          <Upload aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{labels.importBusinesses}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels.importBusinessesTitle}</DialogTitle>
          <DialogDescription>{labels.importBusinessesDescription}</DialogDescription>
        </DialogHeader>

        {step === 'idle' || step === 'importing' ? (
          <div className="space-y-4">
            {fileError ? (
              <p
                className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {fileError}
              </p>
            ) : null}

            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-muted-foreground/50"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
              aria-label={labels.importDropzone}
            >
              <Upload aria-hidden="true" className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{labels.importDropzone}</span>
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
            <p className="text-sm text-muted-foreground">
              {labels.importSelectedRows.replace('{count}', parsedData.rows.length.toLocaleString())}
            </p>

            <div className="max-h-60 overflow-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    {displayHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-medium text-muted-foreground"
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
                      className="border-b border-border last:border-b-0 hover:bg-card"
                    >
                      {displayHeaders.map((h) => (
                        <td key={h} className="px-3 py-2 text-foreground">
                          {row[h] || '\u2014'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.rows.length > 10 ? (
              <p className="text-xs text-muted-foreground">
                +{parsedData.rows.length - 10} more rows
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
            <Loader2 aria-hidden="true" className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{labels.importing}</p>
          </div>
        ) : null}

        {step === 'results' && importResult ? (
          <div className="space-y-4">
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                importResult.errors.length === 0
                  ? 'border-green-500/30 bg-green-50 text-green-800'
                  : 'border-amber-500/30 bg-amber-50 text-amber-800'
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
                <p className="text-sm font-medium text-destructive">
                  {labels.importErrors} ({importResult.errors.length})
                </p>
                <div className="max-h-40 overflow-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err) => (
                        <tr key={err.row} className="border-b border-border last:border-b-0">
                          <td className="px-3 py-2 text-foreground">{err.row}</td>
                          <td className="px-3 py-2 text-foreground">{err.name}</td>
                          <td className="px-3 py-2 text-destructive">{err.error}</td>
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
