import { faMinusCircle } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GeneralNSN } from "../../../models/GeneralNSN.model";

interface Props {
	title?: string;
	list: GeneralNSN[];

	destructiveClick?: (item: GeneralNSN) => void;
	itemClick?: (item: GeneralNSN) => void;
}

const TeamModalList = (props: Props) => {
	const { title, destructiveClick = () => {}, itemClick = () => {} } = props;

	return (
		<div className="flex flex-col gap-2 w-full">
			<label className="font-medium text-[#101827] flex gap-1">
				{props.title}
			</label>
			<div
				className={
					"flex flex-col gap-1 w-full h-fit max-h-[300px] flex-shrink-0 " +
					(props.list.length == 0
						? "overflow-y-none"
						: "overflow-y-scroll")
				}
			>
				{props.list.length > 0 ? (
					props.list.map((item, index) => {
						return (
							<div
								key={index}
								className="w-full h-[40px] flex-shrink-0 bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-5"
							>
								<p
									className="text-sm font-medium text-[#101827] cursor-pointer"
									onClick={(e: any) => {
										itemClick(item);
									}}
								>
									{item.name}
								</p>
								<div className="flex gap-2">
									<FontAwesomeIcon
										onClick={() => destructiveClick(item)}
										icon={faMinusCircle}
										className="text-slate-500 text-xl cursor-pointer hover:text-slate-700"
									/>
								</div>
							</div>
						);
					})
				) : (
					<p className="text-sm font-medium text-slate-500">
						No items
					</p>
				)}
			</div>
		</div>
	);
};

export default TeamModalList;
