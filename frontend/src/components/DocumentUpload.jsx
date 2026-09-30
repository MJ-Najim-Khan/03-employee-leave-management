import { useCallback, useRef, useState } from "react";

import { uploadDocument } from "../services/api";

const DOC_UPLOAD_STYLES = `
  .doc-upload {
    --ink: #1c2430;
    --ink-soft: #5b6472;
    --surface: #ffffff;
    --panel: #f4f6f8;
    --border: #dce1e7;
    --accent: #2f6f5e;
    --accent-soft: #eaf2ef;
    --error: #b3261e;
    --error-soft: #fbeceb;
    --success: #1e824c;
    --success-soft: #eaf6ef;
    --radius: 10px;

    max-width: 420px;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
    color: var(--ink);
  }

  .doc-upload__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .doc-upload__title {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .doc-upload__hint {
    font-size: 12px;
    color: var(--ink-soft);
    white-space: nowrap;
  }

  .doc-upload__zone {
    position: relative;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
    background: var(--panel);
    padding: 22px 16px;
    cursor: pointer;
    transition: border-color 150ms ease, background-color 150ms ease,
      transform 100ms ease;
  }

  .doc-upload__zone:hover {
    border-color: #b7c0c9;
  }

  .doc-upload__zone.is-dragging {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: scale(1.01);
  }

  .doc-upload__zone.is-error {
    border-color: var(--error);
    background: var(--error-soft);
  }

  .doc-upload__zone.has-file {
    cursor: default;
    padding: 12px 14px;
  }

  .doc-upload__input {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }

  .doc-upload__prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    color: var(--ink-soft);
  }

  .doc-upload__icon {
    color: var(--ink-soft);
  }

  .doc-upload__zone.is-dragging .doc-upload__icon {
    color: var(--accent);
  }

  .doc-upload__prompt p {
    margin: 0;
    font-size: 13.5px;
  }

  .doc-upload__prompt-strong {
    color: var(--ink);
    font-weight: 600;
  }

  .doc-upload__file {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .doc-upload__file-badge {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 7px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--accent);
  }

  .doc-upload__file-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .doc-upload__file-name {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .doc-upload__file-size {
    font-size: 11.5px;
    color: var(--ink-soft);
  }

  .doc-upload__remove {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--ink-soft);
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
  }

  .doc-upload__remove:hover {
    background: var(--border);
    color: var(--ink);
  }

  .doc-upload__progress-track {
    margin-top: 10px;
    height: 3px;
    border-radius: 2px;
    background: var(--border);
    overflow: hidden;
  }

  .doc-upload__progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 200ms ease;
  }

  .doc-upload__error {
    margin: 8px 2px 0;
    font-size: 12.5px;
    color: var(--error);
  }

  .doc-upload__submit {
    width: 100%;
    margin-top: 14px;
    padding: 10px 16px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 7px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 120ms ease, transform 80ms ease;
  }

  .doc-upload__submit:hover:not(:disabled) {
    background: #265a4c;
  }

  .doc-upload__submit:active:not(:disabled) {
    transform: scale(0.98);
  }

  .doc-upload__submit:disabled {
    background: var(--border);
    color: var(--ink-soft);
    cursor: not-allowed;
  }

  .doc-upload__result {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: var(--radius);
  }

  .doc-upload__result--success {
    background: var(--success-soft);
    color: var(--success);
  }

  .doc-upload__result-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
    color: var(--ink);
  }

  .doc-upload__result-text strong {
    font-size: 13px;
    color: var(--success);
  }

  .doc-upload__result-text span {
    font-size: 12px;
    color: var(--ink-soft);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .doc-upload__link-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  .doc-upload__link-btn:hover {
    text-decoration: underline;
  }

  .doc-upload__zone:focus-visible,
  .doc-upload__submit:focus-visible,
  .doc-upload__remove:focus-visible,
  .doc-upload__link-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .doc-upload__zone,
    .doc-upload__progress-fill,
    .doc-upload__submit {
      transition: none;
    }
  }
`;

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(fileName) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

