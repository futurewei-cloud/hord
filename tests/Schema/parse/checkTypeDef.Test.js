import { assert } from 'chai';
import checkSchemaType from '../../../src/Schema/parse/checkTypeDef';
import { multiTest } from '../../TestUtil';
import { schemaTestTypes } from '../../testValues';

describe('checkSchemaType', () => {
	const falseValues = [undefined, 'test', true, false, [], {}, 3, /g/];

	it('should return true for null', () => {
		assert.isTrue(checkSchemaType(null, false));
	});

	multiTest({
		values: schemaTestTypes,
		message(input) {
			return `should return true for ${input.name || input}`;
		},
		test(type) {
			return checkSchemaType(type, false);
		},
		inputKey: 'value',
		assertion: 'isTrue'
	});

	multiTest({
		values: falseValues,
		message(input) {
			return `should return false for ${input}`;
		},
		test(type) {
			return checkSchemaType(type, false);
		},
		assertion: 'isFalse'
	});

	it('should return true for null in an array', () => {
		assert.isTrue(checkSchemaType([null], false));
	});

	multiTest({
		values: schemaTestTypes,
		message(input) {
			return `should return true for ${input.name || input} in an array`;
		},
		test(type) {
			return checkSchemaType([type], false);
		},
		inputKey: 'value',
		assertion: 'isTrue'
	});

	multiTest({
		values: falseValues,
		message(input) {
			return `should return false for ${input} in an array`;
		},
		test(type) {
			return checkSchemaType([type], false);
		},
		assertion: 'isFalse'
	});

	it('should return true for multiple types and null in an array', () => {
		assert.isTrue(checkSchemaType([String, Boolean, null], false));
	});

	it('should return false for multiple types and a non-type in an array', () => {
		assert.isFalse(checkSchemaType([String, 3, null], false));
	});

	it('should return true for null in an object with key "type"', () => {
		assert.isTrue(checkSchemaType({
			type: null
		}, true));
	});

	multiTest({
		values: schemaTestTypes,
		message(input) {
			return `should return true for ${input.name || input} in an object with key "type"`;
		},
		test(type) {
			return checkSchemaType({
				type
			}, true);
		},
		inputKey: 'value',
		assertion: 'isTrue'
	});

	multiTest({
		values: falseValues,
		message(input) {
			return `should return false for ${input} in an object with key "type"`;
		},
		test(type) {
			return checkSchemaType({
				type
			}, true);
		},
		assertion: 'isFalse'
	});

	it('should return true for multiple types and null in an array in an object with key "type"', () => {
		assert.isTrue(checkSchemaType({
			type: [String, Boolean, null]
		}, true));
	});

	it('should return false for multiple types and a non-type in an array in an object with key "type"', () => {
		assert.isFalse(checkSchemaType({
			type: [String, 3, null]
		}, true));
	});

	it('should return true for null in an array in an object with key "type"', () => {
		assert.isTrue(checkSchemaType({
			type: [null]
		}, true));
	});

	multiTest({
		values: schemaTestTypes,
		message(input) {
			return `should return true for ${input.name || input} in an array in an object with key "type"`;
		},
		test(type) {
			return checkSchemaType({
				type: [type]
			}, true);
		},
		inputKey: 'value',
		assertion: 'isTrue'
	});

	multiTest({
		values: falseValues,
		message(input) {
			return `should return false for ${input} in an array in an object with key "type"`;
		},
		test(type) {
			return checkSchemaType({
				type: [type]
			}, true);
		},
		assertion: 'isFalse'
	});

	it('should return true for multiple types and null in an array in an object with key "type"', () => {
		assert.isTrue(checkSchemaType({
			type: [String, Boolean, null]
		}, true));
	});

	it('should return true for an object with key "enforce" that is assigned a value that is a function', () => {
		assert.isTrue(checkSchemaType({
			enforce() {
			}
		}, true));
	});

	it('should return false if nothing is provided', () => {
		assert.isFalse(checkSchemaType());
	});
});
