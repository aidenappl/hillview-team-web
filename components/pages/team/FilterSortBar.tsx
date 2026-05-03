import { useEffect, useRef, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption = {
	value: string;
	label: string;
};

export type StatusOption = {
	id: number;
	label: string;
	activeClass: string; // Tailwind classes when selected
};

interface Props {
	// Search
	search?: string;
	onSearch?: (v: string) => void;
	searchPlaceholder?: string;

	// Sort
	sortValue: string;
	onSort: (v: string) => void;
	sortOptions: SortOption[];

	// Status filter
	statusOptions?: StatusOption[];
	activeStatuses?: number[];
	onStatusToggle?: (id: number) => void;

	// Extra controls rendered in the same flex row
	children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FilterSortBar = ({
	search,
	onSearch,
	searchPlaceholder = "Search…",
	sortValue,
	onSort,
	sortOptions,
	statusOptions = [],
	activeStatuses = [],
	onStatusToggle,
	children,
}: Props) => {
	const [internalSearch, setInternalSearch] = useState(search ?? "");
	const onSearchRef = useRef(onSearch);
	useEffect(() => { onSearchRef.current = onSearch; });

	// Sync if parent resets search
	useEffect(() => {
		setInternalSearch(search ?? "");
	}, [search]);

	// Debounce search
	useEffect(() => {
		const t = setTimeout(() => onSearchRef.current?.(internalSearch), 400);
		return () => clearTimeout(t);
	}, [internalSearch]);

	return (
		<div className="flex flex-wrap items-center gap-2 pb-3 pt-1">
			{/* Search */}
			{onSearch !== undefined && (
				<div className="relative w-full sm:max-w-xs">
					<svg
						className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
					<input
						type="text"
						value={internalSearch}
						onChange={(e) => setInternalSearch(e.target.value)}
						placeholder={searchPlaceholder}
						className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
					/>
				</div>
			)}

			{/* Sort */}
			<select
				value={sortValue}
				onChange={(e) => onSort(e.target.value)}
				className="h-9 rounded-lg border border-slate-200 bg-white px-3 pr-7 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none cursor-pointer"
				style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "14px" }}
			>
				{sortOptions.map((opt) => (
					<option key={opt.value} value={opt.value}>{opt.label}</option>
				))}
			</select>

			{/* Status pills */}
			{statusOptions.length > 0 && (
				<div className="flex flex-wrap items-center gap-1.5">
					{statusOptions.map((opt) => {
						const isActive = activeStatuses.includes(opt.id);
						return (
							<button
								key={opt.id}
								onClick={() => onStatusToggle?.(opt.id)}
								className={[
									"inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors",
									isActive
										? opt.activeClass
										: "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
								].join(" ")}
							>
								{opt.label}
							</button>
						);
					})}
				</div>
			)}

			{/* Extra controls (e.g. creator filter) */}
			{children}
		</div>
	);
};

export default FilterSortBar;