function validateFile(file) {
  const ext = `.${file.name.split(".").pop().toLowerCase()}`;
  if (!ACCEPTED_TYPES.includes(ext)) {
    return `${ext} isn't a supported format. Use PDF, Word, or an image.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large. Max size is ${formatBytes(MAX_SIZE_BYTES)}.`;
  }
  return null;
}

// status: "idle" | "dragging" | "selected" | "uploading" | "success" | "error"
function DocumentUpload({ employeeId, token }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const inputRef = useRef(null);
  const dragCounter = useRef(0);
  const progressTimer = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorText("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const chooseFile = useCallback((candidate) => {
    if (!candidate) return;
    const problem = validateFile(candidate);
    if (problem) {
      setFile(null);
      setStatus("error");
      setErrorText(problem);
      return;
    }
    setFile(candidate);
    setStatus("selected");
    setErrorText("");
  }, []);

  function handleDragEnter(event) {
    event.preventDefault();
    dragCounter.current += 1;
    if (status !== "uploading") setStatus("dragging");
  }

  function handleDragLeave(event) {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0 && status === "dragging") {
      setStatus(file ? "selected" : "idle");
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    dragCounter.current = 0;
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);

    // Simulated progress: climbs to 90% while the request is in flight,
    // then snaps to 100% on success. Swap for real XHR progress events
    // if uploadDocument exposes them.
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 12 : p));
    }, 250);

    try {
      const data = await uploadDocument(employeeId, file, token);
      clearInterval(progressTimer.current);
      setProgress(100);
      setUploadedName(data.file_name);
      setTimeout(() => setStatus("success"), 200);
    } catch (error) {
      clearInterval(progressTimer.current);
      setStatus("error");
      setErrorText(error.message || "Upload failed. Try again.");
      setProgress(0);
    }
  }

  const isDragging = status === "dragging";
  const isUploading = status === "uploading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="doc-upload">
      <style>{DOC_UPLOAD_STYLES}</style>

      <div className="doc-upload__header">
        <h2 className="doc-upload__title">Supporting document</h2>
        <span className="doc-upload__hint">PDF, Word, or image · up to 15 MB</span>
      </div>

      {isSuccess ? (
        <div className="doc-upload__result doc-upload__result--success">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M6 10.5l2.5 2.5L14 7.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="doc-upload__result-text">
            <strong>Uploaded</strong>
            <span>{uploadedName}</span>
          </div>
          <button type="button" className="doc-upload__link-btn" onClick={reset}>
            Upload another
          </button>
        </div>
      ) : (
        <>
          <div
            className={[
              "doc-upload__zone",
              isDragging ? "is-dragging" : "",
              isError ? "is-error" : "",
              file ? "has-file" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className="doc-upload__input"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => chooseFile(e.target.files?.[0])}
              disabled={isUploading}
            />

            {!file && (
              <div className="doc-upload__prompt">
                <svg
                  className="doc-upload__icon"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M14 18V7M14 7l-5 5M14 7l5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 19v2.5A2.5 2.5 0 008.5 24h11a2.5 2.5 0 002.5-2.5V19"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                <p>
                  <span className="doc-upload__prompt-strong">Drop a file here</span> or
                  click to browse
                </p>
              </div>
            )}

            {file && (
              <div className="doc-upload__file">
                <div className="doc-upload__file-badge">{getExtension(file.name)}</div>
                <div className="doc-upload__file-meta">
                  <span className="doc-upload__file-name">{file.name}</span>
                  <span className="doc-upload__file-size">{formatBytes(file.size)}</span>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    className="doc-upload__remove"
                    aria-label="Remove file"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 3l8 8M11 3l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {isUploading && (
              <div className="doc-upload__progress-track">
                <div
                  className="doc-upload__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {isError && errorText && (
            <p className="doc-upload__error">{errorText}</p>
          )}

          <button
            type="button"
            className="doc-upload__submit"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? "Uploading…" : "Upload document"}
          </button>
        </>
      )}
    </div>
  );
}

export default DocumentUpload;
