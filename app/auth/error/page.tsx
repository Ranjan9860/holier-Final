import Link from "next/link";

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message = "Social login failed." } = await searchParams;
  return <main><h1>Unable to sign in</h1><p>{message}</p><Link href="/auth">Back to sign in</Link></main>;
}
