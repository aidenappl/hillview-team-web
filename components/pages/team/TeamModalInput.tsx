interface Props {
	placeholder?: string;
	title?: string;

	value: string;
	setValue: (value: string) => {};
}

const TeamModalInput = (props: Props) => {
	return (
		<div className="flex flex-col gap-2 w-full">
			<label className="font-medium text-[#101827]">{props.title}</label>
			<input
				type="text"
				placeholder={props.placeholder}
				value={props.value}
				onChange={(e) => {
					props.setValue(e.target.value);
				}}
				className="shadow-sm w-full h-[40px] border rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
			/>
		</div>
	);
};

export default TeamModalInput;
