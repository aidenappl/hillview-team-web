import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowRightToBracket,
	faBoxArchive,
	faCheckSquare,
	faFilm,
	faLink,
	faTag,
	faUserGroup,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { NextRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user/slice";
import { User } from "../../../types";

interface Props {
	router: NextRouter;
}

const TeamNavbar = (props: Props) => {
	const user: User = useSelector(selectUser);
	const Option = (props: {
		icon: IconProp;
		text: string;
		selected: boolean;
		href: string;
		iconClassName?: string;
		iconSize?: SizeProp;
	}) => {
		const { iconSize = "lg" } = props;
		return (
			<Link href={props.href}>
				<div className="flex items-center justify-between md:justify-normal w-full h-[50px] lg:h-[55px] relative hover:bg-[#f7f9ff] md:pl-[15px] md:left-[-15px] rounded-2xl cursor-pointer group">
					<div
						className={
							"flex items-center justify-center w-full md:w-fit " +
							props.iconClassName
						}
					>
						<FontAwesomeIcon
							icon={props.icon}
							fixedWidth
							className={props.selected ? "text-[#3067f6]" : "text-[#6b76ab]"}
							size={iconSize}
						/>
					</div>
					<p
						className={
							"hidden md:block font-medium pl-2 lg:pl-4 text-sm lg:text-base " +
							(props.selected ? "text-[#3067f6]" : "text-[#6b76ab]")
						}
					>
						{props.text}
					</p>
					<div
						className={
							"h-full bg-blue-600 rounded-s-md transition-all right-[-45px] absolute top-0 hidden md:block " +
							(props.selected ? "w-[9px]" : "w-0")
						}
					/>
				</div>
			</Link>
		);
	};

	let pathname = props.router.pathname;

	return (
		<div className="w-[50px] md:w-[200px] text-sm lg:text-base lg:w-[290px] xl:w-[325px] 2xl:w-[350px] h-full p-[5px] md:p-[30px] lg:p-[40px] relative flex flex-col gap-8 md:gap-12 pt-10">
			{/* Logo */}
			<div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] bg-blue-600 rounded-xl bg-[length:28px] md:bg-[length:40px] bg-center bg-no-repeat bg-[url('/logos/hillviewTVSun.png')]" />
			{/* Navigation */}
			<div className="flex flex-col md:gap-8">
				<div>
					<h4 className="text-[#9fa9d3] tracking-tight text-sm lg:text-base pb-3 hidden md:block">
						SYSTEM
					</h4>
					{user.authentication.short_name == "admin" ? (
						<div className="flex flex-col gap-0.5">
							<Option
								icon={faTag}
								text="Assets"
								iconClassName="scale-110"
								selected={pathname === "/team/dashboard/assets"}
								href="/team/dashboard/assets"
							/>
							<Option
								icon={faCheckSquare}
								text="Checkouts"
								selected={pathname === "/team/dashboard/checkouts"}
								href="/team/dashboard/checkouts"
							/>
							<Option
								icon={faFilm}
								text="Videos"
								selected={pathname === "/team/dashboard/videos"}
								href="/team/dashboard/videos"
							/>
							<Option
								icon={faBoxArchive}
								text="Playlists"
								selected={pathname === "/team/dashboard/playlists"}
								href="/team/dashboard/playlists"
							/>
						</div>
					) : null}
					{user.authentication.short_name == "student" ? (
						<div className="flex flex-col gap-0.5">
							<Option
								icon={faFilm}
								text="Videos"
								selected={pathname === "/student/dashboard/videos"}
								href="/student/dashboard/videos"
							/>
							<Option
								icon={faBoxArchive}
								text="Playlists"
								selected={pathname === "/student/dashboard/playlists"}
								href="/student/dashboard/playlists"
							/>
						</div>
					) : null}
				</div>
				{user.authentication.short_name == "admin" ? (
					<div>
						<h4 className="text-[#9fa9d3] tracking-tight text-sm lg:text-base pb-3 hidden md:block">
							CUSTOMIZATION
						</h4>
						<div className="flex flex-col gap-0.5">
							<Option
								icon={faLink}
								text="Links"
								iconClassName="scale-95"
								selected={pathname === "/team/dashboard/links"}
								href="/team/dashboard/links"
							/>
							<Option
								icon={faUserGroup}
								text="Users"
								selected={pathname === "/team/dashboard/users"}
								iconClassName="scale-90"
								href="/team/dashboard/users"
							/>
						</div>
					</div>
				) : null}
			</div>
			<div className="absolute bottom-[40px] left-0 md:w-[calc(100%-80px)] w-full">
				<div className="flex flex-col gap-0.5">
					<Option
						icon={faArrowRightToBracket}
						text="Logout"
						iconClassName="scale-95"
						selected={false}
						href="/logout"
					/>
				</div>
			</div>
			{/* Vl Breaker */}
			<div className="w-[1px] h-screen absolute top-0 right-0 bg-[#ebf0f6]" />
		</div>
	);
};

export default TeamNavbar;
