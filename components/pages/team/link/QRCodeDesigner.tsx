import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DotType = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
type CornerType = "square" | "extra-rounded" | "dot";

interface QRDesign {
	dotType: DotType;
	cornerType: CornerType;
	fgColor: string;
	bgColor: string;
	logo: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT: QRDesign = {
	dotType: "square",
	cornerType: "square",
	fgColor: "#000000",
	bgColor: "#ffffff",
	logo: null,
};

const LOGO_PRESETS: { label: string; src: string }[] = [
	{ label: "Hawk Black", src: "/logos/hillview-hawk-black.png" },
	{ label: "Hawk White", src: "/logos/hillview-hawk-white.png" },
	{ label: "TV Color", src: "/logos/hillviewTVColor.png" },
	{ label: "TV Sun", src: "/logos/hillviewTVSun.png" },
];

const DOT_STYLES: { value: DotType; label: string }[] = [
	{ value: "square", label: "Square" },
	{ value: "dots", label: "Dots" },
	{ value: "rounded", label: "Rounded" },
	{ value: "extra-rounded", label: "Extra Rounded" },
	{ value: "classy", label: "Classy" },
	{ value: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_STYLES: { value: CornerType; label: string }[] = [
	{ value: "square", label: "Square" },
	{ value: "extra-rounded", label: "Rounded" },
	{ value: "dot", label: "Dot" },
];

const PRESETS: { label: string; fg: string; bg: string }[] = [
	{ label: "Classic", fg: "#000000", bg: "#ffffff" },
	{ label: "Navy", fg: "#21304f", bg: "#ffffff" },
	{ label: "Slate", fg: "#334155", bg: "#f1f5f9" },
	{ label: "Blue", fg: "#2563eb", bg: "#eff6ff" },
	{ label: "Dark", fg: "#f8fafc", bg: "#1e293b" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildConfig = (data: string, d: QRDesign) => ({
	width: 240,
	height: 240,
	data: data || "https://hillview.tv",
	dotsOptions: { type: d.dotType, color: d.fgColor },
	cornersSquareOptions: { type: d.cornerType, color: d.fgColor },
	cornersDotOptions: { type: d.cornerType === "dot" ? ("dot" as const) : undefined, color: d.fgColor },
	backgroundOptions: { color: d.bgColor },
	...(d.logo
		? { image: d.logo, imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.45, hideBackgroundDots: true } }
		: { image: "" }),
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	url: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const QRCodeDesigner = ({ url }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const qrRef = useRef<any>(null);
	const [design, setDesign] = useState<QRDesign>(DEFAULT);
	const logoInputRef = useRef<HTMLInputElement>(null);
	const [downloading, setDownloading] = useState(false);

	// ── Init (mount only) ────────────────────────────────────────────────────

	useEffect(() => {
		let mounted = true;
		import("qr-code-styling").then((mod) => {
			if (!mounted || !containerRef.current) return;
			const QRCodeStyling = mod.default;
			qrRef.current = new QRCodeStyling(buildConfig(url, design));
			containerRef.current.innerHTML = "";
			qrRef.current.append(containerRef.current);
		});
		return () => { mounted = false; };
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Update on change ─────────────────────────────────────────────────────

	useEffect(() => {
		if (!qrRef.current) return;
		qrRef.current.update(buildConfig(url, design));
	}, [url, design]);

	// ── Actions ──────────────────────────────────────────────────────────────

	const handleDownload = async (ext: "png" | "svg") => {
		if (!qrRef.current || downloading) return;
		setDownloading(true);
		try {
			const slug = url.split("/").pop() || "qr";
			await qrRef.current.download({ name: `hillview-${slug}`, extension: ext });
		} finally {
			setDownloading(false);
		}
	};

	const handlePrint = async () => {
		if (!qrRef.current) return;
		const blob = await qrRef.current.getRawData("png");
		if (!blob) return;
		const objectUrl = URL.createObjectURL(blob);
		const win = window.open("", "_blank");
		if (!win) return;
		win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Code — ${url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; gap: 16px; }
    img { width: 320px; height: 320px; image-rendering: pixelated; }
    p { font-size: 12px; color: #64748b; }
    @media print { @page { margin: 20mm; } }
  </style>
</head>
<body>
  <img src="${objectUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 200);" />
  <p>${url}</p>
</body>
</html>`);
		win.document.close();
	};

	const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => setDesign((p) => ({ ...p, logo: ev.target?.result as string }));
		reader.readAsDataURL(file);
		// Reset input so same file can be re-selected
		e.target.value = "";
	};

	const update = (partial: Partial<QRDesign>) =>
		setDesign((p) => ({ ...p, ...partial }));

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-5">
			{/* Preview */}
			<div className="flex flex-col items-center gap-2">
				<div
					className="rounded-xl border border-slate-100 p-3 shadow-sm"
					style={{ backgroundColor: design.bgColor }}
				>
					<div ref={containerRef} />
				</div>
				<p className="max-w-[240px] truncate text-center font-mono text-[11px] text-slate-400">{url || "hillview.tv/…"}</p>
			</div>

			{/* Color presets */}
			<div>
				<p className="mb-2 text-xs font-semibold text-slate-600">Presets</p>
				<div className="flex flex-wrap gap-1.5">
					{PRESETS.map((p) => (
						<button
							key={p.label}
							onClick={() => update({ fgColor: p.fg, bgColor: p.bg })}
							className={[
								"flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
								design.fgColor === p.fg && design.bgColor === p.bg
									? "border-blue-500 bg-blue-50 text-blue-700"
									: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
							].join(" ")}
						>
							<span
								className="inline-block h-3 w-3 shrink-0 rounded-full border border-slate-200"
								style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }}
							/>
							{p.label}
						</button>
					))}
				</div>
			</div>

			{/* Colors */}
			<div className="flex gap-3">
				{(["fgColor", "bgColor"] as const).map((key) => (
					<div key={key} className="flex flex-1 flex-col gap-1.5">
						<p className="text-xs font-semibold text-slate-600">
							{key === "fgColor" ? "Foreground" : "Background"}
						</p>
						<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 transition-colors hover:bg-slate-50">
							<span
								className="h-5 w-5 shrink-0 rounded border border-slate-200"
								style={{ backgroundColor: design[key] }}
							/>
							<span className="font-mono text-xs text-slate-600">{design[key]}</span>
							<input
								type="color"
								value={design[key]}
								onChange={(e) => update({ [key]: e.target.value })}
								className="h-0 w-0 opacity-0"
							/>
						</label>
					</div>
				))}
			</div>

			{/* Dot style */}
			<div>
				<p className="mb-2 text-xs font-semibold text-slate-600">Dot Style</p>
				<div className="flex flex-wrap gap-1.5">
					{DOT_STYLES.map((t) => (
						<button
							key={t.value}
							onClick={() => update({ dotType: t.value })}
							className={[
								"rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
								design.dotType === t.value
									? "border-blue-500 bg-blue-50 text-blue-700"
									: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
							].join(" ")}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{/* Corner style */}
			<div>
				<p className="mb-2 text-xs font-semibold text-slate-600">Corner Style</p>
				<div className="flex gap-1.5">
					{CORNER_STYLES.map((t) => (
						<button
							key={t.value}
							onClick={() => update({ cornerType: t.value })}
							className={[
								"rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
								design.cornerType === t.value
									? "border-blue-500 bg-blue-50 text-blue-700"
									: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
							].join(" ")}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{/* Logo */}
			<div>
				<p className="mb-2 text-xs font-semibold text-slate-600">
					Center Logo <span className="font-normal text-slate-400">(optional)</span>
				</p>

				{/* Preset logos + custom upload */}
				<div className="mb-2.5 flex gap-2">
					{LOGO_PRESETS.map((preset) => {
						const isActive = design.logo === preset.src;
						return (
							<button
								key={preset.src}
								onClick={() => update({ logo: isActive ? null : preset.src })}
								title={preset.label}
								className={[
									"flex h-10 w-10 items-center justify-center rounded-lg border p-1 transition-colors",
									isActive
										? "border-blue-500 ring-1 ring-blue-500"
										: "border-slate-200 hover:border-slate-300",
								].join(" ")}
								style={{ backgroundColor: preset.label.includes("White") ? "#334155" : "#f8fafc" }}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={preset.src} alt={preset.label} className="h-full w-full object-contain" />
							</button>
						);
					})}

					{/* Custom upload slot */}
					<button
						onClick={() => logoInputRef.current?.click()}
						title="Upload custom logo"
						className={[
							"flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
							design.logo && !LOGO_PRESETS.some((p) => p.src === design.logo)
								? "border-blue-500 ring-1 ring-blue-500"
								: "border-dashed border-slate-300 bg-white hover:border-slate-400",
						].join(" ")}
					>
						{design.logo && !LOGO_PRESETS.some((p) => p.src === design.logo) ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={design.logo} alt="Custom" className="h-full w-full rounded-md object-contain p-0.5" />
						) : (
							<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
						)}
					</button>
				</div>

				{design.logo && (
					<button
						onClick={() => update({ logo: null })}
						className="text-xs text-red-500 hover:text-red-700"
					>
						Remove logo
					</button>
				)}

				<input
					ref={logoInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleLogoUpload}
				/>
			</div>

			{/* Actions */}
			<div className="flex gap-2 border-t border-slate-100 pt-4">
				<button
					onClick={() => handleDownload("png")}
					disabled={downloading}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
				>
					<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
					</svg>
					Download PNG
				</button>
				<button
					onClick={() => handleDownload("svg")}
					disabled={downloading}
					className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
				>
					SVG
				</button>
				<button
					onClick={handlePrint}
					className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
				>
					<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
					</svg>
				</button>
			</div>
		</div>
	);
};

export default QRCodeDesigner;
