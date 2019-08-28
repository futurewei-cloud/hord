import { get } from 'object-agent';
import { isArray, isNumber } from 'type-enforcer';

const kindOf = (value) => {
	if (value === void 0) {
		return 3;
	}
	if (value === null) {
		return 2;
	}
	if (value !== value) {
		return 1;
	}
	if (isNumber(value)) {
		return -1;
	}
	return 0;
};

const compare = (a, b) => {
	const kindA = kindOf(a);
	const kindB = kindOf(b);

	if (kindA !== kindB || kindA > 0) {
		a = kindA;
		b = kindB;
	}

	return (a < b) ? -1 : (a > b ? 1 : 0);
};

/**
 * Returns a function that compares two values. If paths are provided, compares the values at that path on objects.
 *
 * Notes:
 * - Handles undefined, null, and NaN.
 * - Distinguishes numbers from strings.
 *
 * @example
 * ``` javascript
 * import { compare } from 'hord';
 *
 * compare('id')({id: 1}, {id: 2});
 * // => -1
 * ```
 *
 * @function compare
 *
 * @arg {Array|String} [paths] - The path or paths to compare. If multiple paths are provided, then the first key is compared first, if the values are equal then the second key is compared, and so on.
 *
 * @returns {function} Accepts two arguments to be compared. Returns -1, 0, or 1.
 */
export default (paths) => {
	if (paths) {
		if (isArray(paths)) {
			return (a, b) => {
				let output;

				paths.some((path) => output = compare(get(a, path), get(b, path)));

				return output;
			};
		}

		return (a, b) => compare(get(a, paths), get(b, paths));
	}

	return compare;
}
