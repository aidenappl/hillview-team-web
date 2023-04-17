import { useState } from "react";

interface Props {
	placeholder?: string;
	title?: string;
	runner?: string;
	wrapperClassName?: string;
	className?: string;
	required?: boolean;

	value: string;
	setValue: (value: string) => void;
}

const TeamModalTextarea = (props: Props) => {
	const [value, setValue] = useState(props.value);
	return (
		<div className={"flex flex-col gap-2 " + props.wrapperClassName}>
			<label className="font-medium text-[#101827] flex gap-1">
				{props.title}
				{props.required ? <p className="text-red-700">*</p> : null}
			</label>
			<textarea
				placeholder={props.placeholder}
				className={
					"shadow-sm w-full h-[100px] border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm " +
					props.className
				}
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
					props.setValue(e.target.value);
				}}
			></textarea>
			{props.runner ? (
				<p className="text-[15px] text-[#657183] text-sm">
					{props.runner}
				</p>
			) : null}
		</div>
	);
};

export default TeamModalTextarea;
