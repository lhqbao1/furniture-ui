export async function safeFetch<T>(
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("[SAFE_FETCH_ERROR]", error);
    return fallback;
  }
}
