export const PARTIAL_NAME = 'KPD Premier Partial';
export const PARTIAL_MATERIAL = 'Flexible PMMA with Gingival Composite';
export const PARTIAL_DESCRIPTION = '100% clear flexible PMMA with your choice of Pink or Meharry gingival composite.';
export const PARTIAL_PRODUCTS = ['Try In', 'Unilateral', 'Bilateral'];
export const PARTIAL_SHADES = [
  {value:'Clear Flexible PMMA + Pink Gingival Composite', label:'Pink Gingival Composite'},
  {value:'Clear Flexible PMMA + Meharry Gingival Composite', label:'Meharry Gingival Composite'},
];

// One charge per selected arch, not per replacement tooth. Composite is included.
export function partialOrderPrice(product, teeth, model3D = 'No') {
  const rate = {'Try In':50, Unilateral:250, Bilateral:325}[product];
  if (!rate || !Array.isArray(teeth)) return 0;
  const arches = new Set();
  teeth.forEach(tooth => {
    const text = String(tooth).trim();
    if (/^upper(?: arch)?$/i.test(text)) arches.add('upper');
    else if (/^lower(?: arch)?$/i.test(text)) arches.add('lower');
    else if (/^(?:[1-9]|[12][0-9]|3[0-2])$/.test(text)) arches.add(Number(text) <= 16 ? 'upper' : 'lower');
  });
  return arches.size * (rate + (model3D === 'Yes' ? 15 : 0));
}
