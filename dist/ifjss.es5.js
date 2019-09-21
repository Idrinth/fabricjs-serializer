function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var idrinth = idrinth || {};

idrinth.FabricJsSerializer = function () {
  var FORCE_SAVE_PROPERTIES = ['left', 'top', 'type'];

  var hasProperty = function hasProperty(
  /* object */
  object,
  /* string */
  property) {
    if (typeof property !== 'string') {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(object, property);
  };

  var Type =
  /*#__PURE__*/
  function () {
    "use strict";

    function Type(
    /* Function */
    factory,
    /* string[] */
    dependencies) {
      _classCallCheck(this, Type);

      if (typeof factory !== 'function') {
        throw new Error('The factory has to be a function.');
      }

      if (!Array.isArray(dependencies)) {
        throw new Error('The dependencies have to be an array.');
      }

      this._factory = factory;
      this._dependencies = dependencies;
    }

    _createClass(Type, [{
      key: "isDependant",
      value: function isDependant(
      /* string */
      type) {
        return this._dependencies.includes(type);
      }
    }, {
      key: "isSaveworthy",
      value: function isSaveworthy(
      /* string */
      property, value) {
        var isEmptyArray = function isEmptyArray(list) {
          return Array.isArray(list) && !list.length;
        };

        var isEqual = function isEqual(a, b) {
          if (a === b) {
            return true;
          }

          return isEmptyArray(a) && isEmptyArray(b);
        };

        if (FORCE_SAVE_PROPERTIES.includes(property)) {
          return true;
        }

        if (!hasProperty(this._factory, property)) {
          return true;
        }

        return !isEqual(value, this._factory[property]);
      }
    }]);

    return Type;
  }();

  var getFabricTypes = function getFabricTypes() {
    return {
      circle: new Type(function (config) {
        return new fabric.Circle(config);
      }, []),
      ellipse: new Type(function (config) {
        return new fabric.Ellipse(config);
      }, []),
      // @todo this likely needs something changed to handle internal objects
      group: new Type(function (config) {
        return new fabric.Group(config.objects, config);
      }, []),
      'i-text': new Type(function (config) {
        return new fabric.IText(config.text, config);
      }, []),
      image: new Type(function (config) {
        return new fabric.Image.fromURL(config.src, config);
      }, []),
      line: new Type(function (config) {
        return new fabric.Line(config.points, config);
      }, []),
      linear: new Type(function (config) {
        return new fabric.Gradient(config);
      }, []),
      object: new Type(function (config) {
        return new fabric.Object(config);
      }, []),
      path: new Type(function (config) {
        return new fabric.Path(config.path, config);
      }, []),
      point: new Type(function (config) {
        return new fabric.Point(config.x, config.y);
      }, []),
      polygon: new Type(function (config) {
        return new fabric.Polygon(config.points, config);
      }, []),
      polyline: new Type(function (config) {
        return new fabric.Polyline(config.points, config);
      }, []),
      rect: new Type(function (config) {
        return new fabric.Rect(config);
      }, []),
      radial: new Type(function (config) {
        return new fabric.Gradient(config);
      }, []),
      text: new Type(function (config) {
        return new fabric.Text(config.text, config);
      }, []),
      textbox: new Type(function (config) {
        return new fabric.Textbox(config.text, config);
      }, []),
      triangle: new Type(function (config) {
        return new fabric.Triangle(config);
      }, [])
    };
  };

  var SORT = {
    BEFORE: -1,
    AFTER: 1,
    SAME: 0
  };

  var sortByTypes = function sortByTypes(
  /* {[string]:Type} */
  types,
  /* fabric.Object[] */
  objects) {
    objects.sort(function (
    /* fabric.Object */
    a,
    /* fabric.Object */
    b) {
      if (!hasProperty(types, a.type)) {
        throw new Error("Can't find a definition for given type ".concat(a.type));
      }

      if (!hasProperty(types, b.type)) {
        throw new Error("Can't find a definition for given type ".concat(b.type));
      }

      if (types[a.type].isDependant(b.type)) {
        return SORT.AFTER;
      }

      return types[b.type].isDependant(a.type) ? SORT.BEFORE : SORT.SAME;
    });
  };

  var FabricJsSerializer =
  /*#__PURE__*/
  function () {
    "use strict";

    function FabricJsSerializer(
    /* fabric.Canvas */
    canvas) {
      _classCallCheck(this, FabricJsSerializer);

      this._canvas = canvas;
      this._types = getFabricTypes();
    }

    _createClass(FabricJsSerializer, [{
      key: "register",
      value: function register(
      /* string */
      type,
      /* Function */
      factory) {
        for (var _len = arguments.length, dependencies = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          dependencies[_key - 2] = arguments[_key];
        }

        this._types[type] = new Type(factory, dependencies || []);
      }
    }, {
      key: "fromJson",
      value: function fromJson(
      /* string */
      json) {
        var data = JSON.parse(json);
        var drawOnChange = this._canvas.renderOnAddRemove;
        this._canvas.renderOnAddRemove = false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._canvas._objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var el = _step.value;

            this._canvas.remove(el);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this._canvas._objects = [];
        var positions = {};

        for (var pos = 0; pos < data.objects.length; pos++) {
          var id = data.objects[pos].type + pos;
          data.objects[pos]._internalSortId = id;
          positions[id] = pos;
        }

        sortByTypes(this._types, data.objects);
        var ordered = new Array(data.objects.length).fill(null);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = data.objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _el = _step2.value;

            var object = this._types[_el.type].factory(_el);

            this._canvas.add(object);

            ordered[positions[_el._internalSortId]] = object;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        this._canvas._objects = ordered;
        this._canvas.renderOnAddRemove = drawOnChange;

        this._canvas.renderAll();
      }
    }, {
      key: "toJson",
      value: function toJson() {
        var types = this._types;
        return JSON.stringify({
          version: fabric.version,
          objects: this._canvas._objects.map(function (object) {
            var data = object.toObject();

            if (!data.type || !hasProperty(types, data.type)) {
              throw new Error("Can't find a definition for given type ".concat(data.type));
            }

            var result = {};

            for (var _i = 0, _Object$keys = Object.keys(data); _i < _Object$keys.length; _i++) {
              var property = _Object$keys[_i];

              if (types[data.type].isSaveworthy(property, data[property])) {
                result[property] = data[property];
              }
            }

            return result;
          })
        });
      }
    }]);

    return FabricJsSerializer;
  }();

  return FabricJsSerializer;
}();