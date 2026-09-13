import { expect, test } from '@playwright/test';

/**
 * Product acceptance for stage 1. Segmentation is a server decision, so these tests
 * read the delivered HTML rather than what is on screen: a block hidden with CSS would
 * still fail here, which is the point.
 *
 * Codes come from the seed fixtures in lib/server/db/fixtures.ts.
 */

const FAMILY_TY = 'FAM4SEAT01';
const FAMILY_VY = 'PARTYAAA88';
const FRIENDS = 'FRNDNAMED2';
const COLLEAGUES = 'CWRKSEATR6';

// Text that exists in exactly one audience version of a block.
const FAMILY_MARKER = 'Утро невесты';
const REGISTRY_MARKER = 'ЗАГС';
const LOVE_STORY_MARKER = 'Очередь за кофе';
const CHILDREN_MARKER = 'Можно ли с детьми';

test('a friend never receives the family blocks', async ({ page }) => {
	await page.goto(`/${FRIENDS}`);
	const html = await page.content();

	expect(html).not.toContain(FAMILY_MARKER);
	expect(html).not.toContain(REGISTRY_MARKER);
	expect(html).not.toContain(CHILDREN_MARKER);
	expect(html).toContain('Сбор гостей');
});

test('the family sees the morning and the registry office', async ({ page }) => {
	await page.goto(`/${FAMILY_TY}`);
	const html = await page.content();

	expect(html).toContain(FAMILY_MARKER);
	expect(html).toContain(REGISTRY_MARKER);
	expect(html).toContain(CHILDREN_MARKER);
});

test('a colleague gets neither the family day nor the love story', async ({ page }) => {
	await page.goto(`/${COLLEAGUES}`);
	const html = await page.content();

	expect(html).not.toContain(FAMILY_MARKER);
	expect(html).not.toContain(LOVE_STORY_MARKER);
	expect(html).toContain('Что надеть');
});

test('the address form follows the invite', async ({ page }) => {
	await page.goto(`/${FAMILY_TY}`);
	const informal = await page.content();
	expect(informal).toContain('Ты растил нас');
	expect(informal).not.toContain('Вы растили нас');

	await page.goto(`/${FAMILY_VY}`);
	const formal = await page.content();
	expect(formal).toContain('Вы растили нас');
	expect(formal).not.toContain('Ты растил нас');
});

test('the guest is addressed by name inside the invitation', async ({ page }) => {
	await page.goto(`/${FAMILY_TY}`);
	await expect(page.getByRole('heading', { name: 'Семья Ивановых' })).toBeVisible();
	await expect(page.getByText('Ждём вас всей семьёй')).toBeVisible();
});

test('the hero image is eager, sized and offered as avif', async ({ page }) => {
	await page.goto(`/${FRIENDS}`);
	const hero = page.locator('picture img').first();

	await expect(hero).toHaveAttribute('loading', 'eager');
	await expect(hero).toHaveAttribute('fetchpriority', 'high');
	// Intrinsic size is what keeps CLS at zero while the bytes are still in flight.
	await expect(hero).toHaveAttribute('width', /\d+/);
	await expect(hero).toHaveAttribute('height', /\d+/);

	const avif = page.locator('picture source[type="image/avif"]').first();
	await expect(avif).toHaveAttribute('srcset', /\.avif \d+w/);
});

test('reduced motion shows the blocks below the fold without waiting', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.goto(`/${FRIENDS}`);

	const contacts = page.getByRole('heading', { name: 'Кому написать' });
	await expect(contacts).toBeVisible();

	// Playwright counts a transparent element as visible, so read the opacity: the
	// reveal wrapper must already be at full strength, without a scroll or a wait.
	const opacity = await contacts.evaluate((node) => {
		const wrapper = node.closest('.reveal');
		return wrapper ? getComputedStyle(wrapper).opacity : null;
	});
	expect(opacity).toBe('1');

	await context.close();
});
