"use client";

import { useActionState } from "react";
import type { BookingActionState } from "@/app/actions";
import { createBookingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type BookingPanelProps = {
  teeTimeId: string;
  availableSlots: number;
  isAuthenticated: boolean;
  lineReady: boolean;
};

export function BookingPanel({
  teeTimeId,
  availableSlots,
  isAuthenticated,
  lineReady,
}: BookingPanelProps) {
  const initialState: BookingActionState = {
    status: "idle",
    message: "",
  };

  const [state, action] = useActionState(
    createBookingAction,
    initialState,
  );

  const canBook = isAuthenticated && lineReady && availableSlots > 0;

  return (
    <form action={action} className="space-y-3 rounded-[28px] bg-[--color-card] p-4">
      <input type="hidden" name="teeTimeId" value={teeTimeId} />
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
            จำนวนผู้เล่น
          </span>
          <select
            name="playerCount"
            defaultValue="1"
            disabled={!canBook}
            className="w-full rounded-2xl border border-[--color-border] bg-white px-4 py-3 text-sm outline-none transition focus:border-[--color-moss]"
          >
            {Array.from({ length: Math.min(4, availableSlots) || 1 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} คน
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
            หมายเหตุถึงสนาม
          </span>
          <input
            type="text"
            name="note"
            maxLength={200}
            disabled={!canBook}
            placeholder="เช่น ขอรถกอล์ฟ / ไปรวมก๊วน"
            className="w-full rounded-2xl border border-[--color-border] bg-white px-4 py-3 text-sm outline-none transition focus:border-[--color-moss]"
          />
        </label>
      </div>

      <SubmitButton
        label="จองรอบนี้"
        pendingLabel="กำลังจอง..."
        disabled={!canBook}
        className="w-full rounded-full bg-[--color-moss] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {!lineReady ? (
        <p className="text-sm text-amber-700">
          ยังไม่ได้ตั้งค่า LINE Login ใน `.env` จึงยังเปิดจองจริงไม่ได้
        </p>
      ) : null}

      {!isAuthenticated && lineReady ? (
        <p className="text-sm text-[--color-text-soft]">
          เข้าสู่ระบบด้วย LINE ก่อน แล้วระบบจะผูกการจองเข้ากับบัญชีของคุณทันที
        </p>
      ) : null}

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-sm font-medium text-emerald-700"
              : "text-sm font-medium text-rose-700"
          }
        >
          {state.message}
          {state.bookingCode ? ` เลขที่จอง ${state.bookingCode}` : ""}
        </p>
      ) : null}
    </form>
  );
}
