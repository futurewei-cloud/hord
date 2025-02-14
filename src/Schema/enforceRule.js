import { clone, isEmpty, set, unset } from 'object-agent';
import { enforceEnum, enforceInstanceOf } from 'type-enforcer-ui';

const EMPTY_TYPES = [Array, Object, 'Schema'];

const enforceLength = (type, prop, value, item, path, fixString) => {
	if (type.clamp === true) {
		if (type.type === Array) {
			value.length = type[prop];
		}
		else {
			set(item, path, fixString(value, type[prop]));
		}
	}
	else {
		unset(item, path);
	}
};

export default (rule, item, path, value, replace) => {
	const defaultValue = (rule.default !== undefined) ?
		rule.default :
		rule.isRequired ?
			replace || null :
			undefined;
	let newValue = value;

	rule.types.some((type) => {
		if (type.schema !== undefined) {
			newValue = type.enforce(clone(value), type.schema);

			if (isEmpty(newValue)) {
				newValue = rule.isRequired ? defaultValue : undefined;
			}
		}
		else if (type.enforce === enforceEnum || type.enforce === enforceInstanceOf) {
			newValue = type.enforce(value, type.enum || type.type, defaultValue, type.coerce);
		}
		else {
			newValue = type.enforce(value, defaultValue, type.coerce);
		}

		if (type.numericRange) {
			newValue = type.numericRange(type, value, defaultValue);
		}

		if (type.minLength !== undefined && value.length < type.minLength) {
			enforceLength(type, 'minLength', value, item, path, (value, length) => value.padEnd(length));
		}
		if (type.maxLength !== undefined && value.length > type.maxLength) {
			enforceLength(type, 'maxLength', value, item, path, (value, length) => value.slice(0, length));
		}

		return newValue !== null && newValue !== undefined;
	});

	if (rule.isRequired !== true && (newValue === undefined || (EMPTY_TYPES.includes(rule.types[0].type) && isEmpty(value)))) {
		unset(item, path);
		return true;
	}
	else if (newValue !== value) {
		set(item, path, newValue);
		return true;
	}

	return false;
};
