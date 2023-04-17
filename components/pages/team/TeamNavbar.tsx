import { IconProp, SizeProp, icon } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowRightToBracket,
	faBoxArchive,
	faCheckSquare,
	faFilm,
	faLink,
	faSquareChevronDown,
	faTag,
	faUserGroup,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { NextRouter } from "next/router";

interface Props {
	router: NextRouter;
}

const TeamNavbar = (props: Props) => {
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
				<div className="flex items-center w-full h-[55px] relative hover:bg-[#f7f9ff] pl-[15px] left-[-15px] rounded-2xl cursor-pointer group">
					<div
						className={
							"flex items-center justify-center " +
							props.iconClassName
						}
					>
						<FontAwesomeIcon
							icon={props.icon}
							fixedWidth
							className={
								props.selected
									? "text-[#3067f6]"
									: "text-[#6b76ab]"
							}
							size={iconSize}
						/>
					</div>
					<p
						className={
							"font-medium pl-4 text-base " +
							(props.selected
								? "text-[#3067f6]"
								: "text-[#6b76ab]")
						}
					>
						{props.text}
					</p>
					<div
						className={
							"h-full bg-blue-600 rounded-s-md transition-all right-[-55px] absolute top-0 " +
							(props.selected ? "w-[9px]" : "w-0")
						}
					/>
				</div>
			</Link>
		);
	};

	let pathname = props.router.pathname;

	return (
		<div className="w-[250px] lg:w-[290px] xl:w-[325px] 2xl:w-[350px] h-ful p-[40px] relative flex flex-col gap-12">
			{/* Logo */}
			<div className="w-[60px] h-[60px] bg-blue-600 rounded-xl bg-[length:40px] bg-center bg-no-repeat bg-[url('/logos/hillviewTVSun.png')]" />
			{/* Navigation */}
			<div className="flex flex-col gap-8">
				<div>
					<h4 className="text-[#9fa9d3] tracking-tight text-base pb-3">
						SYSTEM
					</h4>
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
				</div>
				<div>
					<h4 className="text-[#9fa9d3] tracking-tight text-base pb-3">
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
			</div>
			<div className="absolute bottom-[40px] w-[calc(100%-80px)]">
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
