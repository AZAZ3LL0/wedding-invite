import { expect, test } from '@playwright/test';

// Product acceptance for stage 0: the guest opens a personal link, answers for one
// guest, reloads and the answer is still there.

const CODE = 'FAM4SEAT01';

test('an unknown code is a 404', async ({ page }) => {
	const response = await page.goto('/ZZZZZZZZZZ');
	expect(response?.status()).toBe(404);
});

test('health answers in the shape the deploy reads', async ({ request }) => {
	const response = await request.get('/api/health');
	expect(response.status()).toBe(200);
	expect(await response.json()).toEqual({ status: 'ok', db: 'up' });
});

test('the root page has no public entrance', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.status()).toBe(404);
});

test('the guest confirms and the answer survives a reload', async ({ page }) => {
	await page.goto(`/${CODE}`);
	await expect(page.getByRole('heading', { name: 'Семья Ивановых' })).toBeVisible();

	const guest = page.getByRole('listitem').filter({ hasText: 'Ирина Иванова' });
	await guest.getByRole('button', { name: 'Подтвердить' }).click();
	await expect(guest.getByText('Идёт')).toBeVisible();

	await page.reload();
	const reloaded = page.getByRole('listitem').filter({ hasText: 'Ирина Иванова' });
	await expect(reloaded.getByText('Идёт')).toBeVisible();
});

test('the page keeps the admin comment to itself', async ({ page }) => {
	await page.goto(`/${CODE}`);
	expect(await page.content()).not.toContain('Тётя со стороны невесты');
});

test('reduced motion shows the content without waiting for animation', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.goto(`/${CODE}`);
	await expect(page.getByRole('heading', { name: 'Семья Ивановых' })).toBeInViewport();
	await context.close();
});
