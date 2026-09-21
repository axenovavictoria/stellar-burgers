import { test, expect, Page } from '@playwright/test';

const BUN_ID = 'mock-bun-1';
const BUN_NAME = 'Краторная булка N-200i';
const MAIN_ID = 'mock-main-1';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const ORDER_NUMBER = 12345;

const mockBackend = async (page: Page) => {
  await page.routeFromHAR('./tests/hars/ingredients.har', {
    url: '**/api/ingredients'
  });
  await page.routeFromHAR('./tests/hars/order.har', {
    url: '**/api/auth/user'
  });
  await page.routeFromHAR('./tests/hars/order.har', {
    url: '**/api/orders/all'
  });
  await page.routeFromHAR('./tests/hars/order.har', {
    url: '**/api/orders'
  });
};

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await expect(page.getByTestId(`ingredient-${BUN_ID}`)).toBeVisible();
  });

  test('добавление булки', async ({ page }) => {
    await page
      .getByTestId(`ingredient-${BUN_ID}`)
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(page.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(page.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
  });

  test('добавление начинки', async ({ page }) => {
    await page
      .getByTestId(`ingredient-${MAIN_ID}`)
      .getByRole('button', { name: 'Добавить' })
      .click();

    // один раз в списке ингредиентов, второй раз — в самом конструкторе
    await expect(page.getByText(MAIN_NAME)).toHaveCount(2);
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await page.getByTestId(`ingredient-${BUN_ID}`).getByText(BUN_NAME).click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
  });

  test('отображает данные именно того ингредиента, по которому кликнули', async ({
    page
  }) => {
    await expect(page.getByTestId('ingredient-details-name')).toHaveText(
      BUN_NAME
    );
  });

  test('показывает данные другого ингредиента при повторном открытии', async ({
    page
  }) => {
    await page.getByTestId('modal-close-button').click();
    await page.getByTestId(`ingredient-${MAIN_ID}`).getByText(MAIN_NAME).click();
    await expect(page.getByTestId('ingredient-details-name')).toHaveText(
      MAIN_NAME
    );
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page
      .getByTestId('modal-overlay')
      .click({ position: { x: 5, y: 5 } });
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    // подставляем фейковые токены авторизации до первого запроса приложения
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await mockBackend(page);
    await page.goto('/');
    await expect(page.getByTestId(`ingredient-${BUN_ID}`)).toBeVisible();

    await page
      .getByTestId(`ingredient-${BUN_ID}`)
      .getByRole('button', { name: 'Добавить' })
      .click();
    await page
      .getByTestId(`ingredient-${MAIN_ID}`)
      .getByRole('button', { name: 'Добавить' })
      .click();
  });

  test('открывает модалку с верным номером заказа и очищает конструктор', async ({
    page
  }) => {  
    await page.getByRole('button', { name: 'Оформить заказ' }).click();
  
    await expect(page.getByTestId('order-number')).toHaveText(
      String(ORDER_NUMBER)
    );

    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('order-number')).not.toBeVisible();

    await expect(page.getByText('Выберите булки')).toHaveCount(2);
    await expect(page.getByText('Выберите начинку')).toBeVisible();
  });
});