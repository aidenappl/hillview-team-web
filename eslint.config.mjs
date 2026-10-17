import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat-config port of the old .eslintrc.json (Next 16 removed `next lint`).
// Same rule set as before: core-web-vitals plus the four rules below.
const eslintConfig = defineConfig([
	...nextVitals,
	{
		rules: {
			eqeqeq: ["error", "smart"],
			"no-console": ["warn", { allow: ["warn"] }],
			"prefer-const": "error",
			"@next/next/no-img-element": "off",
			// New in eslint-plugin-react-hooks v7 (bundled since Next 16): React
			// Compiler rules the old `next lint` never ran. They flag 38 existing
			// patterns (mostly setState in effects); kept off so the upgrade does not
			// change what lint enforces. Turn on when those components are refactored.
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/static-components": "off",
			"react-hooks/immutability": "off",
			"react-hooks/refs": "off",
		},
	},
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
