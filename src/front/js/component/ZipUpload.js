import React from "react";

export const ZipUpload = ({ onUpload, uploading, lowConfidenceFields, scannerId }) => {
    return (
        <div className="row form-group justify-content-center mt-3">
            <div className="text-center col-8 col-lg-4">
                <label><h5>Upload Scanner Export <span style={{fontSize: '0.85rem', fontWeight: 'normal', color: '#555'}}>(iTero or 3Shape — auto-fills form)</span></h5></label>
                <br />
                <input
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    id="zipUpload"
                    onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
                />
                <button
                    className="btn btn-secondary"
                    onClick={(e) => { e.preventDefault(); document.getElementById('zipUpload').click() }}
                >
                    Select Scanner Zip
                </button>
                {uploading && <p style={{ color: '#555', marginTop: '8px' }}>Reading prescription...</p>}
                {lowConfidenceFields.length > 0 && (
                    <div className="alert alert-warning mt-2" role="alert">
                        ⚠️ Please verify: <strong>{lowConfidenceFields.join(', ')}</strong>
                    </div>
                )}
                {scannerId && (
                    <p style={{ marginTop: '6px', fontSize: '0.9rem', color: '#333' }}>
                        Scanner ID: <strong>{scannerId}</strong>
                        <span 
                            onClick={clearZipData}
                            style={{ marginLeft: '10px', color: '#cc0000', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            ✕ Clear
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}