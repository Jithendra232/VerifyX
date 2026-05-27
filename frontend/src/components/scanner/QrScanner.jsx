import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

const READER_ID = "verify-qr-reader";
const SCAN_CONFIG = {
  fps: 8,
  qrbox: { width: 240, height: 240 },
  aspectRatio: 1,
};

function QrScanner({ onScanSuccess }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const runningRef = useRef(false);
  const startingRef = useRef(false);
  const scanLockedRef = useRef(false);
  const startTokenRef = useRef(0);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    startTokenRef.current += 1;
    startingRef.current = false;

    if (!scanner) {
      runningRef.current = false;
      setStatus("idle");
      return;
    }

    try {
      if (runningRef.current) {
        await scanner.stop();
      }
    } catch {
      // The camera may already be stopped during rapid route changes.
    }

    try {
      scanner.clear();
    } catch {
      // The reader node may already be gone during unmount cleanup.
    }

    scannerRef.current = null;
    runningRef.current = false;
    setStatus("idle");
  }, []);

  const startScanner = useCallback(async () => {
    if (runningRef.current || startingRef.current || scannerRef.current) return;

    setError("");
    setStatus("starting");
    startingRef.current = true;
    scanLockedRef.current = false;
    const startToken = startTokenRef.current + 1;
    startTokenRef.current = startToken;

    const scanner = new Html5Qrcode(READER_ID, false);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        SCAN_CONFIG,
        async (decodedText) => {
          if (scanLockedRef.current) return;

          scanLockedRef.current = true;
          setStatus("detected");
          await stopScanner();
          onScanSuccess(decodedText);
        },
        () => {}
      );

      if (scannerRef.current !== scanner || startTokenRef.current !== startToken) {
        try {
          await scanner.stop();
        } catch {
          // Scanner was stopped before startup completed.
        }
        try {
          scanner.clear();
        } catch {
          // Reader cleanup already completed.
        }
        return;
      }

      runningRef.current = true;
      startingRef.current = false;
      setStatus("scanning");
    } catch (startError) {
      scannerRef.current = null;
      runningRef.current = false;
      startingRef.current = false;
      setStatus("idle");
      setError(startError?.message || "Camera permission was denied or no camera was found.");
    }
  }, [onScanSuccess, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const scannerActive = status === "starting" || status === "scanning";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">QR Scanner</h2>
          <p className="mt-1 text-sm text-slate-500">
            Scan a product QR code with one active camera session at a time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startScanner}
            disabled={scannerActive}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "starting" ? "Starting..." : "Start Scanner"}
          </button>
          <button
            type="button"
            onClick={stopScanner}
            disabled={!scannerActive}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop Scanner
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-3">
        <div id={READER_ID} className="min-h-[260px] w-full text-white" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          Status: {status}
        </span>
        {error ? <span className="text-red-600">{error}</span> : null}
      </div>
    </section>
  );
}

export default QrScanner;
