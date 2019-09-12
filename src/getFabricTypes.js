const fabric = require('./fabric');
const Type = require('./Type');
const hasProperty = require('./hasProperty');

const isFabricClass = (/* string */ property) => {
  if (! property.match(/^[A-Z]/u)) {
    return false;
  }
  if (typeof fabric[property] !== 'function') {
    return false;
  }
  if (! hasProperty(fabric[property].prototype, 'type')) {
    return false;
  }
  return typeof fabric[property].prototype.type === 'string';
};

module.exports = () => {
  const types = {
    radial: new Type(fabric.Gradient, []),
  };
  for (const property of Object.keys(fabric)) {
    if (isFabricClass(property)) {
      types[fabric[property].prototype.type] = new Type(fabric[property], []);
    }
  }
  return types;
};
