export function getFirstErrorMessage(errors: any): string | undefined {
  for (const key in errors) {
    const err = errors[key];
    if (err?.message) return err.message;
    if (typeof err === "object") {
      const nested = getFirstErrorMessage(err);
      if (nested) return nested;
    }
  }
  return undefined;
}
