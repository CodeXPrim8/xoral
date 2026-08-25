const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function groupThousands(n: number) {
  const abs = Math.abs(Math.round(n)).toString();
  return abs.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Lagos is WAT (UTC+1) with no DST. */
function lagosWall(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return {
    weekday: WEEKDAYS[shifted.getUTCDay()],
    day: shifted.getUTCDate(),
    month: MONTHS[shifted.getUTCMonth()],
    year: shifted.getUTCFullYear(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

export function formatNaira(kobo: number) {
  const naira = Math.round(kobo / 100);
  const grouped = groupThousands(naira);
  return `₦${naira < 0 ? '-' : ''}${grouped}`;
}

export function formatEventDate(iso: string) {
  const p = lagosWall(iso);
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`;
}

export function formatEventTime(iso: string) {
  const p = lagosWall(iso);
  const hour12 = p.hour % 12 || 12;
  const ampm = p.hour >= 12 ? 'PM' : 'AM';
  const minute = String(p.minute).padStart(2, '0');
  return `${hour12}:${minute} ${ampm}`;
}

export function soldPercent(capacity: number, remaining: number) {
  if (capacity <= 0) return 0;
  const sold = Math.max(0, capacity - remaining);
  return Math.min(100, Math.round((sold / capacity) * 100));
}

export function availabilityFromRemaining(remaining: number, capacity: number): 'available' | 'selling_fast' | 'almost_gone' | 'sold_out' {
  if (remaining <= 0) return 'sold_out';
  const ratio = remaining / capacity;
  if (ratio <= 0.08) return 'almost_gone';
  if (ratio <= 0.35) return 'selling_fast';
  return 'available';
}

export function availabilityLabel(status: ReturnType<typeof availabilityFromRemaining>) {
  switch (status) {
    case 'sold_out':
      return 'Sold Out';
    case 'almost_gone':
      return 'Almost Gone';
    case 'selling_fast':
      return 'Selling Fast';
    default:
      return 'Available';
  }
}
