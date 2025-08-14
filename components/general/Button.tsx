type ButtonProps = {
	onClick?: () => void;
	variant?: "primary" | "secondary";
	size?: "xsmall" | "small" | "medium" | "large";
	children?: React.ReactNode;
};

const Button = ({
	onClick = () => {},
	children,
	variant = "primary",
	size = "small",
}: ButtonProps) => {
	return (
		<button
			className={`px-3 py-1.5 transition text-white rounded-md ${
				variant === "primary"
					? "bg-blue-600 hover:bg-blue-800"
					: "bg-slate-500 hover:bg-slate-700"
			} ${
				size === "xsmall"
					? "text-xs"
					: size === "small"
					? "text-sm"
					: size === "medium"
					? "text-md"
					: "text-lg"
			}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
