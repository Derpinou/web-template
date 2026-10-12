// Style rules shared by all my projects.
export default {
	'semi': ['error', 'always'], // ;
	'quotes': ['error', 'single', { avoidEscape: true }], // '
	'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore unused vars starting with '_'
	'eqeqeq': ['error', 'always'], // == -> ===
	'indent': ['error', 'tab'], // Force tab for tabs
	'comma-dangle': ['error', 'never'], // No ',' on the last element of array/json
	'no-trailing-spaces': 'error', // In the name
	'keyword-spacing': 'error', // eg: "if()" -> "if ()"
	'space-before-blocks': 'error', // eg: "if (){}" -> "if () {}"
	'object-curly-spacing': ['error', 'always'], // eg: const obj = {a: 1}; -> const obj = { a: 1 };
	'arrow-spacing': 'error', // "(a)=>" -> "(a) =>"
	'no-multiple-empty-lines': ['error', { max: 1 }],
	'space-infix-ops': 'error', // "1+2" -> "1+2"
	'key-spacing': 'error', // Space after ":"
	'comma-spacing': 'error', // Space after ","
	'array-bracket-spacing': ['error', 'never'],
	'no-var': 'error',
	'prefer-const': 'error'
};
