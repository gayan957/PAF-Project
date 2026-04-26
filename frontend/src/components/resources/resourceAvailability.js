export const DAY_OPTIONS = [
  { value: 'MONDAY', label: 'Monday', short: 'Mon' },
  { value: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { value: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { value: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { value: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { value: 'SUNDAY', label: 'Sunday', short: 'Sun' },
];

const dayMap = DAY_OPTIONS.reduce((map, day) => ({ ...map, [day.value]: day }), {});

export function getAvailabilityWindows(resource) {
  if (resource?.availabilityWindows?.length > 0) {
    return resource.availabilityWindows;
  }
  if (resource?.availabilityStart && resource?.availabilityEnd) {
    return [{
      day: 'MONDAY',
      openingTime: resource.availabilityStart,
      closingTime: resource.availabilityEnd,
    }];
  }
  return [];
}

export function formatDay(day) {
  return dayMap[day]?.label || day;
}

export function formatShortDay(day) {
  return dayMap[day]?.short || day;
}

export function formatAvailabilitySummary(resource, maxItems = 2) {
  const windows = getAvailabilityWindows(resource);
  if (windows.length === 0) return 'No operating windows';

  const visible = windows.slice(0, maxItems).map((window) =>
    `${formatShortDay(window.day)} ${window.openingTime} to ${window.closingTime}`
  );
  const remaining = windows.length - visible.length;
  return remaining > 0 ? `${visible.join(', ')} +${remaining} more` : visible.join(', ');
}

export function timeToHour(timeStr) {
  if (!timeStr) return 0;
  return Number(timeStr.split(':')[0]);
}

export function windowHours(window) {
  return Math.max(0, timeToHour(window.closingTime) - timeToHour(window.openingTime));
}
