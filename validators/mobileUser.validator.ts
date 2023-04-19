import Joi from "joi";

const pattern = "^https://content.hillview.tv/";

const ValidMobileUser = (asset: any, optional?: boolean) => {
	let schema: Joi.ObjectSchema<any>;
	if (optional) {
		schema = Joi.object({
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.optional(),
			name: Joi.string().optional(),
			profile_image_url: Joi.string()
				.optional()
				.pattern(new RegExp(pattern)),
			identifier: Joi.string().optional(),
		});
	} else {
		schema = Joi.object({
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.required(),
			name: Joi.string().required(),
			profile_image_url: Joi.string()
				.required()
				.pattern(new RegExp(pattern)),
			identifier: Joi.string().required(),
		});
	}

	return schema.validate(asset);
};

export default ValidMobileUser;
