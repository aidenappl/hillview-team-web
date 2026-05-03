import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

export default function LoadingScreen() {
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
			<FontAwesomeIcon
				icon={faSpinner}
				className="animate-spin text-gray-400 h-5 w-5"
			/>
		</div>
	);
}
