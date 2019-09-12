const expect = require('chai').expect;
const FabricJsSerializer = require('../src/index.js');

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
