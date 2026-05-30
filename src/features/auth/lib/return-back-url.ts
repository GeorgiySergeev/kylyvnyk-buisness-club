const SAFE_RETURN_PATH = /^\/(en|ru|uk)\/(?:m|admin|directory)(?:\/|$)/;

export function isSafeReturnBackUrl(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }

  return SAFE_RETURN_PATH.test(path);
}
