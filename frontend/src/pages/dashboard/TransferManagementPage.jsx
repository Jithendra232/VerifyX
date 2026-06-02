import { useEffect, useMemo, useState } from "react";
import {
  DashboardError,
  DashboardLoading,
  DashboardPage,
  Panel,
  SimpleTable,
  StatsGrid,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";
import { useAuthSync } from "../../context/AuthSyncContext";
import {
  acceptTransferRequest,
  createTransferRequest,
  fetchEligibleTransferProducts,
  fetchTransferRecipients,
  fetchTransfers,
  rejectTransferRequest,
} from "../../services/transferService";
import { getBrowserLocation } from "../../utils/geoLocation";

const statusTone = {
  PENDING: "warning",
  ACCEPTED: "info",
  REJECTED: "danger",
  COMPLETED: "success",
};

function formatTransferType(value) {
  return String(value || "").replaceAll("_", " ").toLowerCase();
}

function TransferManagementPage() {
  const { getToken, mongoUser } = useAuthSync();
  const [products, setProducts] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [receiverRole, setReceiverRole] = useState("");
  const [transferType, setTransferType] = useState("");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [productId, setProductId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTransfers = async () => {
    const [incomingData, outgoingData] = await Promise.all([
      fetchTransfers(getToken, "incoming"),
      fetchTransfers(getToken, "outgoing"),
    ]);
    setIncoming(incomingData.transfers || []);
    setOutgoing(outgoingData.transfers || []);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!getToken) return;
      setLoading(true);
      setError("");

      try {
        const [productData, recipientData] = await Promise.all([
          fetchEligibleTransferProducts(getToken),
          fetchTransferRecipients(getToken),
        ]);

        if (cancelled) return;

        setProducts(productData.products || []);
        setRecipients(recipientData.users || []);
        setReceiverRole(recipientData.receiverRole || "");
        setTransferType(recipientData.transferType || "");
        await loadTransfers();
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load transfers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const pendingIncoming = useMemo(
    () => incoming.filter((transfer) => transfer.status === "PENDING").length,
    [incoming]
  );
  const pendingOutgoing = useMemo(
    () => outgoing.filter((transfer) => transfer.status === "PENDING").length,
    [outgoing]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setNotice("");

    if (!productId || !toUserId || !transferType) {
      setError("Select a product and receiver before creating a transfer.");
      return;
    }

    try {
      setSubmitting(true);
      const location = await getBrowserLocation();
      const response = await createTransferRequest(getToken, {
        productId,
        toUserId,
        transferType,
        notes,
        ...(location ? { location } : {}),
      });
      setNotice(response.message || "Transfer request created.");
      setProductId("");
      setToUserId("");
      setNotes("");
      await loadTransfers();
    } catch (err) {
      setError(err.message || "Failed to create transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (transferId, action) => {
    if (actionId) return;

    setError("");
    setNotice("");
    setActionId(`${action}-${transferId}`);

    try {
      const location = action === "accept" ? await getBrowserLocation() : null;
      const response =
        action === "accept"
          ? await acceptTransferRequest(getToken, transferId, location ? { location } : {})
          : await rejectTransferRequest(getToken, transferId);
      setNotice(response.message || "Transfer updated.");
      await loadTransfers();
    } catch (err) {
      setError(err.message || "Failed to update transfer");
    } finally {
      setActionId("");
    }
  };

  if (loading) return <DashboardLoading />;
  if (error && !products.length && !incoming.length && !outgoing.length) {
    return <DashboardError message={error} />;
  }

  const canInitiate = Boolean(transferType && receiverRole);

  return (
    <DashboardPage
      title="Transfer Management"
      subtitle="Create transfer requests, approve incoming custody changes, and review transfer status history."
    >
      <StatsGrid
        items={[
          { label: "Transferable Products", value: products.length, helper: "Currently owned", tone: "bg-blue-500" },
          { label: "Pending Incoming", value: pendingIncoming, helper: "Awaiting your approval", tone: "bg-amber-500" },
          { label: "Pending Outgoing", value: pendingOutgoing, helper: "Awaiting receiver action", tone: "bg-indigo-500" },
          { label: "Role Flow", value: receiverRole || "None", helper: mongoUser?.role || "Current role", tone: "bg-emerald-500" },
        ]}
      />

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}

      <Panel title="Transfer Product" subtitle="Initiate a pending transfer request for receiver approval.">
        {canInitiate ? (
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Product
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName} - {product.batchNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Receiver ({receiverRole})
              <select
                value={toUserId}
                onChange={(event) => setToUserId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select receiver</option>
                {recipients.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Optional transfer note"
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Creating..." : `Create ${formatTransferType(transferType)} Request`}
              </button>
            </div>
          </form>
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            This role does not initiate downstream transfers.
          </p>
        )}
      </Panel>

      <Panel title="Incoming Transfers" subtitle="Approve or reject transfer requests sent to you.">
        <SimpleTable
          columns={[
            { key: "product", header: "Product", render: (row) => row.product?.productName || "-" },
            { key: "from", header: "From", render: (row) => row.fromUser?.name || "-" },
            { key: "status", header: "Status", render: (row) => <StatusBadge tone={statusTone[row.status]}>{row.status}</StatusBadge> },
            { key: "createdAt", header: "Requested", render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                row.status === "PENDING" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={Boolean(actionId)}
                      onClick={() => handleAction(row._id, "accept")}
                      className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionId)}
                      onClick={() => handleAction(row._id, "reject")}
                      className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  "-"
                ),
            },
          ]}
          rows={incoming.map((item) => ({ ...item, id: item._id }))}
          emptyTitle="No incoming transfers"
          emptyDescription="Transfer requests sent to your account will appear here."
        />
      </Panel>

      <Panel title="Outgoing Transfers" subtitle="Track transfer requests you initiated.">
        <SimpleTable
          columns={[
            { key: "product", header: "Product", render: (row) => row.product?.productName || "-" },
            { key: "to", header: "To", render: (row) => row.toUser?.name || "-" },
            { key: "type", header: "Type", render: (row) => formatTransferType(row.transferType) },
            { key: "status", header: "Status", render: (row) => <StatusBadge tone={statusTone[row.status]}>{row.status}</StatusBadge> },
            { key: "updatedAt", header: "Updated", render: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-" },
          ]}
          rows={outgoing.map((item) => ({ ...item, id: item._id }))}
          emptyTitle="No outgoing transfers"
          emptyDescription="Transfer requests you create will appear here."
        />
      </Panel>
    </DashboardPage>
  );
}

export default TransferManagementPage;
