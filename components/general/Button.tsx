type ButtonProps = {
	onClick?: (e: any) => void;
	variant?: "primary" | "secondary";
	size?: "sm" | "md";
	children?: React.ReactNode;
	className?: string;
	disabled?: boolean;
};

const Button = ({
	onClick = () => {},
	children,
	variant = "primary",
	size = "md",
	className = "",
	disabled = false,
}: ButtonProps) => {
	const sizeClasses =
		size === "sm"
			? "px-3 py-1.5 text-xs"
			: "px-4 py-2 text-sm";

	const variantClasses =
		variant === "primary"
			? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
			: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

	return (
		<button
			disabled={disabled}
			className={`inline-flex items-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
