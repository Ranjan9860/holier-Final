"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Unable to load the store</h1>
      <p>Please check the storefront API and try again.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
