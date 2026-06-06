import type { CardMemberType, CardStatus } from '../../../db/schema/enums/card-status';

export type PublicCardStatus = CardStatus | 'NOT_FOUND';

export interface PublicCardDto {
  expiresAt: string | null;
  memberName: string | null;
  memberType: CardMemberType | null;
  number: string;
  status: PublicCardStatus;
}

export interface PublicCardRow {
  expiresAt: Date | null;
  memberName: string | null;
  memberType: CardMemberType;
  number: string;
  status: CardStatus;
}

export const PUBLIC_CARD_DTO_KEYS = [
  'expiresAt',
  'memberName',
  'memberType',
  'number',
  'status',
] as const satisfies readonly (keyof PublicCardDto)[];

function getPublicStatus(row: PublicCardRow): PublicCardStatus {
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return 'EXPIRED';
  }

  return row.status;
}

export function createPublicCardDto(
  row: PublicCardRow | null,
  requestedNumber: string,
  fallbackMemberName: string,
): PublicCardDto {
  if (!row) {
    return {
      expiresAt: null,
      memberName: null,
      memberType: null,
      number: requestedNumber,
      status: 'NOT_FOUND',
    };
  }

  return {
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    memberName: row.memberName?.trim() || fallbackMemberName,
    memberType: row.memberType,
    number: row.number,
    status: getPublicStatus(row),
  };
}
