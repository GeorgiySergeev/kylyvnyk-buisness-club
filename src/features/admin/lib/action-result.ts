export type AdminActionErrorCode =
  | "validation"
  | "conflict"
  | "forbidden"
  | "not_found"
  | "unauthorized";

export type AdminActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AdminActionErrorCode; error: string };
