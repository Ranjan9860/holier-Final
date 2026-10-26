import assert from "node:assert/strict";
import test from "node:test";
import { submitEsewaPayment } from "./esewa.ts";

test("submits all signed fields unchanged to the sandbox and live endpoints", () => {
  const originalDocument = globalThis.document;
  const originalForm = globalThis.HTMLFormElement;
  try {
    let appended;
    const submissions = [];
    globalThis.document = {
      createElement: () => ({ children: [], appendChild(input) { this.children.push(input); } }),
      body: { appendChild(form) { appended = form; } },
    };
    globalThis.HTMLFormElement = { prototype: { submit() { submissions.push(this); } } };
    for (const host of ["rc-epay", "epay"]) {
      const payment = { gateway: "esewa", form: { method: "POST", action: `https://${host}.esewa.com.np/api/epay/main/v2/form`, fields: { total_amount: "100.00", signature: "a+b/=", success_url: "https://backend.test/return?signature=a%2Bb", submit: "unchanged" } } };
      assert.equal(submitEsewaPayment(payment), true);
      const submitted = submissions.at(-1);
      assert.equal(submitted, appended);
      assert.equal(submitted.method, "POST");
      assert.equal(submitted.action, payment.form.action);
      assert.equal(submitted.hidden, true);
      assert.deepEqual(Object.fromEntries(submitted.children.map(input => [input.name, input.value])), payment.form.fields);
      assert.ok(submitted.children.every(input => input.type === "hidden"));
    }
    assert.equal(submitEsewaPayment(), false);
    for (const form of [{ method: "GET", action: "https://epay.esewa.com.np/api/epay/main/v2/form", fields: {} }, { method: "POST", action: "https://attacker.test", fields: {} }]) {
      assert.throws(() => submitEsewaPayment({ gateway: "esewa", form }), /Invalid eSewa/);
    }
  } finally {
    globalThis.document = originalDocument;
    globalThis.HTMLFormElement = originalForm;
  }
});
