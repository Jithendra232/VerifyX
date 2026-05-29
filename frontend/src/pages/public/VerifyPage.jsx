import { useCallback, useRef, useState } from "react";
import ToastStack from "../../components/common/ToastStack";
import QrScanner from "../../components/scanner/QrScanner";
import { API_BASE_URL } from "../../config/api";
import { saveVerificationRecord } from "../../utils/verificationHistory";

function extractProductIdFromQr(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    const id = parsed.productId || parsed.product_id || parsed.id || parsed.product;
    return typeof id === "string" ? id.trim() : "";
  } catch {
    if (value.startsWith("{") || value.startsWith("[")) return "";
  }

  try {
    const url = new URL(value);
    const queryId =
      url.searchParams.get("productId") ||
      url.searchParams.get("product_id") ||
      url.searchParams.get("id");
    if (queryId) return queryId.trim();

    const pathId = url.pathname.split("/").filter(Boolean).at(-1);
    return pathId ? decodeURIComponent(pathId).trim() : "";
  } catch {
    return /\s/.test(value) ? "" : value;
  }
}

function getBrowserLocation() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "browser",
        });
      },
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 2500 }
    );
  });
}

function ResultCard({ result }) {
  if (!result) return null;

  const status = String(result.status || result.verificationStatus || result.result || "").toLowerCase();
  const suspicious =
    result.success === false ||
    status.includes("counterfeit") ||
    status.includes("fake") ||
    status.includes("suspicious") ||
    status.includes("invalid");

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${suspicious ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Verification Result</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {suspicious ? "Counterfeit or Suspicious" : "Authentic Product"}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${suspicious ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
          {suspicious ? "Review required" : "Verified"}
        </span>
      </div>
      <pre className="mt-4 max-h-80 overflow-x-auto rounded-lg border border-white/70 bg-white/80 p-3 text-xs text-slate-700">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function VerifyPage() {
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [toasts, setToasts] = useState([]);
  const [result, setResult] = useState(null);
  const activeRequestRef = useRef(false);
  const lastScannedIdRef = useRef("");

  const addToast = useCallback((toast) => {
    const id = `${Date.now()}-${toast.title}`;
    setToasts((current) => [{ id, ...toast }, ...current.filter((item) => item.title !== toast.title)].slice(0, 3));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const verifyProduct = useCallback(async (id, source = "manual") => {
    const normalizedId = String(id || "").trim();

    if (!normalizedId) {
      setResult(null);
      setError(source === "scan" ? "Malformed QR code: no product ID found." : "Enter a product ID");
      addToast({ type: "warning", title: "Invalid QR data", message: "No product ID was found in the scanned code." });
      return;
    }

    if (activeRequestRef.current) {
      setNotice("Verification already in progress. Duplicate scan ignored.");
      return;
    }

    if (source === "scan" && lastScannedIdRef.current === normalizedId) {
      setNotice("Duplicate QR scan ignored.");
      return;
    }

    if (source === "scan") {
      lastScannedIdRef.current = normalizedId;
    }

    activeRequestRef.current = true;
    setProductId(normalizedId);
    setLoading(true);
    setError("");
    setNotice(source === "scan" ? "QR code captured. Verifying product..." : "");
    setResult(null);

    try {
      const location = await getBrowserLocation();
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: normalizedId, location }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (source === "scan") {
          const suspiciousResult = {
            success: false,
            status: "suspicious",
            productId: normalizedId,
            message: data.message || "Product could not be verified.",
          };
          setResult(suspiciousResult);
          saveVerificationRecord({
            productId: normalizedId,
            source,
            status: "suspicious",
            message: suspiciousResult.message,
          });
          addToast({ type: "warning", title: "Suspicious product", message: suspiciousResult.message });
        } else {
          setError(data.message || "Verification failed");
          addToast({ type: "error", title: "Verification failed", message: data.message || "Verification failed" });
        }
      } else {
        setResult(data);
        if (!location) {
          setNotice("Verification completed. Location was not captured because browser permission was unavailable or denied.");
        }
        saveVerificationRecord({
          productId: normalizedId,
          source,
          status: data.status || data.verificationStatus || "verified",
          message: data.message || "Product verified successfully.",
        });
        addToast({ type: "success", title: "Product verified", message: "Verification completed successfully." });
      }
    } catch {
      setError("Network error");
      addToast({ type: "error", title: "Network error", message: "Unable to complete verification right now." });
      if (source === "scan") {
        lastScannedIdRef.current = "";
      }
    } finally {
      activeRequestRef.current = false;
      setLoading(false);
    }
  }, [addToast]);

  const handleVerify = () => {
    setNotice("");
    void verifyProduct(productId, "manual");
  };

  const handleScanSuccess = useCallback(
    (decodedText) => {
      const scannedProductId = extractProductIdFromQr(decodedText);
      void verifyProduct(scannedProductId, "scan");
    },
    [verifyProduct]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastStack items={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Product Verification</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">Verify product authenticity</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Enter a product ID manually or scan a QR code. Valid, suspicious, and malformed QR data are handled without changing the verify API.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Manual Verification</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  setNotice("");
                  lastScannedIdRef.current = "";
                }}
                placeholder="Enter product ID"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </section>

          <QrScanner onScanSuccess={handleScanSuccess} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Verification Status</h2>
            <p className="mt-3 text-sm text-slate-600">
              {loading ? "Verification request is running..." : "Ready for manual lookup or one QR scan at a time."}
            </p>
            {notice ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{notice}</p> : null}
            {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          </section>

          <ResultCard result={result} />
        </aside>
      </main>
    </div>
  );
}

export default VerifyPage;
