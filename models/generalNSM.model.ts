export interface GeneralNSM {
	id: number;
	name: string;
	short_name: string;
	hidden?: boolean;
}

export const GenerateGeneralNSM = (
	names: string[] | any[] | null
): GeneralNSM[] => {
	// check if names is null
	if (names === undefined || names === null) {
		return [];
	}
	// check if names is an array of strings
	if (typeof names[0] === "string") {
		// if it is, return the array of objects
		return names.map((name, index) => {
			return {
				id: index,
				name: name,
				short_name: name.toLocaleLowerCase().replace(" ", "_"),
			};
		});
	} else {
		// if it isn't, return the array of objects
		return names.map((name) => {
			const label = name.name || name.title;
			return {
				id: name.id,
				name: label,
				short_name:
					name.short_name || label.toLocaleLowerCase().replace(" ", "_"),
			};
		});
	}
};
