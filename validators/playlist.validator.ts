import Joi from "joi";

const pattern = "^https://content.hillview.tv/";

const ValidPlaylist = (asset: any) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		route: Joi.string().required(),
		description: Joi.string().required(),
		videos: Joi.array().items(Joi.number()).required(),
		banner_image: Joi.string()
			.uri({
				scheme: ["https"],
			})
			.regex(new RegExp(pattern))
			.required()
			.messages({
				"string.pattern.base":
					"Image URL must be a valid Hillview CDN URL",
			}),
	});

	return schema.validate(asset);
};

export default ValidPlaylist;
