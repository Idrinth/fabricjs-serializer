var idrinth=idrinth||{};idrinth.FabricJsSerializer=(()=>{


const SORT = {
  BEFORE: - 1,
  AFTER: 1,
  SAME: 0,
};

const FORCE_SAVE_PROPERTIES = [
  'left',
  'top',
  'type',
];

const hasProperty = (/* object */ object, /* string */ property) => {
  if (typeof property !== 'string') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(object, property);
};


const Type = class {
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

const getFabricTypes = () => {
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


var FabricJsSerializer = class {
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
return FabricJsSerializer;})();