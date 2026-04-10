import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import { CalendarDays, ReceiptText, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { cancelBookingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { authOptions } from "@/lib/auth";
import { getUserBookings } from "@/lib/data";
import { formatCurrency, formatTeeTime } from "@/lib/format";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[--color-text-soft]">
          My Bookings
        </p>
        <h1 className="font-display-face text-4xl font-semibold text-[--color-text]">
          กรุณาเข้าสู่ระบบด้วย LINE ก่อน
        </h1>
        <p className="max-w-xl text-base leading-8 text-[--color-text-soft]">
          หลังเข้าสู่ระบบแล้ว ระบบจะดึงรายการจองทั้งหมดของบัญชี LINE นี้มาแสดงให้ทันที
        </p>
        <Link
          href="/"
          className="rounded-full bg-[--color-moss] px-6 py-3 text-sm font-semibold text-white"
        >
          กลับไปหน้าแรก
        </Link>
      </div>
    );
  }

  const { bookings, usingMockData } = await getUserBookings(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-3 rounded-[36px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,251,246,0.96),rgba(243,232,214,0.72))] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[--color-text-soft]">
          Booking Dashboard
        </p>
        <h1 className="font-display-face text-4xl font-semibold text-[--color-text]">
          การจองของ {session.user.name ?? "สมาชิก LINE"}
        </h1>
        <p className="text-base leading-8 text-[--color-text-soft]">
          ดูสถานะการจอง, เลข booking code และยกเลิกการจองได้จากหน้านี้
        </p>
        {usingMockData ? (
          <p className="text-sm font-medium text-amber-800">
            Demo mode is active. Live bookings are temporarily unavailable on Vercel.
          </p>
        ) : null}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-[30px] border border-[--color-border] bg-[--color-card] p-8 text-center text-[--color-text-soft]">
          ยังไม่มีรายการจอง เริ่มเลือกรอบจากหน้าแรกได้เลย
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="grid gap-4 rounded-[30px] border border-[--color-border] bg-[--color-card] p-6 lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-gold]">
                      {booking.bookingCode}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[--color-text]">
                      {booking.teeTime.course.name}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      booking.status === BookingStatus.CONFIRMED
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {booking.status === BookingStatus.CONFIRMED ? "Confirmed" : "Cancelled"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      <CalendarDays className="h-4 w-4" />
                      วันเวลา
                    </p>
                    <p className="mt-2 text-base font-semibold text-[--color-text]">
                      {formatTeeTime(booking.teeTime.dateTime)}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      <Users className="h-4 w-4" />
                      ผู้เล่น
                    </p>
                    <p className="mt-2 text-base font-semibold text-[--color-text]">
                      {booking.playerCount} คน
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      <ReceiptText className="h-4 w-4" />
                      ยอดรวม
                    </p>
                    <p className="mt-2 text-base font-semibold text-[--color-text]">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>
                </div>

                {booking.note ? (
                  <div className="rounded-[24px] bg-white px-4 py-4 text-sm text-[--color-text-soft]">
                    หมายเหตุ: {booking.note}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-[26px] bg-white p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                    ข้อมูลสนาม
                  </p>
                  <p className="mt-3 text-lg font-semibold text-[--color-text]">
                    {booking.teeTime.course.location}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[--color-text-soft]">
                    {booking.teeTime.course.description}
                  </p>
                </div>

                {booking.status === BookingStatus.CONFIRMED ? (
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <SubmitButton
                      label="ยกเลิกการจอง"
                      pendingLabel="กำลังยกเลิก..."
                      className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    />
                  </form>
                ) : (
                  <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
                    รายการนี้ถูกยกเลิกแล้ว
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
