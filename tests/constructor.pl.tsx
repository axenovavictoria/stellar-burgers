import { readFileSync } from 'fs';
import path from 'path';
import { test, expect, Page } from '@playwright/test';

type THarEntry = {
  request: { url: string; method: string };
  response: { content: { text: string } };
};

type THarFile = { log: { entries: THarEntry[] } };

const readHar = (fileName: string): THarFile =>
  JSON.parse(readFileSync(path.join(__dirname, 'hars', fileName), 'utf-8'));

const getResponseJson = <T,>(
  har: THarFile,
  url: string,
  method = 'GET'
): T => {
  const entry = har.log.entries.find(
    (e) => e.request.url === url && e.request.method === method
  );
  if (!entry) {
    throw new Error(`Запись не найдена в HAR: ${method} ${url}`);
  }
  return JSON.parse(entry.response.content.text);
};

const ingredientsHar = readHar('ingredients.har');
const orderHar = readHar('order.har');

const ingredientsResponse = getResponseJson<{
  data: { _id: string; name: string; type: string }[];
}>(ingredientsHar, 'https://norma.education-services.ru/api/ingredients');

const bun = ingredientsResponse.data.find((i) => i.type === 'bun')!;
const main = ingredientsResponse.data.find((i) => i.type === 'main')!;

const BUN_ID = bun._id;
const BUN_NAME = bun.name;
const MAIN_ID = main._id;
const MAIN_NAME = main.name;

const orderResponse = getResponseJson<{ order: { number: number } }>(
  orderHar,
  'https://norma.education-services.ru/api/orders',
  'POST'
);
const ORDER_NUMBER = orderResponse.order.number;

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

    const constructorSection = page.getByTestId('burger-constructor');
    await expect(
      constructorSection.getByText(`${BUN_NAME} (верх)`)
    ).toBeVisible();
    await expect(
      constructorSection.getByText(`${BUN_NAME} (низ)`)
    ).toBeVisible();
  });

  test('добавление начинки', async ({ page }) => {
    await page
      .getByTestId(`ingredient-${MAIN_ID}`)
      .getByRole('button', { name: 'Добавить' })
      .click();

    const constructorSection = page.getByTestId('burger-constructor');
    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await page.getByTestId(`ingredient-${BUN_ID}`).getByText(BUN_NAME).click();
    await expect(
      page.getByTestId('modal').getByText('Детали ингредиента')
    ).toBeVisible();
  });

  test('отображает данные именно того ингредиента, по которому кликнули', async ({
    page
  }) => {
    await expect(
      page.getByTestId('modal').getByTestId('ingredient-details-name')
    ).toHaveText(BUN_NAME);
  });

  test('показывает данные другого ингредиента при повторном открытии', async ({
    page
  }) => {
    await page.getByTestId('modal-close-button').click();
    await page.getByTestId(`ingredient-${MAIN_ID}`).getByText(MAIN_NAME).click();
    await expect(
      page.getByTestId('modal').getByTestId('ingredient-details-name')
    ).toHaveText(MAIN_NAME);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page
      .getByTestId('modal-overlay')
      .click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId('modal')).not.toBeVisible();
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

    await expect(
      page.getByTestId('modal').getByTestId('order-number')
    ).toHaveText(String(ORDER_NUMBER));

    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();

    const constructorSection = page.getByTestId('burger-constructor');
    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(
      2
    );
    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toBeVisible();
  });
});