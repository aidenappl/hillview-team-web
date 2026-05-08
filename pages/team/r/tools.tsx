import { useRouter } from "next/router";
import { useState } from "react";
import { GetStaticProps } from "next";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import PlatformOverview from "../../../components/pages/team/tools/PlatformOverview";
import QRCodeTool from "../../../components/pages/team/tools/QRCodeTool";
import DataExportTool from "../../../components/pages/team/tools/DataExportTool";
import BulkVideoTool from "../../../components/pages/team/tools/BulkVideoTool";
import BulkAssetTool from "../../../components/pages/team/tools/BulkAssetTool";

// ─── Tool definitions ───────────────────────────────────────────────────────

type ToolId = "overview" | "qr" | "export" | "bulk-video" | "bulk-asset";

interface ToolDef {
	id: ToolId;
	label: string;
	description: string;
	icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
	{
		id: "overview",
		label: "Platform Overview",
		description: "Live stats across all resources",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
			</svg>
		),
	},
	{
		id: "qr",
		label: "QR Code Generator",
		description: "Create styled QR codes for any URL",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
			</svg>
		),
	},
	{
		id: "export",
		label: "Data Export",
		description: "Download platform data as CSV",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
			</svg>
		),
	},
	{
		id: "bulk-video",
		label: "Bulk Video Status",
		description: "Batch update video statuses",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
			</svg>
		),
	},
	{
		id: "bulk-asset",
		label: "Bulk Asset Status",
		description: "Batch update asset statuses",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
			</svg>
		),
	},
];

// ─── Tool content renderer ──────────────────────────────────────────────────

const ToolContent = ({ toolId }: { toolId: ToolId }) => {
	switch (toolId) {
		case "overview":
			return <PlatformOverview />;
		case "qr":
			return <QRCodeTool />;
		case "export":
			return <DataExportTool />;
		case "bulk-video":
			return <BulkVideoTool />;
		case "bulk-asset":
			return <BulkAssetTool />;
	}
};

// ─── Page ────────────────────────────────────────────────────────────────────

const ToolsPage = () => {
	const router = useRouter();
	const [activeTool, setActiveTool] = useState<ToolId | null>(null);

	const activeDef = TOOLS.find((t) => t.id === activeTool);

	return (
		<TeamContainer pageTitle="Tools" router={router}>
			<TeamHeader title="Admin Tools" />

			{/* Tool cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pb-4">
				{TOOLS.map((tool) => {
					const isActive = activeTool === tool.id;
					return (
						<button
							key={tool.id}
							onClick={() => setActiveTool(isActive ? null : tool.id)}
							className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
								isActive
									? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
									: "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
							}`}
						>
							<div
								className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
									isActive
										? "bg-blue-600 text-white"
										: "bg-slate-100 text-slate-500"
								}`}
							>
								{tool.icon}
							</div>
							<div className="min-w-0">
								<p className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-700"}`}>
									{tool.label}
								</p>
								<p className={`mt-0.5 text-xs leading-relaxed ${isActive ? "text-blue-500" : "text-slate-400"}`}>
									{tool.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>

			{/* Active tool content */}
			{activeTool && activeDef && (
				<div className="pb-8">
					<div className="rounded-xl border border-slate-100 bg-white shadow-sm">
						{/* Tool header */}
						<div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
							<div className="flex items-center gap-2.5">
								<div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
									<div className="scale-[0.7]">{activeDef.icon}</div>
								</div>
								<h3 className="text-sm font-semibold text-slate-800">{activeDef.label}</h3>
							</div>
							<button
								onClick={() => setActiveTool(null)}
								className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Tool body */}
						<div className="p-5">
							<ToolContent toolId={activeTool} />
						</div>
					</div>
				</div>
			)}
		</TeamContainer>
	);
};

export default ToolsPage;

export const getStaticProps: GetStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Tools",
		},
	};
};
