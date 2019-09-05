/* global fabric */
// eslint-disable-next-line no-unused-vars
const FabricJsSerializer = (() => {
  const SORT = {
    BEFORE: 1,
    AFTER: - 1,
    SAME: 0,
  };
  const FORCE_SAVE_PROPERTIES = [
    'left',
    'top',
    'type',
  ];
  const hasProperty = (/* object */ object, /* string */ property) => {
    if (typeof property === 'string') {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  class Type {
    constructor(/* Function */ factory, /* string[] */ dependencies) {
      this.factory = factory;
      this.dependencies = dependencies;
    }

    isDependant(/* string */ type) {
      return this.dependencies.includes(type);
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
      if (! hasProperty(this.factory, property)) {
        return true;
      }
      return ! isEqual(value, this.factory[property]);
    }
  }
  return class {
    constructor(/* fabric.Canvas */ canvas) {
      this.canvas = canvas;
      this.types = {};
    }

    register(
      /* string */ type,
      /* Function */ factory,
      /* string[] */...dependencies
    ) {
      this.types[type] = new Type(factory, dependencies || []);
    }

    fromJson(/* string */ json) {
      const data = JSON.parse(json);
      const drawOnChange = this.canvas.renderOnAddRemove;
      this.canvas.renderOnAddRemove = false;
      for (const el of this.canvas._objects) {
        this.canvas.remove(el);
      }
      const types = this.types;
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
        this.canvas.add(this.types[el.type].factory(el));
      }
      this.canvas.renderOnAddRemove = drawOnChange;
      this.canvas.renderAll();
    }

    toJson() {
      const types = this.types;
      return JSON.stringify({
        version: fabric.version,
        objects: this.canvas._objects.map(object => {
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
})();
