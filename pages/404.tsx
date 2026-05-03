import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-8">
			<div className="flex flex-col items-center gap-4">
				<Image
					src="/logos/hillviewTVColor.png"
					alt="Hillview TV"
					width={72}
					height={72}
					priority
				/>
				<div className="flex flex-col items-center leading-none">
					<span className="text-xl font-semibold text-gray-900 tracking-tight">
						Hillview TV
					</span>
					<span className="text-sm text-gray-400 font-medium mt-1">
						Team Dashboard
					</span>
				</div>
			</div>

			<div className="flex flex-col items-center gap-2 text-center">
				<span className="text-7xl font-bold text-gray-900 tracking-tight leading-none">
					404
				</span>
				<p className="text-sm text-gray-400 font-medium">
					This page doesn't exist.
				</p>
			</div>

			<Link
				href="/"
				className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
			>
				Go home
			</Link>
		</div>
	);
}
