interface Props {
	wrapperClass?: string;
	size?: number;
	style?: SpinnerStyles;
}

type SpinnerStyles = "default" | "light";

const Spinner = (props: Props) => {
	const { wrapperClass, size = 30, style = "default" } = props;

	const primaryColor = style === "default" ? "#192536" : "#fefefe";
	const secondaryColor = style === "default" ? "#38414f" : "#fefefe";

	return (
		<div className={wrapperClass} role="status" aria-label="oval-loading">
			<svg
				width={size}
				height={size}
				viewBox="0 0 38 38"
				xmlns="http://www.w3.org/2000/svg"
				stroke={primaryColor}
				aria-hidden="true"
			>
				<g fill="none" fillRule="evenodd">
					<g transform="translate(1 1)" strokeWidth="3">
						<circle
							strokeOpacity=".5"
							cx="18"
							cy="18"
							r="18"
							stroke={secondaryColor}
						/>
						<path d="M36 18c0-9.94-8.06-18-18-18">
							<animateTransform
								attributeName="transform"
								type="rotate"
								from="0 18 18"
								to="360 18 18"
								dur="1s"
								repeatCount="indefinite"
							/>
						</path>
					</g>
				</g>
			</svg>
		</div>
	);
};

export default Spinner;
