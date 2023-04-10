import Image from "next/image";
import { ChangeEventHandler } from "react";
import Spinner from "../../general/Spinner";

interface Props {
	title?: string;
	imageSource: string;
	altText: string;
	imageClassName?: string;
	showImageLoader?: boolean;
	onChange: (event: ChangeEventHandler<HTMLInputElement>) => void;
}

const TeamModalUploader = (props: Props) => {
	const { showImageLoader = false } = props;

	return (
		<div className={"flex flex-col gap-2"}>
			<label className="font-medium text-[#101827]">{props.title}</label>
			<div className="flex gap-4 items-center">
				<div
					className={
						"w-[50px] h-[50px] relative rounded-md overflow-hidden border shadow-sm cursor-pointer flex items-center justify-center " +
						props.imageClassName
					}
					onClick={() => {
						if (!showImageLoader)
							document
								.getElementById("fileUploaderInput")!
								.click();
					}}
				>
					{showImageLoader ? (
						<Spinner />
					) : (
						<Image
							src={props.imageSource}
							alt={props.altText}
							fill
							style={{ objectFit: "cover" }}
						/>
					)}
				</div>
				<input
					type="file"
					className="hidden"
					id="fileUploaderInput"
					accept="image/png, image/gif, image/jpeg"
					onChange={(e) => {
						props.onChange(e as any);
					}}
				/>
				<button
					className="py-1.5 px-2.5 border font-medium rounded-md text-sm hover:bg-slate-50"
					onClick={() => {
						if (!showImageLoader)
							document
								.getElementById("fileUploaderInput")!
								.click();
					}}
				>
					Change
				</button>
			</div>
		</div>
	);
};

export default TeamModalUploader;
