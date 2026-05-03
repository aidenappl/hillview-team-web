import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NextRouter } from "next/router";
import PageContainer from "../../general/PageContainer";
import TeamNavbar from "./TeamNavbar";
import TeamTopNav from "./TeamTopNav";
import WhatsNewModal from "../../general/WhatsNewModal";
import { selectUser, updateUser } from "../../../redux/user/slice";
import { reqUpdateSelf } from "../../../services/api/user.service";

interface Props {
	children: React.ReactNode;
	pageTitle: string;
	router: NextRouter;
}

const TeamContainer = (props: Props) => {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
	const [acknowledging, setAcknowledging] = useState(false);

	const showWhatsNew = !!user && !user.shown_changes_popup;

	const handleAcknowledge = async () => {
		if (!user || acknowledging) return;
		setAcknowledging(true);
		try {
			await reqUpdateSelf({ shown_changes_popup: true });
		} catch {
			// Non-fatal — popup will reappear on next login if the write failed
		}
		dispatch(updateUser({ shown_changes_popup: true }));
		setAcknowledging(false);
	};

	return (
		<PageContainer className="flex overflow-hidden">
			{showWhatsNew && (
				<WhatsNewModal
					onAcknowledge={handleAcknowledge}
					acknowledging={acknowledging}
				/>
			)}
			{/* Sidebar */}
			<TeamNavbar router={props.router} />
			{/* Main content */}
			<div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden px-5 md:px-10">
				<TeamTopNav pageTitle={props.pageTitle} />
				<div className="flex-1 overflow-y-auto">
					{props.children}
				</div>
			</div>
		</PageContainer>
	);
};

export default TeamContainer;
