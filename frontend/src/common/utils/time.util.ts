import { ContestTimeStatus } from '../enums';

export const formatDate = (date: string | number): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeRemaining = (targetDate: string | number): string => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} days`;
};

export const getContestTimeStatus = (
  startTime: string | number,
  endTime: string | number,
): ContestTimeStatus => {
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
