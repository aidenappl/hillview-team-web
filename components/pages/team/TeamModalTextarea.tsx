interface Props {
	placeholder?: string;
	title?: string;
	runner?: string;
	wrapperClassName?: string;

	value: string;
	setValue: (value: string) => {};
}

const TeamModalTextarea = (props: Props) => {
	return (
		<div className={"flex flex-col gap-2 " + props.wrapperClassName}>
			<label className="font-medium text-[#101827]">{props.title}</label>
			<textarea
				placeholder={props.placeholder}
				className="shadow-sm w-full h-[100px] border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
				value={props.value}
				onChange={(e) => {
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