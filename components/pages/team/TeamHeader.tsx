import React from "react";

interface Props {
	title: string;
	children?: React.ReactNode;
}

const TeamHeader = (props: Props) => {
	return (
		<div className="w-full h-[100px] flex justify-between items-center">
			<h2 className="font-semibold text-[17px]">{props.title}</h2>
			<div className="flex gap-3">{props.children}</div>
		</div>
	);
};

export default TeamHeader;
