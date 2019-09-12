const FORCE_SAVE_PROPERTIES = require('./FORCE_SAVE_PROPERTIES');
const hasProperty = require('./hasProperty');

module.exports = class Type {
  constructor(/* Function */ factory, /* string[] */ dependencies) {
    if (typeof factory !== 'function') {
      throw new Error('The factory has to be a function.');
    }
    if (! Array.isArray(dependencies)) {
      throw new Error('The dependencies have to be an array.');
    }
    this._factory = factory;
    this._dependencies = dependencies;
  }

  isDependant(/* string */ type) {
    return this._dependencies.includes(type);
  }

  isSaveworthy(/* string */ property, value) {
    const isEmptyArray = (list) => Array.isArray(list) && ! list.length;
    const isEqual = (a, b) => {
      if (a === b) {
        return true;
      }
      return isEmptyArray(a) && isEmptyArray(b);
    };
    if (FORCE_SAVE_PROPERTIES.includes(property)) {
      return true;
    }
    if (! hasProperty(this._factory, property)) {
      return true;
    }
    return ! isEqual(value, this._factory[property]);
  }
};
