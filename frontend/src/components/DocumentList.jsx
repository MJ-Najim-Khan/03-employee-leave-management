import { useEffect, useState } from "react";

import {
  getEmployeeDocuments,
  getDocumentDownloadUrl,
} from "../services/api";

function getExtension(fileName) {
  if (!fileName || !fileName.includes(".")) return "FILE";
  return fileName.split(".").pop().slice(0, 4).toUpperCase();
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DocumentList({ employeeId, token }) {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  async function loadDocuments() {
    try {
      setLoading(true);

      const data = await getEmployeeDocuments(employeeId, token);

      setDocuments(data);
      setMessage("");
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

  async function handleDownload(documentId) {
    setDownloadingId(documentId);

    try {
      const data = await getDocumentDownloadUrl(documentId, token);
      window.open(data.download_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="card">
      <h2>My Documents</h2>

      {message && (
        <div
          className={`message ${isError ? "message--error" : ""}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      {loading ? (
        <>
          <div className="document-row skeleton-row" />
          <div className="document-row skeleton-row" />
        </>
      ) : documents.length === 0 ? (
        <p className="empty-state">No documents uploaded.</p>
      ) : (
        documents.map((document) => {
          const isDownloading = downloadingId === document.id;

          return (
            <div className="document-row" key={document.id}>
              <span className="file-type-chip">
                {getExtension(document.file_name)}
              </span>

              <div className="document-row__info">
                <strong>{document.file_name}</strong>
                <div className="document-row__meta">
                  Uploaded {formatTimestamp(document.uploaded_at)}
                </div>
              </div>

              <button
                className="download-button"
                onClick={() => handleDownload(document.id)}
                disabled={isDownloading}
                aria-busy={isDownloading}
              >
                {isDownloading ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {isDownloading ? "Opening…" : "Download"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default DocumentList;
