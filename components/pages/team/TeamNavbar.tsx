import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowRightToBracket,
	faBoxArchive,
	faSquareCheck,
	faFilm,
	faLink,
	faTag,
	faUserGroup,
	faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { NextRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user/slice";
import { User } from "../../../types";

interface Props {
	router: NextRouter;
}

const TeamNavbar = ({ router }: Props) => {
	const user: User | null = useSelector(selectUser);
	const pathname = router.pathname;

	const NavItem = ({
		icon,
		label,
		href,
		active,
	}: {
		icon: IconProp;
		label: string;
		href: string;
		active: boolean;
	}) => (
		<Link href={href}>
			<div
				className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer group ${
					active
						? "bg-blue-50 text-blue-600"
						: "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
				}`}
			>
				<FontAwesomeIcon icon={icon} fixedWidth className="w-[15px] h-[15px] flex-shrink-0" />
				<span className="hidden md:block font-medium text-sm leading-none">
					{label}
				</span>
				{/* Tooltip — visible only when sidebar is collapsed (< md) */}
				<span className="md:hidden absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-slate-800 text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
					{label}
				</span>
			</div>
		</Link>
	);

	const SectionLabel = ({ label }: { label: string }) => (
		<p className="hidden md:block text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
			{label}
		</p>
	);

	return (
		<aside className="w-[60px] md:w-[220px] h-full flex-shrink-0 flex flex-col border-r border-slate-100 py-5 px-2 md:px-3">
			{/* Logo */}
			<div className="flex items-center gap-3 px-2 mb-7">
				<div className="w-8 h-8 rounded-xl bg-blue-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
					<Image
						src="/logos/hillviewTVSun.png"
						alt="Hillview TV"
						width={22}
						height={22}
						className="object-contain"
					/>
				</div>
				<span className="hidden md:block font-semibold text-sm text-slate-800 tracking-tight">
					Hillview TV
				</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 flex flex-col gap-5 overflow-y-auto">
				<div className="flex flex-col gap-0.5">
					<SectionLabel label="System" />
					{user?.authentication.short_name === "admin" && (
						<>
							<NavItem
								icon={faTag}
								label="Assets"
								href="/team/dashboard/assets"
								active={pathname === "/team/dashboard/assets"}
							/>
							<NavItem
								icon={faSquareCheck}
								label="Checkouts"
								href="/team/dashboard/checkouts"
								active={pathname === "/team/dashboard/checkouts"}
							/>
							<NavItem
								icon={faFilm}
								label="Videos"
								href="/team/dashboard/videos"
								active={pathname === "/team/dashboard/videos"}
							/>
							<NavItem
								icon={faBoxArchive}
								label="Playlists"
								href="/team/dashboard/playlists"
								active={pathname === "/team/dashboard/playlists"}
							/>
						</>
					)}
					{user?.authentication.short_name === "student" && (
						<>
							<NavItem
								icon={faFilm}
								label="Videos"
								href="/student/dashboard/videos"
								active={pathname === "/student/dashboard/videos"}
							/>
							<NavItem
								icon={faBoxArchive}
								label="Playlists"
								href="/student/dashboard/playlists"
								active={pathname === "/student/dashboard/playlists"}
							/>
						</>
					)}
				</div>

				{user?.authentication.short_name === "admin" && (
					<div className="flex flex-col gap-0.5">
						<SectionLabel label="Manage" />
						<NavItem
							icon={faLink}
							label="Links"
							href="/team/dashboard/links"
							active={pathname === "/team/dashboard/links"}
						/>
						<NavItem
							icon={faUserGroup}
							label="Users"
							href="/team/dashboard/users"
							active={pathname === "/team/dashboard/users"}
						/>
						<NavItem
							icon={faWrench}
							label="Tools"
							href="/team/r/tools"
							active={pathname === "/team/r/tools"}
						/>
					</div>
				)}
			</nav>

			{/* Bottom: user info + logout */}
			<div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-0.5">
				{user && (
					<div className="flex items-center gap-3 px-3 py-2 mb-1">
						<div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
							{user.profile_image_url && (
								<Image
									src={user.profile_image_url}
									alt={user.name}
									width={24}
									height={24}
									className="w-full h-full object-cover"
								/>
							)}
						</div>
						<span className="hidden md:block text-xs font-medium text-slate-600 truncate">
							{user.name}
						</span>
					</div>
				)}
				<NavItem
					icon={faArrowRightToBracket}
					label="Logout"
					href="/logout"
					active={false}
				/>
			</div>
		</aside>
	);
};

export default TeamNavbar;
