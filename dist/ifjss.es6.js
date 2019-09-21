var idrinth=idrinth||{};idrinth.FabricJsSerializer=(()=>{


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





const getFabricTypes = () => ({
  circle: new Type(config => new fabric.Circle(config), []),
  ellipse: new Type(config => new fabric.Ellipse(config), []),
  // @todo this likely needs something changed to handle internal objects
  group: new Type(config => new fabric.Group(config.objects, config), []),
  'i-text': new Type(config => new fabric.IText(config.text, config), []),
  image: new Type(config => new fabric.Image.fromURL(config.src, config), []),
  line: new Type(config => new fabric.Line(config.points, config), []),
  linear: new Type(config => new fabric.Gradient(config), []),
  object: new Type(config => new fabric.Object(config), []),
  path: new Type(config => new fabric.Path(config.path, config), []),
  point: new Type(config => new fabric.Point(config.x, config.y), []),
  polygon: new Type(config => new fabric.Polygon(config.points, config), []),
  polyline: new Type(config => new fabric.Polyline(config.points, config), []),
  rect: new Type(config => new fabric.Rect(config), []),
  radial: new Type(config => new fabric.Gradient(config), []),
  text: new Type(config => new fabric.Text(config.text, config), []),
  textbox: new Type(config => new fabric.Textbox(config.text, config), []),
  triangle: new Type(config => new fabric.Triangle(config), []),
});

const SORT = {
  BEFORE: - 1,
  AFTER: 1,
  SAME: 0,
};



const sortByTypes = (
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


const FabricJsSerializer = class {
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
return FabricJsSerializer;})();