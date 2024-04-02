import Joi from "joi";

const ValidVideo = (asset: any) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		url: Joi.string().required(),
		thumbnail: Joi.string().required(),
		description: Joi.string().required(),
		download_url: Joi.string().optional(),
	});

	return schema.validate(asset);
};

export default ValidVideo;
