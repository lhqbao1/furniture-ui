export function runWhenIdle(fn: () => void) {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(
      () => {
        try {
          fn();
        } catch (e) {
          console.warn("Third-party script blocked safely:", e);
        }
      },
      { timeout: 3000 },
    );
  } else {
    setTimeout(() => {
      try {
        fn();
      } catch (e) {
        console.warn("Third-party script blocked safely:", e);
      }
    }, 1500);
  }
}
