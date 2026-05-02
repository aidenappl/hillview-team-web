import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalTextarea from "../TeamModalTextarea";

import toast from "react-hot-toast";
import ValidLink from "../../../../validators/link.validator";
import { CreateLink } from "../../../../hooks/CreateLink";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreateLinkModal = (props: Props) => {
	const [link, setLink] = useState<any>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = (modifier: Record<string, any>) => {
		setLink((prev: any) => applyChange(prev, modifier));
	};

	const deleteChange = (key: string) => {
		setLink((prev: any) => removeChange(prev, key) ?? {});
	};

	const runCreateLink = async () => {
		if (saving) return;
		let validator = ValidLink(link);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await CreateLink(validator.value);
		if (response.success) {
			toast.success("Link Created");
			setSaving(false);
			saveDone();
		} else {
			console.error(response);
			toast.error(response.error_message);
		}
	};

	useEffect(() => {
		setLink({});
	}, []);

	useEffect(() => {
		let validator = ValidLink(link);
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
				value={link.destination}
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
