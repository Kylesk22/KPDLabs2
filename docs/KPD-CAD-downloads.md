# Admin CAD downloads

The admin case's Download to CAD button retrieves its existing scan/photo attachments and extracts ZIP files locally into `<patient name> - Case <number>` beneath a staff-selected CAD directory. Loose files/photos are included; original filenames, archive subfolders, and file contents are preserved. Nested ZIPs remain files. No case status, server upload, or database schema changes.

On each PC/browser profile, use desktop Chrome or Edge and choose the CAD directory on first use. The browser remembers its directory handle in IndexedDB; it may ask to renew write permission after a browser restart. Change folder selects another destination. If browser storage is disabled, the directory works for the current component visit. Unsupported browsers retain Download originals.

Existing case directories/files cause a numbered new directory rather than an intentional overwrite. Avoid simultaneous downloads of the same case to the same shared folder from multiple computers: browser directory APIs do not offer atomic exclusive directory creation. A failed extraction displays an incomplete-folder warning; a retry creates another directory. The app does not delete existing work. Staff should discard the incomplete copy after a successful retry.

Extraction rejects unsafe Windows paths, path traversal, case-insensitive filename conflicts, and excessive nesting. Limits: 256 MiB per downloaded attachment or inflated file, 1 GiB of extracted output, and 2,000 files per operation. Oversized, encrypted, damaged, or unsupported ZIPs retain the original-download workflow. File System Access permissions are browser-controlled; the site cannot silently choose an arbitrary disk path.

Verification: `node tests/test_cad_download.cjs` uses synthetic ZIPs and fake directory handles to check byte preservation, nested paths, photos, repeat downloads, unsafe paths, naming conflicts, empty/corrupt archives, and failed requests. Production webpack compilation also required. A real Chrome/Edge folder permission and lab CAD import smoke test remain necessary after deployment; automated tests do not cover the physical lab share or browser permission UI.

Smoke test: open one admin case with a known ZIP, choose the CAD folder, verify the success path and upper/lower scan contents, import into CAD, then repeat to confirm a numbered folder. Reload the page and test remembered-folder permission. Cancel a folder picker and confirm no download starts. Download originals remains available as fallback.
