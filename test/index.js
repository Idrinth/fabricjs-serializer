const expect = require('chai').expect;
const fabric = require('fabric');
const FJS = require('rewire')('../src/index.js');
FJS.__set__('fabric', fabric.fabric);
const FabricJsSerializer = FJS.__get__('FabricJsSerializer');

console.log(FabricJsSerializer);
const serializer = new FabricJsSerializer();

describe('serialize', () => {
    const tests = {
        '{"version":"3.4.0","objects":[]}': {_objects: []},
    };
    for (const expectation of Object.keys(tests)) {
        it ('serializing has to match expected output', () => {
            expect(serializer.toJson(tests[expectation])).to.equal(expectation);
        });
    }
});