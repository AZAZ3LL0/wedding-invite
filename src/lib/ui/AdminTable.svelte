<script lang="ts" generics="Row extends Record<string, string | number | null>">
	import type { Snippet } from 'svelte';
	import type { TableColumn } from './types';

	interface Props {
		columns: TableColumn<Row>[];
		rows: Row[];
		rowKey: (row: Row) => string;
		caption: string;
		empty?: Snippet;
	}

	let { columns, rows, rowKey, caption, empty }: Props = $props();

	let sortKey: (keyof Row & string) | null = $state(null);
	let ascending = $state(true);

	const sorted = $derived.by(() => {
		if (!sortKey) return rows;
		const key = sortKey;
		return [...rows].sort((a, b) => {
			const left = a[key] ?? '';
			const right = b[key] ?? '';
			const result = left < right ? -1 : left > right ? 1 : 0;
			return ascending ? result : -result;
		});
	});

	function toggle(key: keyof Row & string) {
		if (sortKey === key) {
			ascending = !ascending;
			return;
		}
		sortKey = key;
		ascending = true;
	}
</script>

{#if rows.length === 0}
	<div class="empty">
		{#if empty}
			{@render empty()}
		{:else}
			<p>Пока пусто. Создайте первое приглашение.</p>
		{/if}
	</div>
{:else}
	<div class="scroll">
		<table>
			<caption class="visually-hidden">{caption}</caption>
			<thead>
				<tr>
					{#each columns as column (column.key)}
						<th
							scope="col"
							style:text-align={column.align ?? 'start'}
							aria-sort={sortKey === column.key
								? ascending
									? 'ascending'
									: 'descending'
								: undefined}
						>
							{#if column.sortable}
								<button type="button" onclick={() => toggle(column.key)}>{column.title}</button>
							{:else}
								{column.title}
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sorted as row (rowKey(row))}
					<tr>
						{#each columns as column (column.key)}
							<td style:text-align={column.align ?? 'start'}>{row[column.key] ?? '—'}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.scroll {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	th,
	td {
		padding: var(--space-3);
		border-bottom: 1px solid var(--sage-100);
		white-space: nowrap;
	}

	th {
		font-weight: 600;
		color: var(--sage-900);
	}

	th button {
		background: none;
		border: none;
		font: inherit;
		font-weight: 600;
		color: inherit;
		cursor: pointer;
		padding: 0;
	}

	.empty {
		padding: var(--space-6);
		text-align: center;
		border: 1px dashed var(--clay);
		border-radius: var(--radius-md);
		color: var(--sage-900);
	}
</style>
