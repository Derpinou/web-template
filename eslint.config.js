import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import styleRules from './eslint.rules.js';

const aliases = { 'no-unused-vars': '@typescript-eslint/no-unused-vars' };
const rules = {};
for (const [name, options] of Object.entries(styleRules)) {
	const alias = aliases[name] ?? (name in stylistic.rules ? `@stylistic/${name}` : name);
	if (alias !== name) {
		rules[name] = 'off';
	}
	rules[alias] = options;
}

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{js,ts}'],
		extends: [js.configs.recommended, tseslint.configs.recommended],
		plugins: { '@stylistic': stylistic },
		rules
	},
	{
		files: ['src/**/*.{js,ts}'],
		languageOptions: { globals: globals.browser }
	},
	{
		files: ['*.{js,ts}'],
		languageOptions: { globals: globals.node }
	}
]);
