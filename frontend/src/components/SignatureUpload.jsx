import { useState } from "react";
import api from "../api/axios";
import SignaturePad from "./SignaturePad";

export default function SignatureUpload({ label, existingPath, onUploaded }) {
  const [mode, setMode] = useState("draw"); // "draw" | "upload"
  const [preview, setPreview] = useState(existingPath || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadBlob = async (blob, filename) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("signature", blob, filename);
      const { data } = await api.post("/vouchers/upload-signature", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(data.path);
      onUploaded(data.path);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadBlob(file, file.name);
  };

  const handleDrawnSave = (blob) => {
    uploadBlob(blob, "signature.png");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ledger-800 mb-1">{label}</label>

      <div className="flex mb-3 text-xs border border-ledger-200 rounded overflow-hidden w-fit">
        <button type="button" onClick={() => setMode("draw")}
          className={`px-3 py-1.5 ${mode === "draw" ? "bg-ledger-900 text-white" : "bg-white text-ledger-700"}`}>
          Draw signature
        </button>
        <button type="button" onClick={() => setMode("upload")}
          className={`px-3 py-1.5 ${mode === "upload" ? "bg-ledger-900 text-white" : "bg-white text-ledger-700"}`}>
          Upload image
        </button>
      </div>

      {mode === "draw" ? (
        <SignaturePad onSave={handleDrawnSave} />
      ) : (
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="text-sm"
        />
      )}

      <div className="mt-3">
        <p className="text-xs text-ledger-400 mb-1">Current signature on file:</p>
        {preview ? (
          <img src={preview} alt="signature preview" className="h-16 border border-ledger-200 rounded bg-white p-1" />
        ) : (
          <div className="h-16 w-32 border border-dashed border-ledger-200 rounded flex items-center justify-center text-xs text-ledger-400">
            No signature
          </div>
        )}
      </div>

      {uploading && <p className="text-xs text-ledger-400 mt-1">Saving…</p>}
      {error && <p className="text-xs text-stamp-rust mt-1">{error}</p>}
    </div>
  );
}
