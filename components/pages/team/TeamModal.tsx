import Spinner from "../../general/Spinner";

interface Props {
	children: React.ReactNode;
	className?: string;
	loader?: boolean;
	showDestructive?: boolean;
	saveActive?: boolean;
	destructiveText?: string;

	cancelHit: () => void;
	saveHit: () => void;
	deleteHit?: () => void;
}

const TeamModal = (props: Props) => {
	const {
		loader = false,
		deleteHit = () => {},
		showDestructive = true,
		destructiveText = "Delete",
	} = props;

	return (
		<>
			<div
				className={
					"w-full sm:w-[650px] h-full sm:h-fit px-2 sm:px-8 pt-8 bg-white border rounded-xl absolute full-center flex flex-col z-20 "
				}
			>
				<div className={"flex flex-col w-full h-fit " + props.className}>
					{props.children}
				</div>
				<div className="mt-8 w-full h-[75px] flex justify-between items-center relative">
					<div className="w-[calc(100%+64px)] h-[1px] bg-slate-100 absolute top-0 left-[-32px]" />
					<div className="flex gap-2">
						{showDestructive ? (
							<button
								className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
								onClick={() => deleteHit()}
							>
								{destructiveText}
							</button>
						) : null}
					</div>
					<div className="flex gap-2 py-4 sm:py-0">
						<button
							className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
							onClick={() => props.cancelHit()}
						>
							Cancel
						</button>
						<button
							className={[
								"flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
								props.saveActive
									? "bg-blue-600 hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-300",
							].join(" ")}
							onClick={() => props.saveHit()}
						>
							{loader ? <Spinner style="light" size={16} /> : <span>Save</span>}
						</button>
					</div>
				</div>
			</div>
			<div
				className="hidden sm:block h-screen w-screen fixed top-0 left-0 bg-black opacity-5 z-10"
				onClick={() => props.cancelHit()}
			/>
		</>
	);
};

export default TeamModal;
