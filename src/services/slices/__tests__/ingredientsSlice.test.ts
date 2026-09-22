import reducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const mockIngredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: '',
    image_mobile: '',
    image_large: ''
  }
];

const initialState = {
  items: [],
  loading: false,
  error: null
};

describe('редьюсер ingredientsSlice', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('обрабатывает fetchIngredients.pending: включает загрузку и сбрасывает ошибку', () => {
    const state = reducer(
      { items: [], loading: false, error: 'старая ошибка' },
      fetchIngredients.pending('requestId', undefined)
    );
    expect(state).toEqual({ items: [], loading: true, error: null });
  });

  it('обрабатывает fetchIngredients.fulfilled: сохраняет ингредиенты и выключает загрузку', () => {
    const pendingState = { items: [], loading: true, error: null };
    const state = reducer(
      pendingState,
      fetchIngredients.fulfilled(mockIngredients, 'requestId', undefined)
    );
    expect(state).toEqual({
      items: mockIngredients,
      loading: false,
      error: null
    });
  });

  it('обрабатывает fetchIngredients.rejected: сохраняет текст ошибки и выключает загрузку', () => {
    const pendingState = { items: [], loading: true, error: null };
    const action = fetchIngredients.rejected(
      new Error('Ошибка сети'),
      'requestId',
      undefined
    );
    const state = reducer(pendingState, action);
    expect(state).toEqual({
      items: [],
      loading: false,
      error: 'Ошибка сети'
    });
  });
});
