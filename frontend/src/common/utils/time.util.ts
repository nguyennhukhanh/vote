import moment from 'moment';

import { ContestTimeStatus } from '../enums';

export const formatDate = (date: string | number): string => {
  return moment.utc(date).local().format('MMM D, YYYY, hh:mm A');
};

export const getTimeRemaining = (targetDate: string | number): string => {
  const now = moment.utc();
  const target = moment.utc(targetDate);
  const days = target.diff(now, 'days');
  return `${days} days`;
};

export const getContestTimeStatus = (
  startTime: string | number,
  endTime: string | number,
): ContestTimeStatus => {
  const now = moment.utc();
  const start = moment.utc(startTime);
  const end = moment.utc(endTime);

  if (now.isBefore(start)) return ContestTimeStatus.UPCOMING;
  if (now.isAfter(end)) return ContestTimeStatus.ENDED;
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
