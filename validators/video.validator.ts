import Joi from "joi";

const pattern = "^https://content.hillview.tv/";

const ValidVideo = (asset: any) => {
	const schema = Joi.object({
		name: Joi.string().required(),
	});

	return schema.validate(asset);
};

export default ValidVideo;
