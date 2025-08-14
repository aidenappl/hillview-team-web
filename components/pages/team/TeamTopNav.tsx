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
	const user: User = useSelector(selectUser);

	return (
		<div className="w-full h-[100px] md:h-[160px] relative flex items-center justify-between">
			{/* Left Content & Page Title */}
			<div className="flex sm:flex-col gap-1">
				<h1 className="text-3xl font-bold text-[#21304f]">{props.pageTitle}</h1>
				<p className="text-[#8792c1] font-light hidden md:block">
					{formattedDate}
				</p>
			</div>
			{/* Right Content */}
			<div className="block md:hidden w-[40px] h-[40px] bg-slate-100 shadow-sm border border-slate-5 rounded-full">
				<Image
					src={user?.profile_image_url || "/default-profile.png"}
					alt="Profile Picture"
					width={40}
					height={40}
					className="rounded-full"
				/>
			</div>
			{/* Hr */}
			<div className="h-[1px] w-full absolute bottom-0 right-0 bg-[#ebf0f6]" />
		</div>
	);
};

export default TeamTopNav;
