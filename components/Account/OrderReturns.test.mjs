import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('./OrderReturns.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
class StorefrontError extends Error { constructor(message, errors = {}) { super(message); this.errors = errors; } }
function load(client, hooks) {
  const module = { exports: {} };
  let key = 0;
  runInNewContext(compiled, { exports: module.exports, crypto: { randomUUID: () => `request-${++key}` }, require: name => name === '@/lib/api/client' ? { storefrontRequest: client, StorefrontError } : name.endsWith('.css') ? { default: {} } : name === 'react' && hooks ? hooks : require(name) });
  return module.exports.default;
}
function findAll(element, type) {
  if (!element || typeof element !== 'object') return [];
  return [...(element.type === type ? [element] : []), ...[element.props?.children].flat(Infinity).flatMap(child => findAll(child, type))];
}
const open = render => findAll(render(), 'button').find(b => b.props.onClick).props.onClick();
function interactive(client, props) {
  const state = []; let index = 0;
  const Component = load(client, { useState: initial => { const slot = index++; if (!(slot in state)) state[slot] = initial; return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }]; }, useRef: initial => { const slot = index++; if (!(slot in state)) state[slot] = { current: initial }; return state[slot]; } });
  return () => { index = 0; return Component(props); };
}
const eligible = { can_request_return: true, returnable_items: [{ sale_item_id: 'item-1', name: 'Shirt', unit: 'pc', sold_quantity: 5, remaining_quantity: 3, requestable_quantity: 2 }] };

test('shows eligible quantities and request progress without promising refunds', () => {
  const Component = load();
  const render = order => renderToStaticMarkup(React.createElement(Component, { order, path: 'order/1', onResolved() {} }));
  assert.equal(render({}), '');
  assert.match(render(eligible), /Request return/);
  assert.match(render(eligible), /Approval does not issue a refund/);
  const html = render({ return_requests: [{ id: 'r', status: 'completed', reason: '<unsafe>', requested_resolution: 'refund', can_withdraw: false, items: [{ sale_item_id: 'item-1', name: 'Shirt', requested_quantity: 2, approved_quantity: 2, received_quantity: 1 }] }] });
  assert.match(html, /Return completed/); assert.match(html, /handled separately/); assert.match(html, /&lt;unsafe&gt;/); assert.doesNotMatch(html, /<button/);
});

test('validates quantities and submits only selected sale items with guest token', async () => {
  const calls = []; let result;
  const render = interactive(async (...args) => { calls.push(args); return { data: { can_request_return: false, return_requests: [] } }; }, { order: eligible, path: 'guest/order/ORD-1', guestAccessToken: 'secret', onResolved: data => { result = data; } });
  open(render);
  assert.match(JSON.stringify(render()), /up to|2/);
  await findAll(render(), 'form')[0].props.onSubmit({ preventDefault() {} }); assert.equal(calls.length, 0);
  findAll(render(), 'textarea')[0].props.onChange({ target: { value: 'Wrong size' } });
  findAll(render(), 'input')[0].props.onChange({ target: { value: '3' } });
  await findAll(render(), 'form')[0].props.onSubmit({ preventDefault() {} }); assert.equal(calls.length, 0);
  findAll(render(), 'input')[0].props.onChange({ target: { value: '2' } });
  await findAll(render(), 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(calls[0][0], 'guest/order/ORD-1/return-requests');
  assert.deepEqual(JSON.parse(calls[0][1].body), { reason: 'Wrong size', notes: null, requested_resolution: 'refund', items: [{ sale_item_id: 'item-1', quantity: '2' }], guest_access_token: 'secret', submission_key: 'request-1' });
  assert.equal(result.can_request_return, false);
});

test('reuses submission key on retry and exposes server errors while disabling the form', async () => {
  const calls = []; let reject;
  const render = interactive((...args) => { calls.push(args); return new Promise((resolve, failure) => { reject = failure; }); }, { order: eligible, path: 'order/1', onResolved() {} });
  open(render);
  findAll(render(), 'textarea')[0].props.onChange({ target: { value: 'Wrong size' } });
  findAll(render(), 'input')[0].props.onChange({ target: { value: '1' } });
  let promise = findAll(render(), 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(findAll(render(), 'fieldset')[0].props.disabled, true);
  reject(new StorefrontError('Validation failed', { 'items.0.quantity': ['Quantity already reserved.'] })); await promise;
  assert.match(JSON.stringify(render()), /Quantity already reserved/);
  promise = findAll(render(), 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(JSON.parse(calls[0][1].body).submission_key, JSON.parse(calls[1][1].body).submission_key);
  reject(new Error('Try again')); await promise;
});

test('withdraws a guest request through the matching authenticated order path', async () => {
  const calls = []; let result;
  const render = interactive(async (...args) => { calls.push(args); return { data: { return_requests: [] } }; }, { order: { return_requests: [{ id: 'request-1', status: 'approved_awaiting_item', reason: 'Size', requested_resolution: 'exchange', can_withdraw: true, items: [] }] }, path: 'guest/order/ORD-1', guestAccessToken: 'secret', onResolved: data => { result = data; } });
  await findAll(render(), 'button')[0].props.onClick();
  assert.equal(calls[0][0], 'guest/order/ORD-1/return-requests/request-1/withdraw');
  assert.deepEqual(JSON.parse(calls[0][1].body), { guest_access_token: 'secret' });
  assert.equal(result.return_requests.length, 0);
});
