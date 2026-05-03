import { useEffect, useState } from "react";
import { AssetCategories } from "../../../../models/assetCategories.model";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalTextarea from "../TeamModalTextarea";

import toast from "react-hot-toast";
import ValidAsset from "../../../../validators/asset.validator";
import { reqCreateAsset } from "../../../../services/api/asset.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";
import { AssetInput } from "../../../../types";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreateAssetModal = (props: Props) => {
	const [asset, setAsset] = useState<Partial<AssetInput>>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = (modifier: Record<string, any>) => {
		setAsset((prev) => applyChange(prev, modifier) as Partial<AssetInput>);
	};

	const deleteChange = (key: string) => {
		setAsset((prev) => (removeChange(prev, key) ?? {}) as Partial<AssetInput>);
	};

	const runCreateAsset = async () => {
		if (saving) return;
		const validator = ValidAsset(asset);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await reqCreateAsset(validator.value);
		if (response.success) {
			toast.success("Asset Created");
			setSaving(false);
			saveDone();
		} else {
			toast.error(response.error_message);
		}
	};

	useEffect(() => {
		setAsset({
			category: AssetCategories[0].id,
		});
	}, []);

	useEffect(() => {
		const validator = ValidAsset(asset);
		if (validator.error) {
			setSaveActive(false);
		} else {
			setSaveActive(true);
		}
	}, [asset]);

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
				runCreateAsset();
				saveHit();
			}}
		>
			<div className="flex gap-4 justify-between">
				<TeamModalInput
					title="Name"
					placeholder="Enter an Asset Name..."
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
					title="Identifier"
					placeholder="Enter an Asset Identifier..."
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
			</div>
			<TeamModalSelect
				title="Category"
				values={AssetCategories}
				value={AssetCategories[0]}
				required
				setValue={(value) => {
					inputChange({ category: value.id });
				}}
			/>
			<TeamModalInput
				title="Image URL"
				placeholder="Enter the Asset Icon..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							image_url: value,
						});
					} else {
						deleteChange("image_url");
					}
				}}
			/>
			<TeamModalInput
				title="Manufacturer"
				placeholder="Enter the Asset Manufacturer..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							metadata: {
								...asset.metadata,
								manufacturer: value,
							},
						});
					} else {
						deleteChange("metadata.manufacturer");
					}
				}}
			/>
			<TeamModalInput
				title="Model"
				placeholder="Enter the Asset Model Number..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							metadata: {
								...asset.metadata,
								model: value,
							},
						});
					} else {
						deleteChange("metadata.model");
					}
				}}
			/>
			<TeamModalInput
				title="Serial Number"
				placeholder="Enter the Asset Serial Number..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							metadata: {
								...asset.metadata,
								serial_number: value,
							},
						});
					} else {
						deleteChange("metadata.serial_number");
					}
				}}
			/>
			<TeamModalTextarea
				title="Description"
				required
				placeholder="Enter a description of the asset... e.g. 'SD Card C'"
				value={""}
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							description: value,
						});
					} else {
						deleteChange("description");
					}
				}}
			/>
			<TeamModalTextarea
				title="Notes"
				placeholder="Enter any additional notes about the asset..."
				value={""}
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							metadata: {
								...asset.metadata,
								notes: value,
							},
						});
					} else {
						deleteChange("metadata.notes");
					}
				}}
			/>
		</TeamModal>
	);
};

export default CreateAssetModal;
