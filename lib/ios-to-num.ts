export function formatIOSDate(iso: string): string {
    const date = new Date(iso);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }

export  function formatDateToNum(dateInput: Date | string): string {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
    if (isNaN(date.getTime())) return ""; // nếu date invalid
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${day}.${month}.${year}`;
  }