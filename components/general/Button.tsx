type ButtonProps = {
	onClick?: (e: any) => void;
	variant?: "primary" | "secondary";
	size?: "xsmall" | "small" | "medium" | "large";
	children?: React.ReactNode;
	disabled?: boolean;
};

const Button = ({
	onClick = (e) => {},
	children,
	variant = "primary",
	disabled = false,
}: ButtonProps) => {
	return (
		<button
			disabled={disabled}
			className={`px-3 py-1.5 transition text-sm text-white rounded-md ${
				variant === "primary"
					? "bg-blue-600 hover:bg-blue-800"
					: "bg-slate-500 hover:bg-slate-700"
			}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
