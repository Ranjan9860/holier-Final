import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("./OrderPayment.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
function load(client = () => {}, submit = () => true, hooks) {
  const compiledModule = { exports: {} };
  runInNewContext(compiled, { exports: compiledModule.exports, Error, require: (name) => name === "@/lib/api/client" ? { storefrontRequest: client } : name === "@/lib/esewa" ? { submitEsewaPayment: submit } : name.endsWith(".css") ? { default: {} } : name === "react" && hooks ? hooks : require(name) });
  return compiledModule.exports.default;
}
const payment = { gateway: "esewa", status: "failed", can_retry: true };

test("retry is visible only for eligible eSewa orders", () => {
  const Component = load();
  const paidHtml = renderToStaticMarkup(require("react").createElement(Component, { payment: { ...payment, status: "paid", can_retry: false, reference: "000HAXX" }, path: "order/id" }));
  assert.match(paidHtml, /paid/);
  assert.doesNotMatch(paidHtml, /000HAXX|Reference:/);
  assert.match(renderToStaticMarkup(require("react").createElement(Component, { payment, path: "order/id" })), /Retry payment/);
  assert.match(renderToStaticMarkup(require("react").createElement(Component, { payment: { ...payment, status: "pending", can_retry: false }, path: "order/id" })), /Retry payment/);
  for (const summary of [undefined, { ...payment, gateway: "cash" }, { ...payment, status: "paid", can_retry: false }, { ...payment, status: "review", can_retry: false }]) {
    assert.doesNotMatch(renderToStaticMarkup(require("react").createElement(Component, { payment: summary, path: "order/id" })), /Retry payment/);
  }
});

test("customer and guest retries POST the correct credentials and submit the returned form once", async () => {
  for (const guestAccessToken of [undefined, "guest-secret"]) {
    const requests = [];
    const forms = [];
    const form = { gateway: "esewa", form: { method: "POST", action: "sandbox", fields: {} } };
    const Component = load(async (...args) => { requests.push(args); return { data: { payment: form } }; }, value => { forms.push(value); return true; }, { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }) });
    const path = guestAccessToken ? "guest/order/ORDER-1" : "order/id";
    const element = Component({ payment: { ...payment, status: "pending", can_retry: false }, path, guestAccessToken });
    const button = element.props.children.find(child => child?.type === "button");
    await button.props.onClick();
    await button.props.onClick();
    assert.equal(requests.length, 1);
    assert.equal(requests[0][0], `${path}/payments/esewa/retry`);
    assert.equal(requests[0][1].method, "POST");
    assert.deepEqual(JSON.parse(requests[0][1].body), guestAccessToken ? { guest_access_token: guestAccessToken } : {});
    assert.equal(forms[0], form);
  }
});


test("a rejected retry displays an error and allows another attempt without submitting a form", async () => {
  const states = [];
  let calls = 0;
  let forms = 0;
  const Component = load(async () => { calls++; throw new Error("Payment is still pending."); }, () => { forms++; }, { useState: initial => [initial, value => states.push(value)], useRef: initial => ({ current: initial }) });
  const element = Component({ payment, path: "order/id" });
  const button = element.props.children.find(child => child?.type === "button");
  await button.props.onClick();
  await button.props.onClick();
  assert.equal(calls, 4);
  assert.equal(forms, 0);
  assert.ok(states.includes("Payment is still pending."));
  assert.equal(states.at(-1), false);
});


test("a pending retry that discovers payment is paid refreshes the order without opening another checkout", async () => {
  const resolved = [];
  const states = [];
  const requests = [];
  let forms = 0;
  const paid = { ...payment, status: "paid", can_retry: false };
  const Component = load(async (path, options) => {
    requests.push([path, options]);
    if (options?.method === "POST") throw new Error("Resolve the existing payment before trying again.");
    return { data: { payment: paid, order_status: "processing" } };
  }, () => { forms++; }, { useState: initial => [initial, value => states.push(value)], useRef: initial => ({ current: initial }) });
  const element = Component({ payment: { ...payment, status: "pending", can_retry: false }, path: "guest/order/ORDER-1", guestAccessToken: "a+b", onResolved: value => resolved.push(value) });
  await element.props.children.find(child => child?.type === "button").props.onClick();
  assert.equal(forms, 0);
  assert.equal(resolved[0].payment, paid);
  assert.equal(requests[1][0], "guest/order/ORDER-1?guest_access_token=a%2Bb");
  assert.equal(states.at(-2), "");
});
