import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('./OrderCancellation.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
class StorefrontError extends Error { constructor(message, errors = {}) { super(message); this.errors = errors; } }
function load(client, hooks) {
  const module = { exports: {} };
  runInNewContext(compiled, { exports: module.exports, require: (name) => name === '@/lib/api/client' ? { storefrontRequest: client, StorefrontError } : name.endsWith('.css') ? { default: {} } : name === 'react' && hooks ? hooks : require(name) });
  return module.exports.default;
}
function find(element, type) {
  if (!element || typeof element !== 'object') return;
  if (element.type === type) return element;
  for (const child of [element.props?.children].flat(Infinity)) { const match = find(child, type); if (match) return match; }
}
const submitBtn = (el) => { if (!el || typeof el !== 'object') return; if (el.type === 'button' && el.props?.type === 'submit') return el; for (const c of [el.props?.children].flat(Infinity)) { const m = submitBtn(c); if (m) return m; } };
const open = (render) => find(render(), 'button').props.onClick();
function interactive(client, props) {
  const state = []; let index = 0;
  const Component = load(client, { useState: (initial) => { const slot = index++; if (!(slot in state)) state[slot] = initial; return [state[slot], (value) => { state[slot] = value; }]; } });
  return () => { index = 0; return Component(props); };
}

test('renders each outcome without claiming cancellation before actual cancellation', () => {
  const Component = load();
  const render = (order) => renderToStaticMarkup(React.createElement(Component, { order, path: 'order/1', onResolved() {} }));
  assert.match(render({ order_status: 'cancelled', cancellation_request_status: 'approved' }), />Cancelled</);
  assert.match(render({ order_status: 'processing', cancellation_request_status: 'pending' }), /awaiting review/);
  assert.doesNotMatch(render({ order_status: 'processing', cancellation_request_status: 'pending' }), /<button/);
  const rejected = render({ order_status: 'processing', cancellation_request_status: 'rejected', cancellation_request_resolution_note: '<unsafe>' });
  assert.match(rejected, /Request rejected/); assert.match(rejected, /&lt;unsafe&gt;/);
  assert.match(render({ return_required: true }), /Return required/);
  assert.equal(render({ return_required: true, can_request_return: true }), '');
  assert.match(render({ can_request_cancellation: true }), /<button/);
  assert.equal(render({ can_request_cancellation: false }), '');
  assert.equal(render({ order_status: 'processing', cancellation_request_status: 'approved' }), '');
});

test('validates the reason and submits the guest token using the supplied guest path', async () => {
  const calls = []; let resolved;
  const render = interactive(async (...args) => { calls.push(args); return { data: { order_status: 'cancelled', cancellation_request_status: 'approved' } }; }, { order: { can_request_cancellation: true }, path: 'guest/order/ORD-1', guestAccessToken: 'secret', onResolved: (result) => { resolved = result; } });
  open(render);
  await find(render(), 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(calls.length, 0); assert.match(JSON.stringify(render()), /Enter a reason/);
  find(render(), 'textarea').props.onChange({ target: { value: 'Please cancel' } });
  await find(render(), 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(calls[0][0], 'guest/order/ORD-1/cancellation-request');
  assert.deepEqual(JSON.parse(calls[0][1].body), { reason: 'Please cancel', guest_access_token: 'secret' });
  assert.equal(resolved.order_status, 'cancelled'); assert.equal(resolved.can_request_cancellation, false);
});

test('shows server validation and disables controls while submitting', async () => {
  let reject;
  const render = interactive(() => new Promise((resolve, failure) => { reject = failure; }), { order: { can_request_cancellation: true }, path: 'order/1', onResolved() {} });
  open(render);
  find(render(), 'textarea').props.onChange({ target: { value: 'Reason' } });
  const submitted = find(render(), 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(submitBtn(render()).props.disabled, true);
  assert.equal(find(render(), 'textarea').props.disabled, true);
  reject(new StorefrontError('Validation failed', { reason: ['Use plain text.'] })); await submitted;
  assert.match(JSON.stringify(render()), /Use plain text/);
  assert.equal(find(render(), 'textarea').props['aria-invalid'], true);
  assert.equal(submitBtn(render()).props.disabled, false);
});
