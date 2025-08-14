import dayjs from "dayjs";
require("dayjs/locale/en");

interface Props {
	pageTitle: string;
}

const TeamTopNav = (props: Props) => {
	const date = dayjs();
	const formattedDate = date.locale("en").format("dddd MMMM DD, YYYY");

	return (
		<div className="w-full h-[100px] md:h-[160px] relative flex items-center justify-between">
			{/* Left Content & Page Title */}
			<div className="flex sm:flex-col gap-1">
				<h1 className="text-3xl font-bold text-[#21304f]">{props.pageTitle}</h1>
				<p className="text-[#8792c1] font-light hidden md:block">
					{formattedDate}
				</p>
			</div>
			{/* Hr */}
			<div className="h-[1px] w-full absolute bottom-0 right-0 bg-[#ebf0f6]" />
		</div>
	);
};

export default TeamTopNav;
