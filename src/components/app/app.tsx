import { FC, useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import '../../index.css';
import styles from './app.module.css';

import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';

import {
  AppHeader,
  IngredientDetails,
  OrderInfo,
  Modal,
  ProtectedRoute
} from '@components';
import { Preloader } from '@ui';

import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients, checkUserAuth } from '@slices';
import { selectIsAuthChecked } from '@selectors';

const OrderInfoModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { number } = useParams();
  const title = number ? `#${number.padStart(6, '0')}` : '';

  return (
    <Modal title={title} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const App: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthChecked = useSelector(selectIsAuthChecked);

  const locationState = location.state as {
    background?: ReturnType<typeof useLocation>;
  };
  const background = locationState?.background;

  useEffect(() => {
    dispatch(fetchIngredients());
    dispatch(checkUserAuth());
  }, [dispatch]);

  const handleModalClose = () => navigate(-1);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />

        <Route
          path='/ingredients/:id'
          element={
            <div className={styles.detailPageWrap}>
              <h3
                className={`${styles.detailHeader} text text_type_main-large`}
              >
                Детали ингредиента
              </h3>
              <IngredientDetails />
            </div>
          }
        />

        <Route path='/feed/:number' element={<OrderInfo />} />

        <Route
          path='/login'
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderInfo />
            </ProtectedRoute>
          }
        />

        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={<OrderInfoModal onClose={handleModalClose} />}
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <OrderInfoModal onClose={handleModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
