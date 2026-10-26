"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { StorefrontError } from "@/lib/api/client";
import styles from "./AuthForm.module.css";

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fieldError = (name: string) => errors[name]?.[0];
  const [pending, setPending] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (password !== confirmation) return setErrors({ password_confirmation: ["Passwords do not match."] });
    setPending(true);
    try {
      toast.success(await resetPassword({ token, email, password, password_confirmation: confirmation }));
      router.push("/auth");
    } catch (reason) {
      if (reason instanceof StorefrontError) setErrors(reason.errors);
      toast.error(reason instanceof Error ? reason.message : "Password reset failed.");
    } finally { setPending(false); }
  };
  return <section className={styles.authSection}><div className={styles.authContainer}>
    <div className={styles.heading}><h1>Reset Password</h1><p>{email}</p></div>
    <form className={styles.authForm} onSubmit={submit} noValidate>
      <div className={styles.inputGroup}>
        <label htmlFor="password">New password</label>
        <input className={`${styles.textInput} ${fieldError("password") ? styles.invalid : ""}`} id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {fieldError("password") && <span className={styles.errorText}>{fieldError("password")}</span>}
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="confirmation">Confirm password</label>
        <input className={`${styles.textInput} ${fieldError("password_confirmation") ? styles.invalid : ""}`} id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
        {fieldError("password_confirmation") && <span className={styles.errorText}>{fieldError("password_confirmation")}</span>}
      </div>
      <button className={styles.submitButton} disabled={pending}>{pending ? "Please wait…" : "Reset password"}</button>
    </form>
  </div></section>;
}
