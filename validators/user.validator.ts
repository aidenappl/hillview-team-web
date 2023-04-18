import Joi from "joi";

const pattern = "^https://content.hillview.tv/";

const ValidUser = (asset: any, optional?: boolean) => {
	let schema: Joi.ObjectSchema<any>;
	if (optional) {
		schema = Joi.object({
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.optional(),
			username: Joi.string().optional(),
			name: Joi.string().optional(),
			profile_image_url: Joi.string()
				.optional()
				.pattern(new RegExp(pattern)),
			authentication: Joi.number().optional(),
		});
	} else {
		schema = Joi.object({
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.required(),
			username: Joi.string().required(),
			name: Joi.string().required(),
			profile_image_url: Joi.string()
				.required()
				.pattern(new RegExp(pattern)),
			authentication: Joi.number().optional(),
		});
	}

	return schema.validate(asset);
};

export default ValidUser;
