'use client';

import { Eye, Pencil } from 'lucide-react';

import { AdminRowActions, type RowAction } from './admin-row-actions';

interface IntroductionRowActionsProps {
  actionLabel: string;
  viewHref: string;
  viewLabel: string;
}

export function IntroductionRowActions({
  actionLabel,
  viewHref,
  viewLabel,
}: IntroductionRowActionsProps) {
  const actions: RowAction[] = [
    { label: viewLabel, href: viewHref, icon: <Eye className="size-4" /> },
    { label: 'Edit', href: viewHref, icon: <Pencil className="size-4" /> },
  ];

  return <AdminRowActions actions={actions} actionLabel={actionLabel} />;
}
