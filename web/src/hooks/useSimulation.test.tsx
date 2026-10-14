import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { useSimulation } from "@/hooks";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function renderSimulation() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSimulation(), { wrapper });
}

describe("useSimulation", () => {
  it("shows offline when the server is down", async () => {
    server.use(http.get("*/state", () => HttpResponse.error()));

    const { result } = renderSimulation();

    await waitFor(() => expect(result.current.connection).toBe("offline"));
  });
});
