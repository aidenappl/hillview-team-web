import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { Checkout } from "../../../models/checkout.model";
import { reqGetCheckouts, reqUpdateCheckout } from "../../../services/api/checkout.service";

require("dayjs/locale/en");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string): string =>
	dayjs(iso).locale("en").format("MMM D, h:mm A");

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID = "grid gap-x-4 items-center px-4";
const COLS = "grid-cols-[36px_1fr_80px] sm:grid-cols-[36px_1fr_160px_130px_80px] lg:grid-cols-[36px_1fr_160px_130px_160px_80px]";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			<div className="h-7 w-7 animate-pulse rounded-full bg-slate-100" />
			<div className="h-3.5 w-28 animate-pulse rounded-md bg-slate-100" />
			<div className="hidden h-3.5 w-24 animate-pulse rounded-md bg-slate-100 sm:block" />
			<div className="hidden h-3.5 w-24 animate-pulse rounded-md bg-slate-100 sm:block" />
			<div className="hidden h-3.5 w-24 animate-pulse rounded-md bg-slate-100 lg:block" />
			<div className="h-7 w-16 animate-pulse rounded-lg bg-slate-100" />
		</div>
	);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
				<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No checkouts</p>
			<p className="mt-1 text-xs text-slate-400">Asset checkouts will appear here</p>
		</div>
	);
}

// ─── Checkout row ─────────────────────────────────────────────────────────────

function CheckoutRow({
	checkout,
	onCheckIn,
	checkingIn,
}: {
	checkout: Checkout;
	onCheckIn: () => void;
	checkingIn: boolean;
}) {
	const isOut = checkout.checkout_status.short_name === "checked_out";

	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			{/* Avatar */}
			<div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
				<Image
					src={checkout.user.profile_image_url}
					alt={checkout.user.name}
					fill
					sizes="28px"
					style={{ objectFit: "cover" }}
				/>
			</div>

			{/* User */}
			<div className="flex min-w-0 flex-col gap-0.5">
				<p className="truncate text-sm font-medium text-slate-800">{checkout.user.name}</p>
				{/* Asset as subtitle on mobile */}
				<p className="truncate text-xs text-slate-400 sm:hidden">{checkout.asset.name}</p>
			</div>

			{/* Asset — sm+ */}
			<p className="hidden truncate text-xs text-slate-500 sm:block">{checkout.asset.name}</p>

			{/* Time Out — sm+ */}
			<p className="hidden truncate text-xs text-slate-500 sm:block">{formatTime(checkout.time_out)}</p>

			{/* Time In / status — lg+ */}
			<div className="hidden lg:flex items-center">
				{isOut ? (
					<span className="inline-block whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
						Checked Out
					</span>
				) : (
					<p className="truncate text-xs text-slate-500">{formatTime(checkout.time_in)}</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-end">
				{isOut ? (
					<button
						onClick={onCheckIn}
						disabled={checkingIn}
						className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{checkingIn ? "…" : "Check In"}
					</button>
				) : (
					<span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
						Done
					</span>
				)}
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CheckoutsPage = () => {
	const router = useRouter();
	const [checkouts, setCheckouts] = useState<Checkout[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const [checkingInId, setCheckingInId] = useState<number | null>(null);

	const initialize = async () => {
		setCheckouts(null);
		setOffset(0);
		try {
			const response = await reqGetCheckouts({ limit: 25, offset: 0 });
			if (response.success) {
				setCheckouts(response.data);
			} else {
				setCheckouts([]);
				toast.error("Failed to load checkouts");
			}
		} catch {
			setCheckouts([]);
			toast.error("Failed to load checkouts");
		}
	};

	const loadMore = async () => {
		setLoadingMore(true);
		const newOffset = offset + 25;
		try {
			const response = await reqGetCheckouts({ limit: 25, offset: newOffset });
			if (response.success) {
				setCheckouts((prev) => [...(prev ?? []), ...response.data]);
				setOffset(newOffset);
			} else {
				toast.error("Failed to load more checkouts");
			}
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		initialize();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleCheckIn = async (checkout: Checkout) => {
		setCheckingInId(checkout.id);
		try {
			const response = await reqUpdateCheckout(checkout.id, { check_in: true });
			if (response.success) {
				toast.success("Checked in successfully");
				// In-place update — mark as checked_in
				setCheckouts((prev) =>
					prev?.map((c) =>
						c.id === checkout.id
							? { ...c, checkout_status: { ...c.checkout_status, short_name: "checked_in", name: "Checked In" }, time_in: new Date().toISOString() }
							: c
					) ?? null
				);
			} else {
				toast.error(response.error_message || "Failed to check in");
			}
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setCheckingInId(null);
		}
	};

	return (
		<TeamContainer pageTitle="Checkouts" router={router}>
			{/* Header — desktop */}
			<div className="hidden sm:block">
				<TeamHeader title="System Checkouts" />
			</div>

			{/* Header — mobile */}
			<div className="flex sm:hidden items-center py-3">
				<p className="text-sm font-semibold text-slate-700">Checkouts</p>
			</div>

			{/* Table card */}
			<div className="pb-8 pt-2">
				<div className="overflow-hidden rounded-xl border border-slate-100">
					{/* Column headers */}
					<div className={`${GRID} ${COLS} border-b border-slate-100 bg-slate-50/80 py-2 text-xs font-semibold text-slate-500`}>
						<div /> {/* avatar spacer */}
						<p>User</p>
						<p className="hidden sm:block">Asset</p>
						<p className="hidden sm:block">Time Out</p>
						<p className="hidden lg:block">Time In</p>
						<div /> {/* actions spacer */}
					</div>

					{/* Body */}
					{checkouts === null ? (
						Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
					) : checkouts.length === 0 ? (
						<EmptyState />
					) : (
						checkouts.map((checkout) => (
							<CheckoutRow
								key={checkout.id}
								checkout={checkout}
								onCheckIn={() => handleCheckIn(checkout)}
								checkingIn={checkingInId === checkout.id}
							/>
						))
					)}
				</div>

				{/* Load more */}
				{checkouts && checkouts.length > 0 && checkouts.length % 25 === 0 && (
					<div className="flex justify-center pt-4">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loadingMore ? "Loading…" : "Load more"}
						</button>
					</div>
				)}
			</div>
		</TeamContainer>
	);
};

export default CheckoutsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Checkouts",
		},
	};
};
