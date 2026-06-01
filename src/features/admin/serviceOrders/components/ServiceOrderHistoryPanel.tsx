export function ServiceOrderHistoryPanel() {
  return (
    <section className="rounded-lg border border-dashed border-border bg-bg-muted/20 p-5">
      <h2 className="text-base font-semibold text-text-primary">Status history</h2>
      <p className="mt-2 text-sm text-text-secondary">
        GET /api/order-status-histories is available, but OrderStatusHistoryDto field names are
        not documented in api-contract.md §10. This panel is deferred until the contract
        includes response fields (e.g. serviceOrderId, previous/new status, observation, date).
      </p>
    </section>
  );
}
