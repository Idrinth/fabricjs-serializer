const fabric = require('./fabric');
const Type = require('./Type');

module.exports = () => ({
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
