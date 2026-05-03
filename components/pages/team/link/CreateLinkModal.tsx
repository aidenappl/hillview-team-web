import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalTextarea from "../TeamModalTextarea";

import toast from "react-hot-toast";
import ValidLink from "../../../../validators/link.validator";
import { reqCreateLink } from "../../../../services/api/link.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";
import { LinkInput } from "../../../../types";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreateLinkModal = (props: Props) => {
	const [link, setLink] = useState<Partial<LinkInput>>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = (modifier: Record<string, any>) => {
		setLink((prev) => applyChange(prev, modifier) as Partial<LinkInput>);
	};

	const deleteChange = (key: string) => {
		setLink((prev) => (removeChange(prev, key) ?? {}) as Partial<LinkInput>);
	};

	const runCreateLink = async () => {
		if (saving) return;
		const validator = ValidLink(link);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await reqCreateLink(validator.value);
		if (response.success) {
			toast.success("Link Created");
			setSaving(false);
			saveDone();
		} else {
			toast.error(response.error_message);
		}
	};

	useEffect(() => {
		setLink({});
	}, []);

	useEffect(() => {
		const validator = ValidLink(link);
		if (validator.error) {
			setSaveActive(false);
		} else {
			setSaveActive(true);
		}
	}, [link]);

	return (
		<TeamModal
			className="gap-6"
			showDestructive={false}
			loader={saving}
			saveActive={saveActive}
			cancelHit={() => {
				cancelHit();
			}}
			saveHit={() => {
				runCreateLink();
				saveHit();
			}}
		>
			<TeamModalInput
				title="Route"
				placeholder="Enter the Route for the link... (e.g. /about)"
				value={link.route || ""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						value = value.replaceAll(" ", "-").replaceAll("/", "");
						inputChange({
							route: value,
						});
					} else {
						deleteChange("route");
					}
				}}
			/>
			<TeamModalInput
				title="Destination"
				placeholder="Enter the Destination for this link..."
				value={link.destination || ""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							destination: value,
						});
					} else {
						deleteChange("destination");
					}
				}}
			/>
		</TeamModal>
	);
};

export default CreateLinkModal;
