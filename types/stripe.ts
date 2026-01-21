export {};

declare global {
  interface Window {
    StripeInstance: any;
    __awinLandingLoaded?: boolean;
  }
}
