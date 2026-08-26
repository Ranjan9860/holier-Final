"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";

import styles from "./AuthForm.module.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (isLogin) {
      console.log("Login:", {
        email: formData.email,
        password: formData.password,
      });
    } else {
      console.log("Signup:", formData);
    }
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
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {/* Name fields - Signup only */}
          {!isLogin && (
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>

                <input
                  className={styles.textInput}
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>

                <input
                  className={styles.textInput}
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>

            <div className={styles.inputWrapper}>
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
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>

              {isLogin && (
                <button
                  type="button"
                  className={styles.forgotPassword}
                  onClick={() => console.log("Forgot password")}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div className={styles.inputWrapper}>
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
          </div>

          {/* Confirm Password - Signup only */}
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className={styles.inputWrapper}>
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
            </div>
          )}

          {/* Terms - Signup only */}
          {!isLogin && (
            <label className={styles.terms}>
              <input type="checkbox" required />

              <span>
                I agree to the <a href="#">Terms & Conditions</a>
              </span>
            </label>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitButton}>
            {isLogin ? "Login" : "Create Account"}
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
            onClick={() => console.log("Google login")}
          >
            <span className={styles.googleIcon}>G</span>
            Continue with Google
          </button>

          <button
            type="button"
            className={styles.facebookButton}
            onClick={() => console.log("Facebook login")}
          >
            <FontAwesomeIcon icon={faFacebookF} />
            Continue with Facebook
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
