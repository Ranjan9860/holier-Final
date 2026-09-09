import SocialCallback from "@/components/Auth/SocialCallback";

export default async function AuthCallbackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = "" } = await searchParams;
  return <SocialCallback code={code} />;
}
