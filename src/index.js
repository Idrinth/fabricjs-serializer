const fabric = require('./fabric');
const SORT = require('./SORT');
const Type = require('./Type');
const hasProperty = require('./hasProperty');
const getFabricTypes = require('./getFabricTypes');

module.exports = class FabricJsSerializer {
  constructor(/* fabric.Canvas */ canvas) {
    this._canvas = canvas;
    this._types = getFabricTypes();
  }

  register(
    /* string */ type,
    /* Function */ factory,
    /* string[] */...dependencies
  ) {
    this._types[type] = new Type(factory, dependencies || []);
  }

  fromJson(/* string */ json) {
    const data = JSON.parse(json);
    const drawOnChange = this._canvas.renderOnAddRemove;
    this._canvas.renderOnAddRemove = false;
    for (const el of this._canvas._objects) {
      this._canvas.remove(el);
    }
    const types = this._types;
    data.objects.sort((/* fabric.Object */ a, /* fabric.Object */ b) => {
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
    for (const el of data.objects) {
      this._canvas.add(this._types[el.type].factory(el));
    }
    this._canvas.renderOnAddRemove = drawOnChange;
    this._canvas.renderAll();
  }

  toJson() {
    const types = this._types;
    return JSON.stringify({
      version: fabric.version,
      objects: this._canvas._objects.map(object => {
        const data = object.toObject();
        if (! data.type || ! hasProperty(types, data.type)) {
          throw new Error(
            `Can't find a definition for given type ${ data.type }`
          );
        }
        const result = {};
        for (const property of Object.keys(data)) {
          if (types[data.type].isSaveworthy(property, data[property])) {
            result[property] = data[property];
          }
        }
        return result;
      }),
    });
  }
};
