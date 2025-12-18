import { Group, LoadingOverlay, Pagination, Paper, Table } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";
import { EmptyState } from "../EmptyState";

/**
 * Column definition for DataTable
 */
export interface Column<T> {
	/** Unique key for the column */
	key: string;
	/** Header text */
	header: string;
	/** Render function for the cell - receives full row data and row index */
	render: (item: T, index: number) => React.ReactNode;
	/** Optional fixed width */
	width?: number | string;
}

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
	/** Icon to display */
	icon?: TablerIcon;
	/** Main title */
	title: string;
	/** Description text */
	description?: string;
	/** Primary action button text */
	actionLabel?: string;
	/** Action button click handler */
	onAction?: () => void;
}

export interface DataTableProps<T> {
	/** Array of data items to display as rows */
	data: T[];
	/** Column definitions */
	columns: Column<T>[];
	/** Function to extract unique key from each row */
	rowKey: (item: T) => string;
	/** Loading state - shows overlay */
	loading?: boolean;
	/** Current page number (1-indexed) */
	page: number;
	/** Total number of pages */
	pageCount: number;
	/** Callback when page changes */
	onPageChange: (page: number) => void;
	/** Empty state configuration */
	emptyState?: EmptyStateConfig;
	/** Minimum width for horizontal scroll (default: 800) */
	minWidth?: number;
	/** Enable striped rows (default: true) */
	striped?: boolean;
	/** Enable highlight on hover (default: true) */
	highlightOnHover?: boolean;
}

/**
 * Reusable data table with pagination, loading states, and empty states
 */
export function DataTable<T>({
	data,
	columns,
	rowKey,
	loading = false,
	page,
	pageCount,
	onPageChange,
	emptyState,
	minWidth = 800,
	striped = true,
	highlightOnHover = true,
}: Readonly<DataTableProps<T>>) {
	const isEmpty = !loading && data.length === 0;

	return (
		<Paper withBorder radius="md" pos="relative" mih={200}>
			<LoadingOverlay visible={loading} zIndex={10} />

			{isEmpty ? (
				<EmptyState
					icon={emptyState?.icon ?? IconPlus}
					title={emptyState?.title ?? "No data"}
					description={emptyState?.description}
					actionLabel={emptyState?.actionLabel}
					onAction={emptyState?.onAction}
				/>
			) : (
				<>
					<Table.ScrollContainer minWidth={minWidth}>
						<Table striped={striped} highlightOnHover={highlightOnHover}>
							<Table.Thead>
								<Table.Tr>
									{columns.map((col) => (
										<Table.Th key={col.key} w={col.width}>
											{col.header}
										</Table.Th>
									))}
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{data.map((item, index) => (
									<Table.Tr key={rowKey(item)}>
										{columns.map((col) => (
											<Table.Td key={col.key}>
												{col.render(item, index)}
											</Table.Td>
										))}
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>

					{pageCount > 1 && (
						<Group justify="center" p="md">
							<Pagination
								total={pageCount}
								value={page}
								onChange={onPageChange}
							/>
						</Group>
					)}
				</>
			)}
		</Paper>
	);
}
