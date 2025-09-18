// global.d.ts hoặc trong 1 file .d.ts bạn tự tạo
export {}

declare global {
  interface Window {
    Cookiebot?: Cookiebot
    __ucCmp?: UcCmp
  }
}

interface Cookiebot {
  renew: () => void
  show: () => void
  submitCustomConsent?: (categories: string) => void
  decline?: () => void
  withdraw?: () => void
  setOutOfRegion?: () => void
  // thêm các method/properties khác nếu Cookiebot có
}

interface UcCmp {
  showSecondLayer: () => void
  // nếu có thêm hàm/props khác thì khai báo thêm ở đây
}
