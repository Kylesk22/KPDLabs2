import JSZip from 'jszip';

const MAX_FILE_BYTES = 256 * 1024 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024;
const MAX_FILES = 2000;

export function caseFolderName(patient, caseNumber) {
    const name = String(patient || 'Patient').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/g, '').trim();
    const number = String(caseNumber).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!number) throw new Error('The case number is missing. Reload the case and try again.');
    return `${name.slice(0, 90) || 'Patient'} - Case ${number}`;
}

export function safeParts(path) {
    const parts = String(path).split('/');
    if (parts.some(part => !part || part === '.' || part === '..' ||
        /[<>:"\\|?*\x00-\x1f]/.test(part) || /[. ]$/.test(part) || part.length > 180 ||
        /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part))) {
        throw new Error('An attachment contains a filename that cannot safely be extracted on Windows. Use Download originals.');
    }
    if (parts.length > 15 || String(path).length > 220) throw new Error('An attachment has folders nested too deeply. Use Download originals.');
    return parts;
}

export async function attachmentList(api, caseNumber) {
    const response = await fetch(`${api}/list_files/${encodeURIComponent(caseNumber)}`, {credentials: 'include', cache: 'no-store'});
    if (!response.ok) throw new Error('Could not retrieve attachments. Refresh the page and try again.');
    const files = await response.json();
    if (!Array.isArray(files) || files.some(file => typeof file.url !== 'string' || typeof file.filename !== 'string')) {
        throw new Error('The attachment list could not be read.');
    }
    return files.filter(file => file.filename);
}

async function attachmentBytes(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('An attachment could not be downloaded. Please try again.');
    if (Number(response.headers.get('content-length')) > MAX_FILE_BYTES) throw new Error('An attachment exceeds 256 MB. Use Download originals.');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_FILE_BYTES) throw new Error('An attachment exceeds 256 MB. Use Download originals.');
            chunks.push(value);
        }
    } finally {
        await reader.cancel();
        reader.releaseLock();
    }
    return new Uint8Array(await new Blob(chunks).arrayBuffer());
}

// Bound actual inflated data, rather than trusting the ZIP's claimed size.
function unzipEntry(entry, available) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        const stream = entry.internalStream('uint8array');
        stream.on('data', chunk => {
            size += chunk.length;
            if (size > Math.min(MAX_FILE_BYTES, available)) {
                stream.pause();
                reject(new Error('The extracted scans exceed the download size limit. Use Download originals.'));
                return;
            }
            chunks.push(chunk);
        }).on('error', reject).on('end', () => resolve(new Blob(chunks))).resume();
    });
}

export async function newCaseDirectory(parent, name) {
    for (let index = 1; index <= 1000; index++) {
        const candidate = index === 1 ? name : `${name} (${index})`;
        try {
            await parent.getDirectoryHandle(candidate);
        } catch (error) {
            if (error.name === 'TypeMismatchError') continue;
            if (error.name !== 'NotFoundError') throw error;
            return parent.getDirectoryHandle(candidate, {create: true});
        }
    }
    throw new Error('Too many copies of this case already exist in the selected folder.');
}

export async function saveCaseAttachments(parent, name, files, onProgress = () => {}) {
    if (!files.length) throw new Error('No scans or photos have been uploaded for this case.');
    let directory;
    let count = 0;
    let total = 0;
    const paths = new Set();
    async function write(parts, blob) {
        const path = parts.join('/').toLowerCase();
        if (paths.has(path) || [...paths].some(old => old.startsWith(`${path}/`) || path.startsWith(`${old}/`))) {
            throw new Error('Attachments contain conflicting filenames. Use Download originals to keep them separately.');
        }
        if (++count > MAX_FILES || (total += blob.size) > MAX_TOTAL_BYTES) throw new Error('Too many or oversized extracted files. Use Download originals.');
        paths.add(path);
        if (!directory) directory = await newCaseDirectory(parent, name);
        let target = directory;
        for (const part of parts.slice(0, -1)) target = await target.getDirectoryHandle(part, {create: true});
        const file = await target.getFileHandle(parts[parts.length - 1], {create: true});
        const writer = await file.createWritable();
        try { await writer.write(blob); await writer.close(); }
        catch (error) { try { await writer.abort(); } catch (_) { /* Already closed. */ } throw error; }
    }
    try {
        for (let index = 0; index < files.length; index++) {
            onProgress(`Downloading attachment ${index + 1} of ${files.length}…`);
            const file = files[index];
            const data = await attachmentBytes(file.url);
            if (/\.zip$/i.test(file.filename)) {
                let zip;
                try { zip = await JSZip.loadAsync(data); }
                catch (_) { throw new Error('A ZIP is damaged, encrypted, or unsupported. Use Download originals.'); }
                const entries = Object.values(zip.files).filter(entry => !entry.dir);
                if (count + entries.length > MAX_FILES) throw new Error('This ZIP contains too many files. Use Download originals.');
                // JSZip sanitizes ../; inspect original names before extraction.
                const plans = entries.map(entry => ({entry, parts: safeParts(entry.unsafeOriginalName || entry.name)}));
                for (const {entry, parts} of plans) {
                    onProgress(`Extracting scans… ${count + 1} files`);
                    await write(parts, await unzipEntry(entry, MAX_TOTAL_BYTES - total));
                }
            } else {
                await write(safeParts(file.filename), new Blob([data]));
            }
        }
        if (!count) throw new Error('The uploaded ZIP contains no files.');
        return {folder: directory.name, count};
    } catch (error) {
        if (directory) throw new Error(`${error.message} The folder "${directory.name}" is incomplete; do not use it for CAD. A retry creates a separate folder.`);
        throw error;
    }
}

// Persist only a directory handle, never patient data or scan contents.
export function cadFolderSetting(handle) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('kpd-cad-folder', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('settings');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            try {
                const transaction = db.transaction('settings', handle ? 'readwrite' : 'readonly');
                const store = transaction.objectStore('settings');
                const result = handle ? store.put(handle, 'folder') : store.get('folder');
                transaction.oncomplete = () => { db.close(); resolve(handle || result.result); };
                transaction.onabort = transaction.onerror = () => { db.close(); reject(transaction.error); };
            } catch (error) { db.close(); reject(error); }
        };
    });
}
