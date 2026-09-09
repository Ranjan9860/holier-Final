"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./AuthForm.module.css";

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) return setMessage("Passwords do not match.");
    setPending(true);
    try {
      setMessage(await resetPassword({ token, email, password, password_confirmation: confirmation }));
      router.push("/auth");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Password reset failed."); }
    finally { setPending(false); }
  };
  return <section className={styles.authSection}><div className={styles.authContainer}>
    <div className={styles.heading}><h1>Reset Password</h1><p>{email}</p></div>
    <form className={styles.authForm} onSubmit={submit}>
      <div className={styles.inputGroup}><label htmlFor="password">New password</label><input className={styles.textInput} id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <div className={styles.inputGroup}><label htmlFor="confirmation">Confirm password</label><input className={styles.textInput} id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
      {message && <p role="status">{message}</p>}
      <button className={styles.submitButton} disabled={pending}>{pending ? "Please wait…" : "Reset password"}</button>
    </form>
  </div></section>;
}
