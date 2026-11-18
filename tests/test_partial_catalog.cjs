const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const compiled = require('@babel/core').transformSync(fs.readFileSync('src/front/js/component/partialCatalog.js','utf8'), {babelrc:false,configFile:false,plugins:['@babel/plugin-transform-modules-commonjs']}).code;
const context = {exports:{}};
vm.runInNewContext(compiled, context);
const {partialOrderPrice, PARTIAL_PRODUCTS, PARTIAL_SHADES} = context.exports;
assert.deepStrictEqual([...PARTIAL_PRODUCTS],['Try In','Unilateral','Bilateral']);
assert.strictEqual(PARTIAL_SHADES.length,2);
assert(PARTIAL_SHADES.every(s=>s.value.length<=50)); // Existing database field limit.
for (const [product, oneArch, twoArches] of [['Try In',50,100],['Unilateral',250,500],['Bilateral',325,650]]) {
  assert.strictEqual(partialOrderPrice(product,['8']),oneArch);
  assert.strictEqual(partialOrderPrice(product,['8','9','10','11']),oneArch);
  assert.strictEqual(partialOrderPrice(product,['20','21']),oneArch);
  assert.strictEqual(partialOrderPrice(product,['8','20']),twoArches);
  assert.strictEqual(partialOrderPrice(product,['Upper Arch','Lower Arch']),twoArches);
  assert.strictEqual(partialOrderPrice(product,['8'],'Yes'),oneArch+15);
  assert.strictEqual(partialOrderPrice(product,['8','20'],'Yes'),twoArches+30);
  assert.strictEqual(partialOrderPrice(product,[]),0);
}
assert.strictEqual(partialOrderPrice('Select One',['8']),0);
assert.strictEqual(partialOrderPrice('Bilateral',['0','33','invalid']),0);
console.log('Partial pricing checks passed: three products, one/two arches, models, and two compatible shade values.');
