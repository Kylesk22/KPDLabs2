// Synthetic attachments and in-memory directory handles; never reads patient data.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const JSZip = require('jszip');
const compiled = require('@babel/core').transformSync(fs.readFileSync('src/front/js/component/cadDownloadFiles.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']
}).code;
const downloads = new Map();
const context = {exports: {}, require, Blob, Uint8Array, fetch: async url => new Response(downloads.get(url), {status: downloads.has(url) ? 200 : 404})};
vm.runInNewContext(compiled, context);
const {caseFolderName, safeParts, saveCaseAttachments, attachmentList} = context.exports;
function fail(name) { const e = new Error(name); e.name = name; throw e; }
class Directory {
    constructor(name) { this.name = name; this.entries = new Map(); }
    async getDirectoryHandle(name, options = {}) {
        if (!this.entries.has(name) && options.create) this.entries.set(name, new Directory(name));
        if (!this.entries.has(name)) fail('NotFoundError');
        if (!(this.entries.get(name) instanceof Directory)) fail('TypeMismatchError');
        return this.entries.get(name);
    }
    async getFileHandle(name, options = {}) {
        if (!this.entries.has(name) && options.create) this.entries.set(name, {bytes: null});
        if (!this.entries.has(name)) fail('NotFoundError');
        const file = this.entries.get(name);
        if (file instanceof Directory) fail('TypeMismatchError');
        return {createWritable: async () => ({write: async blob => {file.bytes = Buffer.from(await blob.arrayBuffer());}, close: async () => {}, abort: async () => {}})};
    }
}
async function zipUrl(name, contents) {
    const zip = new JSZip();
    for (const [path, bytes] of Object.entries(contents)) zip.file(path, bytes);
    downloads.set(name, await zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'}));
    return {filename: `${name}.zip`, url: name};
}
(async () => {
    assert.equal(caseFolderName('Jane Smith', 4326), 'Jane Smith - Case 4326');
    assert.equal(caseFolderName('Jane/Smith:*', 4326), 'Jane-Smith-- - Case 4326');
    for (const path of ['../scan.stl', '/scan.stl', 'C:/scan.stl', 'folder/../../scan', 'folder\\scan', 'CON.stl', 'a./scan', 'a//scan']) assert.throws(() => safeParts(path));
    const parent = new Directory('CAD');
    const scans = await zipUrl('iTero123', {'Upper.stl': Buffer.from([0, 1, 255, 30]), 'scan/Lower.stl': 'lower scan', 'scan/metadata.xml': '<scan/>'});
    downloads.set('photo', Buffer.from([255, 216, 1, 2]));
    const attachments = [scans, {filename: 'photo.jpg', url: 'photo'}];
    const name = caseFolderName('Jane Smith', 4326);
    const result = await saveCaseAttachments(parent, name, attachments);
    assert.equal(result.count, 4);
    const folder = parent.entries.get(name);
    assert.deepEqual(folder.entries.get('Upper.stl').bytes, Buffer.from([0, 1, 255, 30]));
    assert.equal(folder.entries.get('scan').entries.get('Lower.stl').bytes.toString(), 'lower scan');
    assert.deepEqual(folder.entries.get('photo.jpg').bytes, Buffer.from([255, 216, 1, 2]));
    const again = await saveCaseAttachments(parent, name, attachments);
    assert.equal(again.folder, `${name} (2)`);
    assert.equal(parent.entries.get(name), folder);
    parent.entries.set(`${name} (3)`, {bytes: Buffer.from('existing file')});
    assert.equal((await saveCaseAttachments(parent, name, attachments)).folder, `${name} (4)`);
    await assert.rejects(saveCaseAttachments(parent, name, []), /No scans/);
    await assert.rejects(saveCaseAttachments(parent, 'Bad ZIP', [{filename: 'bad.zip', url: 'photo'}]), /damaged/);
    assert(!parent.entries.has('Bad ZIP'));
    const malicious = await zipUrl('attack', {'../outside.stl': 'bad'});
    await assert.rejects(saveCaseAttachments(parent, 'Unsafe', [malicious]), /safely/);
    assert(!parent.entries.has('Unsafe'));
    const conflict = await zipUrl('conflict', {'UPPER.stl': 'different data'});
    await assert.rejects(saveCaseAttachments(parent, 'Conflict', [scans, conflict]), /incomplete/);
    assert.deepEqual(parent.entries.get('Conflict').entries.get('Upper.stl').bytes, Buffer.from([0, 1, 255, 30]));
    await assert.rejects(saveCaseAttachments(parent, 'Failure', [scans, {filename: 'x.stl', url: 'missing'}]), /incomplete/);
    await assert.rejects(saveCaseAttachments(parent, 'Empty', [await zipUrl('empty', {})]), /no files/);
    downloads.set('api/list_files/4326', JSON.stringify(attachments));
    assert.equal((await attachmentList('api', 4326)).length, 2);
    await assert.rejects(attachmentList('api', 'missing'), /retrieve attachments/);
    console.log('CAD download checks passed: extraction preserves bytes, nested paths/photos, repeat downloads, unsafe paths, conflicts, empty/corrupt ZIPs and network failures.');
})().catch(error => { console.error(error); process.exitCode = 1; });
