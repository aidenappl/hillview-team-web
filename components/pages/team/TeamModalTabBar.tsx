import { useEffect, useState } from "react";
import { GeneralNSN } from "../../../models/GeneralNSN.model";

interface Props {
	tabs: GeneralNSN[];

	activeTab: GeneralNSN;
	setActiveTab: (tab: GeneralNSN) => void;

	className?: string;
}

const TeamModalTabBar = (props: Props) => {
	const [locActiveTab, setLocActiveTab] = useState(props.tabs[0]);

	useEffect(() => {
		setLocActiveTab(props.activeTab);
	}, [props.activeTab]);

	return (
		<div className={"w-full h-[40px] flex items-center " + props.className}>
			{props.tabs.map((tab, index) => {
				return (
					<div
						key={index}
						className={
							"flex items-center justify-center px-4 h-full cursor-pointer relative select-none " +
							(locActiveTab == tab
								? "text-blue-800"
								: "text-black")
						}
						onClick={() => {
							setLocActiveTab(tab);
							props.setActiveTab(tab);
						}}
					>
						<p className="font-semibold text-sm">{tab.name}</p>
                        <div className={"w-full bg-blue-700 absolute bottom-0 left-0 transition " + (locActiveTab == tab ? "h-[2px]" : "h-[0px]")}/>
					</div>
				);
			})}
		</div>
	);
};

export default TeamModalTabBar;
