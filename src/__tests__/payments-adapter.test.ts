import { describe, expect, it } from "vitest";

describe("IPS payment adapter scaffolding", () => {
  it("creates a valid adapter instance shape", () => {
    const adapter = {
      initiate: async () => ({ redirectUrl: "https://example.test" }),
      verify: async () => ({ success: true, gatewayTxnId: "txn-1", amount: 100, rawResponse: {} }),
    };

    expect(adapter.initiate).toBeTypeOf("function");
    expect(adapter.verify).toBeTypeOf("function");
  });
});
