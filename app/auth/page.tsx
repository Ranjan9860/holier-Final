import AuthForm from "@/components/Auth/AuthForm";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { returnTo: value } = await searchParams;
  const returnTo = Array.isArray(value) ? value[0] : value;
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/auth") ? returnTo : "/account";
  return <AuthForm returnTo={safeReturnTo} />;
}
