import { memo, useMemo } from 'react';

import { useTimeAgo } from './hooks';

type DateInput = { isoDateTime: string } | { unixTimestampMs: number } | { date: Date };

export type DateTimeProps = DateInput & {
  /** Locale(s) for both the absolute and relative formatting. Defaults to the runtime locale. */
  locale?: string | string[];
  /** Options for the absolute date/time. Defaults to a short date + time. */
  dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
  /** Show the "x minutes ago" label alongside the absolute time. Defaults to true. */
  showTimeAgo?: boolean;
  className?: string;
};

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

const toDate = (props: DateInput): Date => {
  if ('isoDateTime' in props) {
    return new Date(props.isoDateTime);
  }
  if ('unixTimestampMs' in props) {
    return new Date(props.unixTimestampMs);
  }
  return props.date;
};

const component: React.FC<DateTimeProps> = (props) => {
  const { locale, dateTimeFormatOptions, showTimeAgo = true, className } = props;

  // Stable primitive key so a fresh props object doesn't churn the memo.
  const dateKey = 'isoDateTime' in props ? props.isoDateTime : 'unixTimestampMs' in props ? props.unixTimestampMs : props.date.getTime();

  const date = useMemo(() => toDate(props), [dateKey]);

  const formattedDateTime = useMemo(
    () => date.toLocaleString(locale, dateTimeFormatOptions ?? DEFAULT_FORMAT_OPTIONS),
    [date, locale, dateTimeFormatOptions],
  );

  const timeAgo = useTimeAgo(date, locale);

  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString(locale)} className={className}>
      {formattedDateTime}
      {showTimeAgo ? ` (${timeAgo})` : ''}
    </time>
  );
};

export const DateTime = memo(component);
