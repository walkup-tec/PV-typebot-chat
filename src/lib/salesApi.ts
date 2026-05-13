const resolveInjectedApiBase = (): string => {
  if (typeof window === "undefined") return "";
  return String(
    (window as Window & { __TYPEBOT_SAAS_API_BASE__?: string }).__TYPEBOT_SAAS_API_BASE__ ?? "",
  ).trim();
};

export const resolveApiBase = (): string => {
  const injected = resolveInjectedApiBase();
  if (injected) return injected.replace(/\/$/, "");
  return String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333").trim().replace(/\/$/, "");
};

export const resolvePainelUrl = (): string =>
  String(import.meta.env.VITE_PAINEL_URL ?? "http://localhost:5173").trim().replace(/\/$/, "");

export type SalesSubscriptionCycle = "MONTHLY" | "YEARLY";

export const createSalesSubscription = async (input: {
  customerName: string;
  ownerEmail: string;
  cpfCnpj: string;
  cycle: SalesSubscriptionCycle;
}): Promise<{ subscriptionId: string; invoiceUrl: string | null }> => {
  const response = await fetch(`${resolveApiBase()}/api/public/sales/subscriptions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { subscriptionId?: string; invoiceUrl?: string | null; message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Erro ao processar assinatura.");
  }
  return {
    subscriptionId: String(payload.subscriptionId ?? ""),
    invoiceUrl: payload.invoiceUrl ?? null,
  };
};
