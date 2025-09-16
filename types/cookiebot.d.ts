declare global {
    interface Window {
      Cookiebot?: {
        renew: () => void
        show: () => void
        submitCustomConsent?: (categories: string) => void
        // có thể khai báo thêm nếu bạn cần
      }
    }
  }
  
  export {}
  