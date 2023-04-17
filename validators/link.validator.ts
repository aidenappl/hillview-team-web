import Joi from "joi";

const ValidLink = (link: any) => {
	const schema = Joi.object({
		route: Joi.string().required(),
		destination: Joi.string().uri().required(),
	});

	return schema.validate(link);
};

export default ValidLink;
