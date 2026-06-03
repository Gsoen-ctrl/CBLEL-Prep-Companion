import React, { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { writeFile } from "@tauri-apps/plugin-fs";
import { type as osType } from "@tauri-apps/plugin-os";
import { downloadDir, join } from "@tauri-apps/api/path";
import { openUrl, openPath } from "@tauri-apps/plugin-opener";

export const AutoUpdater: React.FC<{
  show: boolean;
  latestRelease: any;
  onClose: () => void;
}> = ({ show, latestRelease, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("");
  const [isError, setIsError] = useState(false);
  const [osName, setOsName] = useState<string | null>(null);

  useEffect(() => {
    // Try to get OS type, but allow it to fail safely during browser preview
    try {
      const type = osType();
      setOsName(type);
    } catch (e) {
      console.warn("Tauri OS plugin not available", e);
    }
  }, []);

  if (!show || !latestRelease) return null;

  const getPlatformExtension = () => {
    if (osName === "macos") return ".dmg";
    if (osName === "windows") return ".exe";
    if (osName === "android") return ".apk";

    // Fallback based on user agent if Tauri plugin is not ready
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android")) return ".apk";
    if (ua.includes("win")) return ".exe";
    if (ua.includes("mac")) return ".dmg";
    return null; // fallback or unknown
  };

  const handleUpdate = async () => {
    setIsDownloading(true);
    setIsError(false);
    setStatusText("Preparing download...");
    setProgress(0);

    try {
      const remoteVersion = latestRelease.tag_name.replace(/^v/, "");
      const ext = getPlatformExtension();
      const expectedFilename = ext ? `Solari_${remoteVersion}${ext}` : null;

      let downloadUrl = latestRelease.html_url; // fallback to html
      let actualFilename = expectedFilename || "Solari_update";

      if (ext && latestRelease.assets && latestRelease.assets.length > 0) {
        // Try strict match first
        let asset = latestRelease.assets.find(
          (a: any) => a.name === expectedFilename,
        );
        // Fallback to any matching extension if strictly named asset isn't found
        if (!asset) {
          asset = latestRelease.assets.find((a: any) => a.name.endsWith(ext));
        }

        if (asset) {
          downloadUrl = asset.browser_download_url;
          actualFilename = asset.name;
        }
      }

      setStatusText("Opening browser...");

      // Open the download link directly in the system's default browser.
      // This universally bypasses all scoped storage and file permission constraints
      // allowing the native OS package manager to securely download and install the update.
      await openUrl(downloadUrl);

      setIsDownloading(false);
      setProgress(null);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      setIsError(true);

      let errorMsg = "Failed to download update.";
      if (error instanceof Error) {
        errorMsg = `Failed: ${error.message}`;
      } else if (typeof error === "string") {
        errorMsg = `Failed: ${error}`;
      }

      setStatusText(errorMsg);
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "var(--cream)",
          border: "1px solid var(--cream-border)",
          borderRadius: "var(--radius)",
          padding: "24px",
          width: "100%",
          maxWidth: "340px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          animation: "fade-in 0.2s ease-out",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "calc(22px * var(--scale, 1))",
              color: "var(--ink)",
              marginBottom: "8px",
            }}
          >
            Update Available
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "calc(14px * var(--scale, 1))",
              color: isError ? "var(--red)" : "var(--ink-muted)",
              lineHeight: 1.5,
            }}
          >
            {isDownloading || progress !== null || isError
              ? statusText
              : `A new version of Solari (${latestRelease.tag_name}) is ready to download.`}
          </div>
        </div>

        {isDownloading && progress !== null && progress > 0 && (
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "var(--cream-border)",
              borderRadius: "3px",
              overflow: "hidden",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "var(--accent)",
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={onClose}
            disabled={isDownloading && !isError}
            style={{
              flex: 1,
              padding: "10px",
              background: "var(--cream-dark)",
              border: "1px solid var(--cream-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--ink-muted)",
              fontSize: "calc(14px * var(--scale, 1))",
              fontFamily: "var(--font-body)",
              cursor: isDownloading && !isError ? "not-allowed" : "pointer",
              opacity: isDownloading && !isError ? 0.6 : 1,
            }}
          >
            {isError ? "Close" : "Later"}
          </button>
          {!isError && (
            <button
              onClick={handleUpdate}
              disabled={isDownloading}
              style={{
                flex: 1,
                padding: "10px",
                background: isDownloading ? "var(--green)" : "var(--accent)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "white",
                fontSize: "calc(14px * var(--scale, 1))",
                fontFamily: "var(--font-body)",
                cursor: isDownloading ? "wait" : "pointer",
                fontWeight: 500,
                transition: "background 0.2s",
              }}
            >
              {isDownloading
                ? progress !== null
                  ? `${progress}%`
                  : "Downloading..."
                : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
