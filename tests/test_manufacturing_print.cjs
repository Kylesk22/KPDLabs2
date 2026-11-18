// Rendering checks run with synthetic data only; no browser or printer needed.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('src/front/js/component/manufacturingPrint.js','utf8');
const compiled = require('@babel/core').transformSync(source, {babelrc:false,configFile:false,plugins:['@babel/plugin-transform-modules-commonjs']}).code;
const context = {exports:{}};
vm.runInNewContext(compiled,context);
const {labelMarkup,selectedTeeth,escapeHTML,printManufacturingLabels}=context.exports;
assert.deepStrictEqual([...selectedTeeth('{"8","9"}')],['8','9']);
assert.deepStrictEqual([...selectedTeeth('["8","9"]')],['8','9']);
assert.deepStrictEqual([...selectedTeeth('8')],['8']);
assert.strictEqual(selectedTeeth(['Upper Arch','Lower Arch']).size,32);
assert.strictEqual(selectedTeeth(['0','33','bad']).size,0);
const attack='<img src=x onerror="alert(1)">';
const markup=labelMarkup({caseNumber:1,type:'crown',patientName:attack,note:attack,crownTooth:['8','9']});
assert(markup.includes(escapeHTML(attack)));
assert(!markup.includes('<img'));
assert(!/\sid=/.test(markup));
assert(!/\sonclick\s*=/i.test(markup));
// Existing artwork omits wisdom teeth; keep every existing selectable path.
const expectedTeeth = [...Array(14)].map((_,i)=>String(i+2)).concat([...Array(14)].map((_,i)=>String(i+18)));
assert.deepStrictEqual([...markup.matchAll(/data-tooth="(\d+)"/g)].map(m=>m[1]),expectedTeeth);
assert.throws(()=>printManufacturingLabels({closed:true},[{}]),/Allow the print window/);
assert.throws(()=>printManufacturingLabels({closed:false},[]),/No labels/);
console.log('Manufacturing label rendering checks passed.');

// Exercise the full print document with all lower sections and long notes.
// The old scaled, fixed-height clipping container must never be reintroduced.
let printed = 0, documentHTML = '';
const mockContent = {querySelectorAll: () => []};
const fakeWindow = {closed:false, focus(){}, print(){printed++;}, document:{
  open(){}, write(html){documentHTML = html;}, close(){},
  querySelectorAll(){return [{querySelector:()=>mockContent},{querySelector:()=>mockContent}];}
}};
const longNotes = 'Detailed manufacturing instruction. '.repeat(120) + 'FINAL INSTRUCTION';
printManufacturingLabels(fakeWindow, [
  {caseNumber:101,patientName:'Demo One',note:longNotes,price:'325',crownTooth:['Lower Arch']},
  {caseNumber:102,patientName:'Demo Two',note:'Second case instructions',price:'250',crownTooth:['8']}
]);
assert.strictEqual(printed,1);
assert(documentHTML.includes(longNotes));
assert(documentHTML.includes('Case Total = $325'));
assert(documentHTML.includes('Case Total = $250'));
assert(documentHTML.indexOf('FINAL INSTRUCTION') < documentHTML.indexOf('Case Total = $325'));
assert(!/overflow\s*:\s*hidden|transform\s*:|position\s*:\s*absolute/.test(documentHTML));
assert(!/height\s*:\s*5\.76in/.test(documentHTML));
assert(/@page\s*\{\s*size:4in 6in/.test(documentHTML));
assert.strictEqual((documentHTML.match(/<section class="label-frame"/g)||[]).length,2);
console.log('Batch print regression passed: full notes/totals, separate cases, no clipping container.');
