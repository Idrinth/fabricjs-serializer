const expect = require('chai').expect;
const fabric = require('fabric');
const FJS = require('rewire')('../src/index.js');
FJS.__set__('fabric', fabric.fabric);
const FabricJsSerializer = FJS.__get__(
  'FabricJsSerializer'
);

describe('serialize', () => {
  const tests = {
    '{"version":"3.4.0","objects":[]}': {
      _objects: [],
    },
  };
  for (const expectation of Object.keys(tests)) {
    it('serializing has to match expected output', () => {
      const serializer = new FabricJsSerializer(tests[expectation]);
      expect(serializer.toJson()).to.equal(expectation);
    });
  }
});
