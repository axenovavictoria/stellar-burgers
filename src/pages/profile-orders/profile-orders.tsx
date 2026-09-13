import { FC, useEffect } from 'react';
import { ProfileOrdersUI } from '@ui-pages';

import { useDispatch, useSelector } from '../../services/store';
import { ordersWsMessage, ordersWsError } from '@slices';
import { selectUserOrders } from '@selectors';
import { getCookie } from '../../utils/cookie';

const WS_BASE = (process.env.BURGER_API_URL as string)
  .replace('https://', 'wss://')
  .replace('/api', '');

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    const token = getCookie('accessToken')?.replace('Bearer ', '');
    const ws = new WebSocket(`${WS_BASE}/orders?token=${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        dispatch(ordersWsMessage(data));
      } else {
        dispatch(ordersWsError(data.message ?? 'Ошибка соединения'));
      }
    };

    ws.onerror = () => {
      dispatch(ordersWsError('Не удалось подключиться к истории заказов'));
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
