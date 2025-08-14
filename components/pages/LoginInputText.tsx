interface Props {
	value: string;
	setValue: (value: string) => void;
	placeholder?: string;
	type?: InputTypes;
	className?: string;
	wrapperClassName?: string;
	label?: string;
	onEnterKey?: () => void;
}

type InputTypes = "text" | "password";

const LoginInputText = (props: Props) => {
	const {
		value,
		setValue = () => {},
		placeholder,
		type = "text",
		className,
		wrapperClassName,
		label,
		onEnterKey,
	} = props;

	return (
		<div className={"w-full h-fit flex flex-col gap-2 " + wrapperClassName}>
			<label className="font-medium">{label}</label>
			<input
				type={type}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						onEnterKey?.();
					}
				}}
				placeholder={placeholder}
				className={
					"border-2 border-[#f0f2f4] rounded-xl pl-5 py-4 ß" + className
				}
			/>
		</div>
	);
};

export default LoginInputText;
