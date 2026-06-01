import { createFileRoute, redirect } from "@tanstack/react-router";

/** Compatibilidade: /pagamento redireciona para a home com query (rota / sempre existe no build). */
export const Route = createFileRoute("/pagamento")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: String(search.orderId ?? "").trim(),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/",
      search: { orderId: search.orderId, pix: "1" },
    });
  },
});
