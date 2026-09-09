"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { storefrontRequest } from "@/lib/api/client";

export type Customer = { id: string; name: string; email: string; phone?: string | null; image?: string | null; gender?: string | null };
type Credentials = { email: string; password: string; remember_me?: boolean };
type AuthContextType = {
  customer: Customer | null; loading: boolean; notice: string;
  login: (credentials: Credentials) => Promise<void>;
  register: (details: Credentials & { name: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (details: { token: string; email: string; password: string; password_confirmation: string }) => Promise<string>;
  socialLogin: (provider: "google") => Promise<void>;
  exchangeSocialCode: (code: string) => Promise<void>;
  refreshCustomer: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_MARKER = "holier-authenticated";

function customerFrom(payload: { customer?: Customer | { data: Customer }; data?: Customer }): Customer {
  const customer = payload.customer && "data" in payload.customer ? payload.customer.data : payload.customer;
  if (!customer && !payload.data) throw new Error("Customer data missing from response.");
  return (customer || payload.data) as Customer;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const refreshCustomer = useCallback(async () => {
    try {
      const payload = await storefrontRequest<{ data: Customer }>("customer/profile");
      setCustomer(customerFrom(payload));
    } catch {
      localStorage.removeItem(AUTH_MARKER);
      setCustomer(null);
    }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local storage is the persisted session hint.
    if (localStorage.getItem(AUTH_MARKER)) refreshCustomer();
    else setLoading(false);
  }, [refreshCustomer]);

  const mergeGuestState = async () => {
    const jobs: Array<{ key: string; request: Promise<unknown> }> = [];
    if (localStorage.getItem("holier-cart-token")) jobs.push({ key: "holier-cart-token", request: storefrontRequest("cart/merge", { method: "POST" }, "cart") });
    if (localStorage.getItem("holier-wishlist-token")) jobs.push({ key: "holier-wishlist-token", request: storefrontRequest("wishlist/merge", { method: "POST" }, "wishlist") });
    const results = await Promise.allSettled(jobs.map((job) => job.request));
    results.forEach((result, index) => { if (result.status === "fulfilled") localStorage.removeItem(jobs[index].key); });
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    setNotice(failures.map((result) => result.reason instanceof Error ? result.reason.message : "Guest data could not be merged.").join(" "));
    window.dispatchEvent(new Event("holier-auth-changed"));
  };
  const acceptAuth = async (payload: { customer?: Customer | { data: Customer }; data?: Customer }) => {
    setCustomer(customerFrom(payload));
    localStorage.setItem(AUTH_MARKER, "1");
    await mergeGuestState();
  };
  const login = async (credentials: Credentials) => acceptAuth(await storefrontRequest("customer/login", { method: "POST", body: JSON.stringify(credentials) }));
  const register = async (details: Credentials & { name: string }) => acceptAuth(await storefrontRequest("customer/register", { method: "POST", body: JSON.stringify(details) }));
  const logout = async () => {
    await storefrontRequest("customer/logout", { method: "POST" });
    localStorage.removeItem(AUTH_MARKER);
    setCustomer(null); window.dispatchEvent(new Event("holier-auth-changed"));
  };
  const forgotPassword = async (email: string) => (await storefrontRequest<{ message: string }>("customer/forgot-password", { method: "POST", body: JSON.stringify({ email }) })).message;
  const resetPassword: AuthContextType["resetPassword"] = async (details) => (await storefrontRequest<{ message: string }>("customer/reset-password", { method: "POST", body: JSON.stringify(details) })).message;
  const socialLogin = async (provider: "google") => {
    const { redirect_url } = await storefrontRequest<{ redirect_url: string }>(`customer/auth/redirect/${provider}`);
    window.location.assign(redirect_url);
  };
  const exchangeSocialCode = async (code: string) => acceptAuth(await storefrontRequest("customer/auth/exchange", { method: "POST", body: JSON.stringify({ code }) }));

  return <AuthContext.Provider value={{ customer, loading, notice, login, register, logout, forgotPassword, resetPassword, socialLogin, exchangeSocialCode, refreshCustomer }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
