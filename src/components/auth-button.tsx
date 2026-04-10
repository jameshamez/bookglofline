"use client";

import { signIn, signOut } from "next-auth/react";

type AuthButtonProps = {
  isAuthenticated: boolean;
  disabled?: boolean;
};

export function AuthButton({
  isAuthenticated,
  disabled = false,
}: AuthButtonProps) {
  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-[--color-moss]/30 bg-white/70 px-4 py-2 text-sm font-semibold text-[--color-moss] transition hover:bg-white"
      >
        ออกจากระบบ
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => signIn("line", { callbackUrl: "/my-bookings" })}
      className="rounded-full bg-[#06C755] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      เข้าสู่ระบบด้วย LINE
    </button>
  );
}
