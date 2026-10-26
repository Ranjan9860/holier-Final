export type EsewaPayment = {
  gateway: "esewa";
  form: { method: "POST"; action: string; fields: Record<string, string> };
};

export function submitEsewaPayment(payment?: EsewaPayment): boolean {
  if (!payment) return false;
  const { form: checkout } = payment;
  const endpoints = [
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "https://epay.esewa.com.np/api/epay/main/v2/form",
  ];
  if (payment.gateway !== "esewa" || checkout?.method !== "POST" || !endpoints.includes(checkout.action) || !checkout.fields || Object.values(checkout.fields).some(value => typeof value !== "string")) {
    throw new Error("Invalid eSewa checkout form. Your order was created; check its payment status before retrying.");
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.action;
  form.hidden = true;
  for (const [name, value] of Object.entries(checkout.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  HTMLFormElement.prototype.submit.call(form);
  return true;
}
