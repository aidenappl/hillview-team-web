import React from "react";

interface Props {
	title: string;
	children?: React.ReactNode;
}

const TeamHeader = ({ title, children }: Props) => {
	return (
		<div className="flex w-full flex-col gap-3 py-3 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
			<h2 className="font-semibold text-[15px] lg:text-[17px]">{title}</h2>
			{children && (
				<div className="flex shrink-0 flex-wrap gap-2">{children}</div>
			)}
		</div>
	);
};

export default TeamHeader;
