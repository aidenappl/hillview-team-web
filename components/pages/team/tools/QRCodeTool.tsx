import { useState } from "react";
import QRCodeDesigner from "../link/QRCodeDesigner";

const QRCodeTool = () => {
	const [url, setUrl] = useState("");

	return (
		<div className="flex flex-col lg:flex-row gap-6">
			{/* URL input */}
			<div className="flex-1">
				<label className="block text-xs font-semibold text-slate-600 mb-2">
					Enter URL
				</label>
				<input
					type="url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://hillview.tv/..."
					className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
				/>
				<p className="mt-2 text-xs text-slate-400">
					Enter any URL to generate a customizable QR code. Use the controls below to style it.
				</p>
			</div>

			{/* QR Code Designer */}
			<div className="w-full lg:w-[340px] flex-shrink-0">
				<QRCodeDesigner url={url || "https://hillview.tv"} />
			</div>
		</div>
	);
};

export default QRCodeTool;
