import Link from "next/link";
import Logo from "@/components/Logo";
import ReportView from "@/components/ReportView";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            New audit
          </Link>
        </div>
      </header>
      <ReportView domain={decoded} />
    </main>
  );
}
