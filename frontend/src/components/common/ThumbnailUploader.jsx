import { useState, useRef } from "react";
import { CheckCircle, XCircle, Upload, Link2, Loader2 } from "lucide-react";

export default function ThumbnailUploader({
  label = "Thumbnail",
  value = "",
  onChange = () => {},
}) {
  const [url, setUrl] = useState(value && value.startsWith("http") ? value : "");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const fileRef = useRef();

  const handleCheck = () => {
    if (!url) {
      setCheckResult({ ok: false, msg: "Please enter a URL" });
      return;
    }

    try {
      new URL(url);
    } catch {
      setCheckResult({ ok: false, msg: "Invalid URL format" });
      return;
    }

    setChecking(true);
    const img = new Image();

    img.onload = () => {
      setChecking(false);
      setCheckResult({ ok: true, msg: "URL is a valid image" });
      onChange(url);
    };

    img.onerror = () => {
      setChecking(false);
      setCheckResult({
        ok: false,
        msg: "URL does not point to a valid image.",
      });
    };

    img.src = url;
  };

  const handleUrlChange = (val) => {
    setUrl(val);
    setCheckResult(null);
    if (val.startsWith("http")) {
      onChange(val);
    } else if (!val) {
      onChange("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCheckResult({ ok: false, msg: "Please choose an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      onChange(dataUrl);
      setUrl("");
      setCheckResult({ ok: true, msg: "Image uploaded successfully" });
    };
    reader.readAsDataURL(file);

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      {label && <label className="label-dark">{label}</label>}

      <div className="flex gap-2.5">
        <input
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="input-dark flex-1"
          placeholder="Paste image URL or upload below"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking}
          className="btn-secondary whitespace-nowrap py-2"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4 mr-1" />}
          Check
        </button>
      </div>

      <div className="flex items-center gap-3 mt-2.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-secondary whitespace-nowrap py-1.5 px-3 text-xs"
        >
          <Upload className="w-3.5 h-3.5 mr-1" />
          Upload Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {checkResult && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${checkResult.ok ? "text-emerald-600" : "text-red-500"}`}>
            {checkResult.ok ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {checkResult.msg}
          </span>
        )}
      </div>

      {(value?.startsWith("data:image") || value?.startsWith("http")) && (
        <div className="mt-3 card-image-wrapper">
          <img
            src={value}
            alt="Preview"
            className="thumbnail-landscape"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}