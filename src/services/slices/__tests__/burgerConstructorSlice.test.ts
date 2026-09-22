jest.mock('@reduxjs/toolkit', () => {
  const actual = jest.requireActual('@reduxjs/toolkit');
  return {
    ...actual,
    nanoid: () => 'test-id'
  };
});

import reducer, {
    addIngredient,
    removeIngredient,
    moveIngredientUp,
    moveIngredientDown,
    clearConstructor,
    initialState
  } from '../burgerConstructorSlice';
import { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Булка',
  type: 'bun',
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price: 100,
  image: '',
  image_mobile: '',
  image_large: ''
};

const main: TIngredient = {
  _id: 'main-1',
  name: 'Начинка',
  type: 'main',
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price: 200,
  image: '',
  image_mobile: '',
  image_large: ''
};

describe('редьюсер burgerConstructorSlice', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('addIngredient добавляет булку в поле bun с сгенерированным id', () => {
    const state = reducer(initialState, addIngredient(bun));
    expect(state.bun).toEqual({ ...bun, id: 'test-id' });
    expect(state.ingredients).toEqual([]);
  });

  it('addIngredient добавляет начинку в список ingredients', () => {
    const state = reducer(initialState, addIngredient(main));
    expect(state.ingredients).toEqual([{ ...main, id: 'test-id' }]);
    expect(state.bun).toBeNull();
  });

  it('removeIngredient удаляет ингредиент по id', () => {
    const stateBefore = {
      bun: null,
      ingredients: [
        { ...main, id: '1' },
        { ...main, id: '2' }
      ]
    };
    const state = reducer(stateBefore, removeIngredient('1'));
    expect(state.ingredients).toEqual([{ ...main, id: '2' }]);
  });

  it('moveIngredientUp меняет местами элемент с предыдущим', () => {
    const stateBefore = {
      bun: null,
      ingredients: [
        { ...main, id: '1' },
        { ...main, id: '2' }
      ]
    };
    const state = reducer(stateBefore, moveIngredientUp(1));
    expect(state.ingredients.map((i) => i.id)).toEqual(['2', '1']);
  });

  it('moveIngredientUp не меняет порядок для первого элемента', () => {
    const stateBefore = {
      bun: null,
      ingredients: [
        { ...main, id: '1' },
        { ...main, id: '2' }
      ]
    };
    const state = reducer(stateBefore, moveIngredientUp(0));
    expect(state.ingredients.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('moveIngredientDown меняет местами элемент со следующим', () => {
    const stateBefore = {
      bun: null,
      ingredients: [
        { ...main, id: '1' },
        { ...main, id: '2' }
      ]
    };
    const state = reducer(stateBefore, moveIngredientDown(0));
    expect(state.ingredients.map((i) => i.id)).toEqual(['2', '1']);
  });

  it('moveIngredientDown не меняет порядок для последнего элемента', () => {
    const stateBefore = {
      bun: null,
      ingredients: [
        { ...main, id: '1' },
        { ...main, id: '2' }
      ]
    };
    const state = reducer(stateBefore, moveIngredientDown(1));
    expect(state.ingredients.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('clearConstructor очищает булку и список ингредиентов', () => {
    const stateBefore = {
      bun: { ...bun, id: 'test-id' },
      ingredients: [{ ...main, id: 'test-id' }]
    };
    const state = reducer(stateBefore, clearConstructor());
    expect(state).toEqual(initialState);
  });
});
