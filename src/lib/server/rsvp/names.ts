// Duplicate detection compares normalized names. The rules are fixed by tech.md
// section 4.3 and mirrored by the generated column on guests, so any change here
// has to change the column expression in the same commit.
const FOLDED = /[-'ʼ’]/g;
const SPACES = /\s+/g;

export function normalizeName(firstName: string | null, lastName: string | null): string {
	const raw = `${firstName ?? ''} ${lastName ?? ''}`;
	return raw.toLowerCase().replace(/ё/g, 'е').replace(FOLDED, '').replace(SPACES, ' ').trim();
}
