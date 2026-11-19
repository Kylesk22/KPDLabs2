import React, {useEffect, useRef, useState} from 'react';
import {attachmentList, cadFolderSetting, caseFolderName, saveCaseAttachments} from './cadDownloadFiles';

export default function CADDownload({api, patientName, caseNumber}) {
    const [folder, setFolder] = useState(null);
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const working = useRef(false);
    const supported = typeof window.showDirectoryPicker === 'function';
    useEffect(() => {
        let mounted = true;
        cadFolderSetting().then(handle => { if (mounted) setFolder(handle || null); })
            .catch(() => {}).finally(() => { if (mounted) setReady(true); });
        return () => { mounted = false; };
    }, []);
    useEffect(() => { setMessage(''); setError(''); }, [caseNumber]);

    async function chooseFolder() {
        const handle = await window.showDirectoryPicker({id: 'kpd-cad', mode: 'readwrite'});
        setFolder(handle);
        try { await cadFolderSetting(handle); }
        catch (_) { /* Still usable this visit if storage is unavailable. */ }
        return handle;
    }

    async function run(mode) {
        if (working.current) return;
        working.current = true;
        setBusy(true); setError(''); setMessage('');
        try {
            if (mode === 'folder') {
                await chooseFolder();
                return;
            }
            let target;
            if (mode === 'cad') {
                // Request permission during the click, before network requests.
                if (folder) {
                    target = folder;
                    if (await target.requestPermission({mode: 'readwrite'}) !== 'granted') {
                        throw new Error('Allow access to your CAD folder, or select another folder.');
                    }
                } else target = await chooseFolder();
            }
            setMessage('Finding scans and photos…');
            const files = await attachmentList(api, caseNumber);
            if (!files.length) throw new Error('No scans or photos have been uploaded for this case.');
            if (mode === 'cad') {
                const result = await saveCaseAttachments(target, caseFolderName(patientName, caseNumber), files, setMessage);
                setMessage(`Saved ${result.count} files to ${target.name} → ${result.folder}.`);
            } else {
                for (const file of files) {
                    const response = await fetch(file.url);
                    if (!response.ok) throw new Error('An attachment could not be downloaded. Please try again.');
                    const url = URL.createObjectURL(await response.blob());
                    const anchor = document.createElement('a');
                    anchor.href = url; anchor.download = file.filename;
                    document.body.appendChild(anchor); anchor.click(); anchor.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 60000);
                }
                setMessage('Original downloads sent to your browser. Allow multiple downloads if prompted.');
            }
        } catch (exception) {
            setMessage('');
            if (exception.name !== 'AbortError') setError(exception.message || 'Could not save attachments. Try selecting your CAD folder again.');
        } finally { working.current = false; setBusy(false); }
    }
    return <div>
        {supported && <button type="button" className="btn btn-primary" disabled={busy || !ready || !patientName || !caseNumber} onClick={() => run('cad')}>
            {busy ? 'Please wait…' : 'Download to CAD'}
        </button>}
        {supported && <div className="mt-2">
            <small>{folder ? `CAD destination: ${folder.name}` : 'Select your CAD folder on the first download.'}</small>
            {folder && <button type="button" className="btn btn-link btn-sm" disabled={busy} onClick={() => run('folder')}>Change folder</button>}
            <div><small>ZIPs are extracted into a patient and case folder. Existing case folders are kept.</small></div>
        </div>}
        {!supported && <p>Use desktop Chrome or Edge to extract scans directly into your CAD folder.</p>}
        <button type="button" className="btn btn-outline-secondary btn-sm mt-2" disabled={busy} onClick={() => run('originals')}>Download originals</button>
        {message && <p className="mt-2" role="status">{message}</p>}
        {error && <p className="text-danger mt-2" role="alert">{error}</p>}
    </div>;
}
