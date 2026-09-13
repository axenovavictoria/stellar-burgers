import { FC, useEffect } from 'react';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { getFeedsApi } from '@api';

import { useDispatch, useSelector } from '../../services/store';
import { feedWsMessage, feedWsError } from '@slices';
import { selectFeedOrders, selectFeedLoading } from '@selectors';

const WS_URL =
  (process.env.BURGER_API_URL as string)
    .replace('https://', 'wss://')
    .replace('/api', '') + '/orders/all';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const loading = useSelector(selectFeedLoading);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        dispatch(feedWsMessage(data));
      } else {
        dispatch(feedWsError(data.message ?? 'Ошибка соединения'));
      }
    };

    ws.onerror = () => {
      dispatch(feedWsError('Не удалось подключиться к ленте заказов'));
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  const handleGetFeeds = () => {
    getFeedsApi()
      .then((data) => dispatch(feedWsMessage(data)))
      .catch(() => dispatch(feedWsError('Не удалось обновить ленту заказов')));
  };

  if (loading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
