/** Shapes shared by several primitives. Component files stay free of type exports. */

export interface Option {
	value: string;
	label: string;
}

export interface GalleryImage {
	src: string;
	alt: string;
	width: number;
	height: number;
}

export interface PaletteColor {
	hex: string;
	label: string;
}

export interface TableColumn<Row> {
	key: keyof Row & string;
	title: string;
	sortable?: boolean;
	align?: 'start' | 'end';
}
