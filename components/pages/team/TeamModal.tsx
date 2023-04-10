import Spinner from "../../general/Spinner";

interface Props {
	children: React.ReactNode;
	className?: string;
	loader?: boolean;

	cancelHit: () => void;
	saveHit: () => void;
}

const TeamModal = (props: Props) => {
	const { loader = false } = props;

	return (
		<div
			className={
				"w-[650px] h-fit px-8 pt-8 bg-white border rounded-md absolute full-center flex flex-col z-50 "
			}
		>
			<div className={"flex flex-col w-full h-fit " + props.className}>
				{props.children}
			</div>
			<div className="mt-8 w-full h-[75px] flex justify-end items-center relative">
				<div className="w-[calc(100%+64px)] h-[1px] bg-[#d4d8dc] absolute top-0 left-[-32px]" />
				<div className="flex gap-1">
					<button
						className="py-2 px-3.5 text-[#101827] hover:text-black font-semibold rounded-md text-sm"
						onClick={() => props.cancelHit()}
					>
						Cancel
					</button>
					<button
						className="w-[60px] h-[36px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm"
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
	);
};

export default TeamModal;
