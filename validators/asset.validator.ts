import Joi from "joi";

const MetadataSchema = Joi.object({
	serial_number: Joi.string().required(),
	manufacturer: Joi.string().required(),
	model: Joi.string().required(),
	notes: Joi.string().optional(),
});

const pattern = "^https://content.hillview.tv/thumbnails/";

const ValidAsset = (asset: any) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		identifier: Joi.string().required(),
		description: Joi.string().required(),
		category: Joi.number().required(),
		image_url: Joi.string()
			.uri({
				scheme: ["https"],
			})
			.regex(new RegExp(pattern))
			.required()
			.messages({
				"string.pattern.base":
					"Image URL must be a valid Hillview Thumbnails CDN URL",
			}),
		metadata: MetadataSchema.required(),
	});

	return schema.validate(asset);
};

export default ValidAsset;
