const expect = require('chai').expect;
const getFabricTypes = require('../src/getFabricTypes.js');

describe('getFabricTypes', () => {
  it('getFabricTypes is a function', () => {
    expect(getFabricTypes).to.be.a('function');
  });
  it('getFabricTypes should return an object', () => {
    expect(getFabricTypes()).to.be.an('object');
  });
  it('getFabricTypes should define the expected types', () => {
    const types = Object.keys(getFabricTypes()).sort();
    expect(types).to.deep.equal([
      'circle',
      'ellipse',
      'group',
      'i-text',
      'image',
      'line',
      'linear',
      'object',
      'path',
      'point',
      'polygon',
      'polyline',
      'radial',
      'rect',
      'text',
      'textbox',
      'triangle',
    ]);
  });
  it('getFabricTypes should return an object for all types', () => {
    const types = Object.values(getFabricTypes());
    for (const type of types) {
      expect(type).to.be.an('object');
    }
  });
});
