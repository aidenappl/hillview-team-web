import { useState } from "react";

interface Props {
	title?: string;
	runner?: string;
	value?: boolean;
	setValue?: (value: boolean) => void;
}

const TeamModalCheckbox = (props: Props) => {
	const { title, runner, value = false, setValue = () => {} } = props;

	const [internalValue, setInternalValue] = useState<boolean>(value);

	return (
		<div className="relative flex gap-x-3">
			<div className="flex h-6 items-center">
				<input
					id="comments"
					name="comments"
					type="checkbox"
					className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
					checked={internalValue}
					onChange={(e) => {
						setValue(e.target.checked);
						setInternalValue(e.target.checked);
					}}
				/>
			</div>
			<div className="text-sm leading-6">
				<label
					htmlFor="comments"
					className="font-medium text-gray-900 cursor-pointer"
				>
					{title}
				</label>
				<p className="text-gray-500">{runner}</p>
			</div>
		</div>
	);
};

export default TeamModalCheckbox;
