import { memo, useMemo } from 'react';
import ReactTimeAgo from 'react-time-ago';

// TODO: Move this to global configs.
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
TimeAgo.addDefaultLocale(en);

const LastSeen = (props: any) => {
  const date = useMemo(() => new Date(props.isoTime), [props.isoTime]);
  return <ReactTimeAgo date={date} locale="en-US" />;
};

export default memo(LastSeen);
