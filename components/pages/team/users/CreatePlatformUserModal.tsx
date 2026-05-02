import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";

import toast from "react-hot-toast";
import ValidMobileUser from "../../../../validators/mobileUser.validator";
import { CreateMobileUser } from "../../../../hooks/CreateMobileUser";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreatePlatformUserModal = (props: Props) => {
	const [user, setUser] = useState<any>({});
	const [saving, setSaving] = useState<boolean>(false);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = (modifier: Record<string, any>) => {
		setUser((prev: any) => applyChange(prev, modifier));
	};

	const deleteChange = (key: string) => {
		setUser((prev: any) => removeChange(prev, key) ?? {});
	};

	const runCreateUser = async () => {
		if (saving) return;
		let validator = ValidMobileUser(user);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await CreateMobileUser(validator.value);
		if (response.success) {
			toast.success("User Created");
			setSaving(false);
			saveDone();
		} else {
			console.error(response);
			setSaving(false);
			toast.error(response.error_message);
		}
	};

	useEffect(() => {
		inputChange({
			profile_image_url:
				"https://content.hillview.tv/images/mobile/default.jpg",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<TeamModal
			className="gap-6"
			showDestructive={false}
			loader={saving}
			saveActive={ValidMobileUser(user).error ? false : true}
			cancelHit={() => {
				cancelHit();
			}}
			saveHit={() => {
				runCreateUser();
				saveHit();
			}}
		>
			<TeamModalInput
				title="Name"
				placeholder="Enter an User Name..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({ name: value });
					} else {
						deleteChange("name");
					}
				}}
			/>
			<TeamModalInput
				title="Email"
				placeholder="Enter an Email..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({ email: value });
					} else {
						deleteChange("email");
					}
				}}
			/>
			<TeamModalInput
				title="Student ID"
				placeholder="Enter a Student ID..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({ identifier: value });
					} else {
						deleteChange("identifier");
					}
				}}
			/>
			<TeamModalInput
				title="Profile Image URL"
				placeholder="Enter a Profile Image URL..."
				value={user?.profile_image_url || ""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({ profile_image_url: value });
					} else {
						deleteChange("profile_image_url");
					}
				}}
			/>
		</TeamModal>
	);
};

export default CreatePlatformUserModal;
