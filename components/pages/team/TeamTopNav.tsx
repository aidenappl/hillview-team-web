import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user/slice";
import { User } from "../../../types";
import Image from "next/image";
require("dayjs/locale/en");

interface Props {
	pageTitle: string;
}

const TeamTopNav = (props: Props) => {
	const date = dayjs();
	const formattedDate = date.locale("en").format("dddd MMMM DD, YYYY");
	const user: User | null = useSelector(selectUser);

	return (
		<div className="w-full h-[80px] md:h-[120px] relative flex items-center justify-between">
			{/* Left Content & Page Title */}
			<div className="flex sm:flex-col gap-0.5">
				<h1 className="text-2xl font-bold text-[#21304f] md:text-3xl">{props.pageTitle}</h1>
				<p className="text-[#8792c1] font-light hidden md:block text-sm">
					{formattedDate}
				</p>
			</div>
			{/* Right Content */}
			<div className="flex items-center gap-3">
				<a
					href="https://hillview.tv"
					target="_blank"
					rel="noopener noreferrer"
					className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
				>
					<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
					</svg>
					hillview.tv
				</a>
				<div className="block md:hidden w-[40px] h-[40px] bg-slate-100 shadow-sm border border-slate-5 rounded-full">
					<Image
						src={user?.profile_image_url || "/default-profile.png"}
						alt="Profile Picture"
						width={40}
						height={40}
						className="rounded-full"
					/>
				</div>
			</div>
			{/* Hr */}
			<div className="h-[1px] w-full absolute bottom-0 right-0 bg-[#ebf0f6]" />
		</div>
	);
};

export default TeamTopNav;
