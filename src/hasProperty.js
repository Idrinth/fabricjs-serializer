module.exports = (/* object */ object, /* string */ property) => {
  if (typeof property !== 'string') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(object, property);
};
