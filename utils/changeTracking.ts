/**
 * Removes a (possibly nested) key from a changes object.
 * Returns the new object, or null if all keys were removed.
 */
export function removeChange(changes: Record<string, any> | null, key: string): Record<string, any> | null {
	if (!changes) return null;
	const obj = { ...changes };
	if (key in obj) {
		delete obj[key];
		return Object.keys(obj).length > 0 ? obj : null;
	}
	const [head, ...rest] = key.split(".");
	if (typeof obj[head] === "object" && obj[head] !== null && rest.length > 0) {
		const nested = removeChange(obj[head], rest.join("."));
		if (nested) {
			obj[head] = nested;
		} else {
			delete obj[head];
		}
		return Object.keys(obj).length > 0 ? obj : null;
	}
	return obj;
}

/**
 * Merges a modifier into the existing changes object.
 */
export function applyChange(changes: Record<string, any> | null, modifier: Record<string, any>): Record<string, any> {
	return { ...(changes ?? {}), ...modifier };
}
