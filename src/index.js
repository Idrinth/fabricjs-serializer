const fabric = require('./fabric');
const Type = require('./Type');
const hasProperty = require('./hasProperty');
const getFabricTypes = require('./getFabricTypes');
const sortByTypes = require('./sortByTypes');

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
    this._canvas._objects = [];
    const positions = {};
    for (let pos = 0; pos < data.objects.length; pos ++) {
      const id = data.objects[pos].type+pos;
      data.objects[pos]._internalSortId = id;
      positions[id] = pos;
    }
    sortByTypes(this._types, data.objects);
    const ordered = new Array(data.objects.length).fill(null);
    for (const el of data.objects) {
      const object = this._types[el.type].factory(el);
      this._canvas.add(object);
      ordered[positions[el._internalSortId]] = object;
    }
    this._canvas._objects = ordered;
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
