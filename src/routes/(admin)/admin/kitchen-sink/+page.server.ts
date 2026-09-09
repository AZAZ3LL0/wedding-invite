import { config } from '$lib/server/config';
import type { GalleryImage } from '$lib/ui';
import type { PageServerLoad } from './$types';

// Placeholder art, so the kitchen sink needs no binary assets in the repository.
function swatch(label: string, background: string, width: number, height: number): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${background}"/><text x="50%" y="50%" fill="#23281F" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const load: PageServerLoad = () => {
	const images: GalleryImage[] = [
		{ src: swatch('1', '#DCE3D5', 600, 400), alt: 'Заглушка галереи 1', width: 600, height: 400 },
		{ src: swatch('2', '#B9A48C', 600, 400), alt: 'Заглушка галереи 2', width: 600, height: 400 },
		{ src: swatch('3', '#7C8F72', 600, 400), alt: 'Заглушка галереи 3', width: 600, height: 400 }
	];

	return {
		images,
		mapImage: swatch('Карта', '#F2EFE7', 960, 540),
		weddingDate: config.weddingDate.toISOString(),
		// Server rendered "now" keeps the first countdown paint identical on both sides.
		now: new Date().toISOString()
	};
};
