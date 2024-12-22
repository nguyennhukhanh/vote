import { ContestTimeStatus } from '../enums';

export const formatDate = (date: string | number): string => {
  const utcDate = new Date(date);
  // Force using UTC time components instead of local time
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC', // Force UTC timezone
  }).format(utcDate);
};

export const getTimeRemaining = (targetDate: string | number): string => {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  // Convert to absolute days and hours for better display
  const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.abs(
    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  );

  if (days > 0) {
    return `${days} days${hours > 0 ? ` ${hours} hours` : ''}`;
  }

  if (hours > 0) {
    return `${hours} hours`;
  }

  const minutes = Math.abs(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  return `${minutes} minutes`;
};

export const getContestTimeStatus = (
  startTime: string | number,
  endTime: string | number,
): ContestTimeStatus => {
  // Force all time comparisons in UTC
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return ContestTimeStatus.UPCOMING;
  if (now > end) return ContestTimeStatus.ENDED;
  return ContestTimeStatus.ACTIVE;
};

export const getContestStatusStyle = (
  status: ContestTimeStatus,
): { badge: string; card: string } => {
  const styles = {
    [ContestTimeStatus.UPCOMING]: {
      badge: 'bg-yellow-100 text-yellow-800',
      card: 'border-l-4 border-yellow-400',
    },
    [ContestTimeStatus.ACTIVE]: {
      badge: 'bg-green-100 text-green-800',
      card: 'border-l-4 border-green-400',
    },
    [ContestTimeStatus.ENDED]: {
      badge: 'bg-gray-100 text-gray-800',
      card: 'border-l-4 border-gray-400 opacity-75',
    },
  };
  return styles[status];
};
