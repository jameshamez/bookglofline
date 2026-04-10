import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Goal,
  MapPin,
  MessageCircleMore,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { BookingPanel } from "@/components/booking-panel";
import { authOptions, isLineAuthConfigured } from "@/lib/auth";
import { formatCurrency, formatDateBadge, formatTeeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [session, courses, teeTimes] = await Promise.all([
    getServerSession(authOptions),
    prisma.golfCourse.findMany({
      include: {
        _count: {
          select: {
            teeTimes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.teeTime.findMany({
      where: {
        status: {
          in: ["OPEN", "LIMITED"],
        },
      },
      include: {
        course: true,
      },
      orderBy: [{ dateTime: "asc" }, { price: "asc" }],
      take: 12,
    }),
  ]);

  const nextOpenSlot = teeTimes[0];
  const lineReady = isLineAuthConfigured;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 lg:px-10 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-[36px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,250,245,0.96),rgba(243,232,214,0.74))] p-8 shadow-[0_30px_90px_rgba(24,49,38,0.08)] lg:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[--color-moss]">
            <MessageCircleMore className="h-4 w-4" />
            LINE Login + Golf Booking MVP
          </div>
          <div className="space-y-5">
            <h1 className="font-display-face max-w-3xl text-4xl font-semibold leading-tight text-[--color-text] lg:text-6xl">
              ระบบจองรอบกอล์ฟแบบ 42 TeeOff ที่พร้อมเปิดใน LINE ได้ทันที
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[--color-text-soft]">
              โครงนี้ทำบน Next.js พร้อม flow สำคัญครบสำหรับ MVP:
              เลือกสนาม ดู tee time ว่าง เข้าสู่ระบบด้วย LINE และจองรอบผูกกับบัญชีผู้ใช้
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#tee-times"
              className="inline-flex items-center gap-2 rounded-full bg-[--color-moss] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              ดูรอบว่างวันนี้
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-2 rounded-full border border-[--color-moss]/20 bg-white/70 px-6 py-3 text-sm font-semibold text-[--color-moss]"
            >
              ดูการจองของฉัน
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] bg-white/75 p-5">
              <p className="text-sm text-[--color-text-soft]">สนามในระบบ</p>
              <p className="mt-2 text-3xl font-semibold text-[--color-text]">
                {courses.length}
              </p>
            </div>
            <div className="rounded-[28px] bg-white/75 p-5">
              <p className="text-sm text-[--color-text-soft]">รอบที่เปิดจอง</p>
              <p className="mt-2 text-3xl font-semibold text-[--color-text]">
                {teeTimes.length}
              </p>
            </div>
            <div className="rounded-[28px] bg-white/75 p-5">
              <p className="text-sm text-[--color-text-soft]">สถานะเชื่อม LINE</p>
              <p className="mt-2 text-xl font-semibold text-[--color-text]">
                {lineReady ? "พร้อมใช้งาน" : "รอใส่ ENV"}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-[36px] border border-[--color-border] bg-[--color-card] p-6 shadow-[0_24px_70px_rgba(24,49,38,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[--color-text-soft]">
            รอบแนะนำถัดไป
          </p>
          {nextOpenSlot ? (
            <div className="space-y-4 rounded-[28px] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[--color-text]">
                    {nextOpenSlot.course.name}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[--color-text-soft]">
                    <MapPin className="h-4 w-4" />
                    {nextOpenSlot.course.location}
                  </p>
                </div>
                <span className="rounded-full bg-[--color-blush] px-3 py-1 text-sm font-medium text-[--color-text]">
                  เหลือ {nextOpenSlot.availableSlots} ที่
                </span>
              </div>
              <div className="space-y-2 text-sm text-[--color-text-soft]">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatTeeTime(nextOpenSlot.dateTime)}
                </p>
                <p className="flex items-center gap-2">
                  <Goal className="h-4 w-4" />
                  {nextOpenSlot.holes} หลุม
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Flight สูงสุด {nextOpenSlot.flightSize} คน
                </p>
              </div>
              <div className="rounded-[24px] bg-[--color-sand] p-4">
                <p className="text-sm text-[--color-text-soft]">ราคาต่อคน</p>
                <p className="mt-1 text-3xl font-semibold text-[--color-text]">
                  {formatCurrency(nextOpenSlot.price)}
                </p>
              </div>
              <BookingPanel
                teeTimeId={nextOpenSlot.id}
                availableSlots={nextOpenSlot.availableSlots}
                isAuthenticated={Boolean(session?.user)}
                lineReady={lineReady}
              />
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-6 text-[--color-text-soft]">
              ยังไม่มีรอบว่างในฐานข้อมูล ลอง seed ข้อมูลก่อนเริ่มใช้งาน
            </div>
          )}
        </aside>
      </section>

      {!lineReady ? (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          ใส่ `NEXTAUTH_SECRET`, `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET` ใน `.env`
          ก่อนเปิด LINE Login จริง โดย callback URL ที่ต้องใช้คือ
          `http://localhost:3000/api/auth/callback/line`
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[30px] border border-[--color-border] bg-[--color-card] p-6">
          <Clock3 className="h-5 w-5 text-[--color-gold]" />
          <h3 className="mt-4 text-xl font-semibold text-[--color-text]">
            จองไวใน 3 step
          </h3>
          <p className="mt-2 text-sm leading-7 text-[--color-text-soft]">
            เข้าสู่ระบบด้วย LINE, เลือกรอบ, ยืนยันจำนวนผู้เล่น แล้วดู booking ของตัวเองได้ทันที
          </p>
        </div>
        <div className="rounded-[30px] border border-[--color-border] bg-[--color-card] p-6">
          <Users className="h-5 w-5 text-[--color-gold]" />
          <h3 className="mt-4 text-xl font-semibold text-[--color-text]">
            รองรับจองทั้งก๊วน
          </h3>
          <p className="mt-2 text-sm leading-7 text-[--color-text-soft]">
            ระบบลดจำนวน slot ตามผู้เล่นจริง พร้อมกัน oversell เบื้องต้นด้วย transaction ฝั่งเซิร์ฟเวอร์
          </p>
        </div>
        <div className="rounded-[30px] border border-[--color-border] bg-[--color-card] p-6">
          <MessageCircleMore className="h-5 w-5 text-[--color-gold]" />
          <h3 className="mt-4 text-xl font-semibold text-[--color-text]">
            พร้อมต่อยอด OA / LIFF
          </h3>
          <p className="mt-2 text-sm leading-7 text-[--color-text-soft]">
            ตอนนี้ผูก LINE Login แล้ว และสามารถขยายต่อเป็น LINE OA แจ้งเตือนหรือ LIFF mini app ได้จากฐานนี้
          </p>
        </div>
      </section>

      <section id="tee-times" className="space-y-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[--color-text-soft]">
              Tee Times
            </p>
            <h2 className="font-display-face text-3xl font-semibold text-[--color-text]">
              รอบว่างที่พร้อมจอง
            </h2>
          </div>
          <p className="text-sm text-[--color-text-soft]">
            แสดงตัวอย่างรอบที่เปิดจองจาก SQLite สำหรับใช้เป็นฐาน MVP
          </p>
        </div>

        <div className="grid gap-5">
          {teeTimes.map((teeTime) => (
            <article
              key={teeTime.id}
              className="grid gap-5 rounded-[32px] border border-[--color-border] bg-[--color-card] p-6 shadow-[0_18px_55px_rgba(24,49,38,0.05)] lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-gold]">
                      {formatDateBadge(teeTime.dateTime)}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[--color-text]">
                      {teeTime.course.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[--color-text-soft]">
                    {teeTime.availableSlots > 2 ? "Open" : "Limited"}
                  </span>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-[--color-text-soft]">
                  {teeTime.course.description}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      เวลาออกรอบ
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[--color-text]">
                      {formatTeeTime(teeTime.dateTime)}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      สนาม
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[--color-text]">
                      {teeTime.holes} หลุม
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      ช่องว่าง
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[--color-text]">
                      {teeTime.availableSlots}/{teeTime.flightSize} คน
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-text-soft]">
                      ราคา / คน
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[--color-text]">
                      {formatCurrency(teeTime.price)}
                    </p>
                  </div>
                </div>
              </div>

              <BookingPanel
                teeTimeId={teeTime.id}
                availableSlots={teeTime.availableSlots}
                isAuthenticated={Boolean(session?.user)}
                lineReady={lineReady}
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
