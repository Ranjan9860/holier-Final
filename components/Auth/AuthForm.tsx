"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { StorefrontError } from "@/lib/api/client";

import styles from "./AuthForm.module.css";

export default function AuthForm({ returnTo }: { returnTo: string }) {
  const [isLogin, setIsLogin] = useState(true);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fieldError = (name: string) => errors[name]?.[0];
  const router = useRouter();
  const { login, register, forgotPassword, socialLogin, refreshCustomer } = useAuth();

  useEffect(() => {
    const completeSocialLogin = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "holier-social-auth-success") return;
      refreshCustomer().then(() => {
        window.dispatchEvent(new Event("holier-auth-changed"));
        sessionStorage.removeItem("holier-auth-return-to");
        router.replace(returnTo);
      }).catch((reason) => toast.error(reason instanceof Error ? reason.message : "Google login failed."));
    };
    window.addEventListener("message", completeSocialLogin);
    return () => window.removeEventListener("message", completeSocialLogin);
  }, [refreshCustomer, returnTo, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: ["Passwords do not match."] });
      return;
    }
    setPending(true);
    try {
      if (isLogin) await login({ email: formData.email, password: formData.password });
      else await register({ name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email, password: formData.password });
      router.replace(returnTo);
    } catch (reason) {
      if (reason instanceof StorefrontError) setErrors(reason.errors);
      toast.error(reason instanceof Error ? reason.message : "Authentication failed.");
    } finally { setPending(false); }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) return setErrors({ email: ["Enter your email address first."] });
    setPending(true);
    try {
      await forgotPassword(formData.email);
      toast.success("If an account exists for this email, a password reset link has been sent.");
    }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to send reset link."); }
    finally { setPending(false); }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <section className={styles.authSection}>
      <div className={styles.authContainer}>
        {/* Heading */}
        <div className={styles.heading}>
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>

          <p>
            {isLogin
              ? "Login to continue shopping with Holier."
              : "Create your Holier account and start shopping."}
          </p>
        </div>

        {/* Form */}
        {/* noValidate: defer to the backend's validation messages (shown via `errors`
            below) instead of the browser's native required/type=email popups. */}
        <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
          {/* Name fields - Signup only */}
          {!isLogin && (
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>

                <input
                  className={`${styles.textInput} ${fieldError("firstName") ? styles.invalid : ""}`}
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                {fieldError("firstName") && <span className={styles.errorText}>{fieldError("firstName")}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>

                <input
                  className={`${styles.textInput} ${fieldError("lastName") ? styles.invalid : ""}`}
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />

                {fieldError("lastName") && <span className={styles.errorText}>{fieldError("lastName")}</span>}
              </div>
            </div>
          )}

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>

            <div className={`${styles.inputWrapper} ${fieldError("email") ? styles.invalid : ""}`}>
              <Mail size={18} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {fieldError("email") && <span className={styles.errorText}>{fieldError("email")}</span>}
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>

              {isLogin && (
                <button
                  type="button"
                  className={styles.forgotPassword}
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div className={`${styles.inputWrapper} ${fieldError("password") ? styles.invalid : ""}`}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className={styles.passwordButton}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {fieldError("password") && <span className={styles.errorText}>{fieldError("password")}</span>}
          </div>

          {/* Confirm Password - Signup only */}
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className={`${styles.inputWrapper} ${fieldError("confirmPassword") ? styles.invalid : ""}`}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className={styles.passwordButton}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {fieldError("confirmPassword") && <span className={styles.errorText}>{fieldError("confirmPassword")}</span>}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitButton} disabled={pending}>
            {pending ? "Please wait…" : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span />
          <p>OR</p>
          <span />
        </div>

        {/* Social Login */}
        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.googleButton}
            onClick={() => { sessionStorage.setItem("holier-auth-return-to", returnTo); socialLogin("google").catch((reason) => toast.error(reason instanceof Error ? reason.message : "Google login failed.")); }}
          >
            <span className={styles.googleIcon}>G</span>
            Continue with Google
          </button>

        </div>

        {/* Switch Login / Signup */}
        <div className={styles.switchMode}>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>

          <button type="button" onClick={switchMode}>
            {isLogin ? "Create Account" : "Login"}
          </button>
        </div>
      </div>
    </section>
  );
}
