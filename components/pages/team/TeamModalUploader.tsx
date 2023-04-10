import Image from "next/image";

interface Props {
	title?: string;
	imageSource: string;
	altText: string;
	imageClassName?: string;
}

const TeamModalUploader = (props: Props) => {
	return (
		<div className={"flex flex-col gap-2"}>
			<label className="font-medium text-[#101827]">{props.title}</label>
			<div className="flex gap-4 items-center">
				<div
					className={
						"w-[50px] h-[50px] relative rounded-md overflow-hidden border shadow-sm " +
						props.imageClassName
					}
				>
					<Image
						src={props.imageSource}
						alt={props.altText}
						fill
						style={{ objectFit: "cover" }}
					/>
				</div>
				<input type="file" className="hidden" id="fileUploaderInput" />
				<button
					className="py-1.5 px-2.5 border font-medium rounded-md text-sm hover:bg-slate-50"
					onClick={() => {
						document.getElementById("fileUploaderInput")!.click();
					}}
				>
					Change
				</button>
			</div>
		</div>
	);
};

export default TeamModalUploader;
