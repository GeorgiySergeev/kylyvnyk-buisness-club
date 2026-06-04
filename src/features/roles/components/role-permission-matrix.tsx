'use client';

import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Resource } from '@/db/schema/permission';
import { RESOURCES } from '@/db/schema/permission';

interface PermissionRow {
  resource: Resource;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RolePermissionMatrixProps {
  initialPermissions: PermissionRow[];
  onChange?: (permissions: PermissionRow[]) => void;
  readOnly?: boolean;
  labels: {
    resource: string;
    canView: string;
    canCreate: string;
    canEdit: string;
    canDelete: string;
  };
}

const ACTION_KEYS = ['canView', 'canCreate', 'canEdit', 'canDelete'] as const;

export function RolePermissionMatrix({
  initialPermissions,
  onChange,
  readOnly = false,
  labels,
}: RolePermissionMatrixProps) {
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);

  function handleToggle(resource: Resource, action: (typeof ACTION_KEYS)[number]) {
    const updated = permissions.map((p) =>
      p.resource === resource ? { ...p, [action]: !p[action] } : p,
    );
    setPermissions(updated);
    onChange?.(updated);
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-0 bg-card">
            <TableHead className="text-muted-foreground">{labels.resource}</TableHead>
            <TableHead className="text-center text-muted-foreground">{labels.canView}</TableHead>
            <TableHead className="text-center text-muted-foreground">{labels.canCreate}</TableHead>
            <TableHead className="text-center text-muted-foreground">{labels.canEdit}</TableHead>
            <TableHead className="text-center text-muted-foreground">{labels.canDelete}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {RESOURCES.map((resource) => {
            const perm = permissions.find((p) => p.resource === resource);
            return (
              <TableRow key={resource} className="border-border">
                <TableCell className="font-medium text-foreground capitalize">
                  {resource.replace(/-/g, ' ')}
                </TableCell>
                {ACTION_KEYS.map((action) => (
                  <TableCell key={action} className="text-center">
                    <Label className="flex cursor-pointer items-center justify-center">
                      <Checkbox
                        checked={perm?.[action] ?? false}
                        disabled={readOnly}
                        onCheckedChange={() => handleToggle(resource, action)}
                        aria-label={`${resource} ${action.replace('can', '').toLowerCase()}`}
                      />
                    </Label>
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
