import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { GeneralNSM } from "../../../models/generalNSM.model";
import Spinner from "../../general/Spinner";

interface Props {
	placeholder?: string;
	title?: string;
	subTitle?: string;
	required?: boolean;

	dropdown?: GeneralNSM[];
	dropdownClick?: (item: GeneralNSM) => void;
	loading?: boolean;

	value: string;
	setValue?: (value: string) => void;

	setDelayedValue?: (value: string) => void;
	delay?: number;

	showActionButton?: boolean;
	actionButtonText?: string;
	actionButtonLoading?: boolean;
	actionButtonDisabled?: boolean;
	disabled?: boolean;
	actionButtonClick?: () => void;

	className?: string;
}

const TeamModalInput = (props: Props) => {
	const {
		setValue = () => {},
		setDelayedValue = () => {},
		delay = 500,
		dropdownClick = () => {},
		showActionButton = false,
		actionButtonLoading = false,
		actionButtonDisabled = false,
		actionButtonText = "Untitled",
		disabled = false,
		loading = false,
		className = "",
		actionButtonClick = () => {},
	} = props;

	const [internalValue, setInternalValue] = useState(props.value || "");
	const [mounted, setMounted] = useState(false);
	const inputRowRef = useRef<HTMLDivElement>(null);
	const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);

	useEffect(() => { setMounted(true); }, []);

	// Keep a stable ref to the latest callback so the debounce effect never
	// needs to list it as a dependency — prevents re-triggering on every
	// parent re-render (e.g. when searchLoading state changes).
	const setDelayedValueRef = useRef(setDelayedValue);
	useEffect(() => {
		setDelayedValueRef.current = setDelayedValue;
	});

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			setDelayedValueRef.current(internalValue);
		}, delay);

		return () => clearTimeout(delayDebounceFn);
	}, [internalValue, delay]);

	useEffect(() => {
		setInternalValue(props.value || "");
	}, [props.value]);

	const showDropdown = loading || (props.dropdown && props.dropdown.length > 0);

	// Track input row position so the portal dropdown stays anchored
	useEffect(() => {
		if (!showDropdown) {
			setDropdownCoords(null);
			return;
		}

		const update = () => {
			const rect = inputRowRef.current?.getBoundingClientRect();
			if (rect) setDropdownCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
		};

		update();
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update, true);
			window.removeEventListener("resize", update);
		};
	}, [showDropdown]);

	const dropdownPortal =
		showDropdown && mounted && dropdownCoords
			? createPortal(
					<div
						style={{
							position: "fixed",
							top: dropdownCoords.top,
							left: dropdownCoords.left,
							width: dropdownCoords.width,
							zIndex: 9999,
						}}
						className="bg-white rounded-xl overflow-hidden shadow-xl border border-slate-100"
					>
						<div className="max-h-64 w-full overflow-auto bg-white">
							{loading && (!props.dropdown || props.dropdown.length === 0) ? (
								<div className="flex items-center gap-2.5 px-3.5 py-3 text-sm text-slate-400">
									<Spinner size={14} />
									<span>Searching…</span>
								</div>
							) : (
								props.dropdown?.map((item, index) => (
									<div
										onClick={() => {
											setInternalValue("");
											setValue("");
											dropdownClick(item);
										}}
										key={index}
										className="flex items-center gap-3 w-full cursor-pointer px-3.5 py-2.5 hover:bg-slate-50 transition-colors select-none"
									>
										{item.thumbnail ? (
											<div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200">
												<Image
													src={item.thumbnail}
													alt=""
													fill
													sizes="56px"
													style={{ objectFit: "cover" }}
												/>
											</div>
										) : null}
										<span className="truncate text-sm font-medium text-slate-800">
											{item.name}
										</span>
									</div>
								))
							)}
						</div>
					</div>,
					document.body
			  )
			: null;

	return (
		<div className={`flex flex-col gap-1 w-full ${className}`}>
			<label className="font-medium text-[#101827] flex gap-1">
				{props.title}
				{props.required ? <p className="text-red-700">*</p> : null}
			</label>
			{props.subTitle ? (
				<p className="text-xs text-[#737984]">{props.subTitle}</p>
			) : null}
			<div ref={inputRowRef} className="flex gap-3">
				<div className="relative flex-1">
					<input
						type="text"
						disabled={disabled}
						placeholder={props.placeholder}
						value={internalValue}
						onChange={(e) => {
							setInternalValue(e.target.value);
							setValue(e.target.value);
						}}
						className="shadow-sm w-full h-[40px] border rounded-md px-4 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
					/>
					{loading && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
							<Spinner size={14} />
						</div>
					)}
				</div>
				{showActionButton ? (
					<button
						className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
						onClick={!actionButtonDisabled ? actionButtonClick : () => {}}
					>
						{actionButtonLoading ? <Spinner style="light" size={14} /> : actionButtonText}
					</button>
				) : null}
			</div>
			{dropdownPortal}
		</div>
	);
};

export default TeamModalInput;
