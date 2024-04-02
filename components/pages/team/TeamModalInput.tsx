import { useEffect, useState } from "react";
import { GeneralNSM } from "../../../models/generalNSM.model";
import Spinner from "../../general/Spinner";

interface Props {
	placeholder?: string;
	title?: string;
	required?: boolean;

	dropdown?: GeneralNSM[];
	dropdownClick?: (item: GeneralNSM) => void;

	value: string;
	setValue?: (value: string) => void;

	setDelayedValue?: (value: string) => void;
	delay?: number;

	showActionButton?: boolean;
	actionButtonText?: string;
	actionButtonLoading?: boolean;
	actionButtonDisabled?: boolean;
	disabled?: boolean;
	actionButtonClick?: () => void;
}

const TeamModalInput = (props: Props) => {
	const {
		setValue = () => {},
		setDelayedValue = () => {},
		delay = 500,
		dropdownClick = () => {},
		showActionButton = false,
		actionButtonLoading = false,
		actionButtonDisabled = false,
		actionButtonText = "Untitled",
		disabled = false,
		actionButtonClick = () => {},
	} = props;

	const [internalValue, setInternalValue] = useState(props.value || "");

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			setDelayedValue(internalValue);
		}, delay);

		return () => clearTimeout(delayDebounceFn);
	}, [internalValue]);

	useEffect(() => {
		setInternalValue(props.value || "");
	}, [props.value]);

	return (
		<div className="flex flex-col gap-2 w-full relative">
			<label className="font-medium text-[#101827] flex gap-1">
				{props.title}
				{props.required ? <p className="text-red-700">*</p> : null}
			</label>
			<div className="flex gap-3">
				<input
					type="text"
					disabled={disabled}
					placeholder={props.placeholder}
					value={internalValue}
					onChange={(e) => {
						setInternalValue(e.target.value);
						setValue(e.target.value);
					}}
					className="shadow-sm w-full h-[40px] border rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
				/>
				{showActionButton ? (
					<button
						className="bg-blue-600 text-white rounded-md whitespace-nowrap px-3 shadow-md text-sm outline-none focus:ring-blue-500 focus:ring-2 hover:bg-blue-700"
						onClick={
							!actionButtonDisabled ? actionButtonClick : () => {}
						}
					>
						{actionButtonLoading && <Spinner style="light" />}
						{!actionButtonLoading && <p>{actionButtonText}</p>}
					</button>
				) : null}
			</div>
			{props.dropdown && props.dropdown.length > 0 ? (
				<div className="absolute top-[75px] z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
					{props.dropdown.map((item, index) => (
						<div
							onClick={() => {
								setInternalValue("");
								setValue("");
								dropdownClick(item);
							}}
							key={index}
							className="w-full relative cursor-pointer hover:bg-slate-50 select-none py-2 pl-3 pr-9 text-gray-900"
						>
							{item.name}
						</div>
					))}
				</div>
			) : null}
		</div>
	);
};

export default TeamModalInput;
