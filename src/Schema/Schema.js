import { appendToPath, clone, superimpose } from 'object-agent';
import { PrivateVars } from 'type-enforcer-ui';
import findRule from './findRule';
import parseSchema from './parse/parseSchema';
import processValue from './processValue';

/**
 * Schema validation errors
 *
 * @typedef {Object} SchemaError
 *
 * @arg {String} error - A message about the type of error
 * @arg {String} path - The path within the given item to the value causing the error
 * @arg {*} value - The value at this path
 * @arg {*} item - The original item being validated
 */

/**
 * Schema type definitions. Can be just the type as defined below, or an array of types, or an object with the following options. Any extra options provided will be copied to the rule, which can be accessed via the schema.eachRule() method.
 *
 * '*' can be used as a key to indicate that any keys are allowed in an object.
 *
 * @example
 * ``` javascript
 * import { Schema } from 'hord';
 *
 * // Can be a native type or string
 * const person = new Schema({
 *  first: String,
 *  last: String,
 *  age: 'integer'
 * });
 *
 * // Or with options:
 * const person = new Schema({
 *  first: {
 *      type: String,
 *      isRequired: true
 *  },
 *  last: {
 *      type: String,
 *      isRequired: true
 *  },
 *  age: {
 *      type: 'integer'
 *      min: 0,
 *      coerce: true
 *  }
 * });
 * ```
 *
 * @typedef {*|Object} SchemaDefinition
 *
 * @arg {*|Array} type - Supported native types are Array, Boolean, Date, Element, Function, Number, Object, RegExp, String. Also supports '*', 'integer', 'float', Enum (from type-enforcer), custom constructors (classes or constructor functions), or instances of Schema or Model.
 * @arg {Boolean} [isRequired=false] - Empty arrays or objects that aren't required will be removed by schema.enforce().
 * @arg {Boolean} [default] - If isRequired is true, then schema.enforce() will set this value if the key is undefined.
 * @arg {Boolean} [coerce=false] - If true then values that can be coerced into the specified type will not return errors and will be coerced in schema.enforce().
 * @arg {Number} [min] - For Number, 'integer', and 'float'
 * @arg {Number} [max] - For Number, 'integer', and 'float'
 * @arg {Number} [minLength] - For Arrays and Strings
 * @arg {Number} [maxLength] - For Arrays and Strings
 * @arg {Boolean} [clamp=false] - Works with min, max, minength, and maxLength. If true then values outside the range will be forced within the range. If false then values outside the range will be deleted.
 * @arg {Enum} [enum] - If type is Enum, then this is required
 * @arg {Object|Array} [content] - For arrays and objects to specify further content
 * @arg {function} [enforce] - This is automatically included, but can be overridden. (See [type-enforcer enforce](https://github.com/DarrenPaulWright/type-enforcer/blob/HEAD/docs/enforce.md) for more info)
 * @arg {function} [check] - This is automatically included, but can be overridden. (See [type-enforcer checks](https://github.com/DarrenPaulWright/type-enforcer/blob/HEAD/docs/checks.md) for more info)
 */

const process = (item, rules, path, isEnforce, replace) => {
	const errors = [];

	if (rules !== undefined) {
		processValue(item, rules, path, (message, path, value) => {
			errors.push({
				error: message,
				path,
				value,
				item
			});
		}, isEnforce, replace);
	}

	return errors;
};

const eachRule = (self, callback, path = '', rule) => {
	rule = rule || _(self).rules;

	return rule.types[0].schema !== undefined ?
		!eachRule(rule.types[0].schema, callback, path) :
		callback(path, rule) ||
		rule.content !== undefined &&
		!rule.content.some((item) => eachRule(self, callback, appendToPath(path, item.key || 0), item));
};

const _ = new PrivateVars();

/**
 * Schema enforcement.
 *
 * @example
 * ``` javascript
 * import { Schema } from 'hord';
 *
 * const person = new Schema({
 *  first: String,
 *  last: String,
 *  age: 'integer',
 *  hobbies: {
 *      type: Array,
 *      content: String
 *  }
 * });
 *
 * person.validate({
 *  first: 'John',
 *  last: 'Doe',
 *  age: 21
 * });
 * // => []
 * ```
 *
 * @class Schema
 *
 * @arg {SchemaDefinition} schema
 */
export default class Schema {
	constructor(schema) {
		_.set(this, {
			definition: clone(schema),
			rules: parseSchema(schema)
		});
	}

	/**
	 * Validate an item against the schema
	 *
	 * @memberOf Schema
	 * @instance
	 *
	 * @arg {Object} item
	 * @arg {Array} [path=[]] - If provided then only the value at that path will be validated
	 *
	 * @returns {SchemaError[]}
	 */
	validate(item, path = '') {
		return process(item, findRule(path, _(this).rules), path, false);
	}

	/**
	 * Enforce an items structure against the schema. This function mutates the original item.
	 *
	 * @memberOf Schema
	 * @instance
	 *
	 * @arg {Object} item
	 * @arg {Array} [path=[]]
	 * @arg {*} [replace] - If the current value at path is invalid, replace it with this.
	 *
	 * @returns {SchemaError[]}
	 */
	enforce(item, path = '', replace) {
		return process(item, findRule(path, _(this).rules), path, true, replace);
	}

	/**
	 * Calls a callback for each rule that will be used to validate this schema.
	 *
	 * @memberOf Schema
	 * @instance
	 *
	 * @arg {Function} callback - Provides two args: the path and the rule. If true is returned then no more callbacks will happen further down this branch, but will continue up a level.
	 */
	eachRule(callback) {
		eachRule(this, callback);
	}

	/**
	 * Returns a new Schema with the rules from the provided schema [superimposed](https://github.com/DarrenPaulWright/object-agent/blob/master/docs/superimpose.md) on the rules from this schema. If no args are provided, then the returned Schema is effectively a clone of this one.
	 *
	 * @memberOf Schema
	 * @instance
	 *
	 * @arg {SchemaDefinition|Schema}
	 *
	 * @returns {Schema}
	 */
	extend(schema) {
		return new Schema(superimpose(_(this).definition, schema instanceof Schema ? _(schema).definition : schema));
	}
}
