const SORT = require('./SORT');
const hasProperty = require('./hasProperty');

module.exports = (
  /* {[string]:Type} */ types,
  /* fabric.Object[] */ objects
) => {
  objects.sort((/* fabric.Object */ a, /* fabric.Object */ b) => {
    if (! hasProperty(types, a.type)) {
      throw new Error(`Can't find a definition for given type ${ a.type }`);
    }
    if (! hasProperty(types, b.type)) {
      throw new Error(`Can't find a definition for given type ${ b.type }`);
    }
    if (types[a.type].isDependant(b.type)) {
      return SORT.AFTER;
    }
    return types[b.type].isDependant(a.type) ? SORT.BEFORE : SORT.SAME;
  });
};
