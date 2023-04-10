import Spinner from "../../general/Spinner";

interface Props {
	children: React.ReactNode;
	className?: string;
	loader?: boolean;
	saveActive?: boolean;

	cancelHit: () => void;
	saveHit: () => void;
	deleteHit?: () => void;
}

const TeamModal = (props: Props) => {
	const { loader = false, deleteHit = () => {} } = props;

	return (
		<>
			<div
				className={
					"w-[650px] h-fit px-8 pt-8 bg-white border rounded-md absolute full-center flex flex-col z-50 "
				}
			>
				<div
					className={"flex flex-col w-full h-fit " + props.className}
				>
					{props.children}
				</div>
				<div className="mt-8 w-full h-[75px] flex justify-between items-center relative">
					<div className="w-[calc(100%+64px)] h-[1px] bg-[#d4d8dc] absolute top-0 left-[-32px]" />
					<div className="flex gap-1">
						<button
							className={
								"w-[70px] h-[36px] flex items-center justify-center text-white font-medium rounded-md text-sm bg-red-600 hover:bg-red-700"
							}
							onClick={() => deleteHit()}
						>
							<span>Delete</span>
						</button>
					</div>
					<div className="flex gap-1">
						<button
							className="py-2 px-3.5 text-[#101827] hover:text-black font-semibold rounded-md text-sm"
							onClick={() => props.cancelHit()}
						>
							Cancel
						</button>
						<button
							className={
								"w-[60px] h-[36px] flex items-center justify-center text-white font-medium rounded-md text-sm " +
								(props.saveActive
									? "bg-blue-600 hover:bg-blue-700"
									: "bg-slate-600 hover:bg-slate-700")
							}
							onClick={() => props.saveHit()}
						>
							{loader ? (
								<Spinner style="light" size={20} />
							) : (
								<span>Save</span>
							)}
						</button>
					</div>
				</div>
			</div>
			<div
				className="h-screen w-screen fixed top-0 left-0 bg-black opacity-5 z-40"
				onClick={() => props.cancelHit()}
			/>
		</>
	);
};

export default TeamModal;
