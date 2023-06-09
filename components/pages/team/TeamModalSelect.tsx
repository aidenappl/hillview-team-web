import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

interface Select {
	hidden?: boolean;
	id: number;
	name: string;
}

interface Props {
	title?: string;
	values: Select[];
	required?: boolean;
	value: Select;
	setValue: (value: Select) => void;
}

function classNames(...classes: any) {
	return classes.filter(Boolean).join(" ");
}

const TeamModalSelect = (props: Props) => {
	const { values } = props;

	const [selected, setSelected] = useState<Select>(props.value);

	return (
		<Listbox
			value={selected}
			onChange={(e) => {
				setSelected(e);
				props.setValue(e);
			}}
		>
			{({ open }) => (
				<div className="flex flex-col">
					{props.title ? (
						<label className="font-medium text-[#101827] flex gap-1">
							{props.title}
							{props.required ? (
								<p className="text-red-700">*</p>
							) : null}
						</label>
					) : null}
					<div className={"relative " + (props.title ? "mt-2" : "")}>
						<Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-1 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6">
							<span className="flex items-center">
								<span className="ml-3 block truncate">
									{selected.name}
								</span>
							</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
								<ChevronDownIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								{values.map((value) =>
									value.hidden ? null : (
										<Listbox.Option
											key={value.id}
											className={({ active }) =>
												classNames(
													active
														? "bg-blue-600 text-white"
														: "text-gray-900",
													"relative cursor-default select-none py-2 pl-3 pr-9"
												)
											}
											value={value}
										>
											{({ selected, active }) => (
												<>
													<div className="flex items-center">
														<span
															className={classNames(
																selected
																	? "font-semibold"
																	: "font-normal",
																"ml-3 block truncate"
															)}
														>
															{value.name}
														</span>
													</div>

													{selected ? (
														<span
															className={classNames(
																active
																	? "text-white"
																	: "text-blue-600",
																"absolute inset-y-0 right-0 flex items-center pr-4"
															)}
														>
															<CheckIcon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									)
								)}
							</Listbox.Options>
						</Transition>
					</div>
				</div>
			)}
		</Listbox>
	);
};

export default TeamModalSelect;
