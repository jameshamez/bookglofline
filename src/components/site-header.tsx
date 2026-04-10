import Link from "next/link";
import type { Session } from "next-auth";
import { AuthButton } from "@/components/auth-button";

type SiteHeaderProps = {
  session: Session | null;
  lineReady: boolean;
};

export function SiteHeader({ session, lineReady }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(248,244,235,0.86)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-[--color-moss]">
            LINE GOLF
          </Link>
          <p className="text-sm text-[--color-text-soft]">
            Tee time booking พร้อม LINE Login
          </p>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-[--color-text]"
          >
            หน้าแรก
          </Link>
          <Link
            href="/my-bookings"
            className="rounded-full px-4 py-2 text-sm font-medium text-[--color-text]"
          >
            การจองของฉัน
          </Link>
          <AuthButton
            isAuthenticated={Boolean(session?.user)}
            disabled={!lineReady}
          />
        </nav>
      </div>
    </header>
  );
}
