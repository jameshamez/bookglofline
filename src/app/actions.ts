"use server";

import { BookingStatus, TeeTimeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSafeServerSession } from "@/lib/auth";
import { bookingCodePrefix } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export type BookingActionState = {
  status: "idle" | "error" | "success";
  message: string;
  bookingCode?: string;
};

const bookingSchema = z.object({
  teeTimeId: z.string().min(1),
  playerCount: z.coerce.number().int().min(1).max(4),
  note: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || undefined),
});

function makeBookingCode(courseName: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${bookingCodePrefix(courseName)}-${suffix}`;
}

export async function createBookingAction(
  _: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  if (process.env.VERCEL) {
    return {
      status: "error",
      message: "Demo mode on Vercel does not allow live bookings yet.",
    };
  }

  const session = await getSafeServerSession();

  if (!session?.user?.id) {
    return {
      status: "error",
      message: "กรุณาเข้าสู่ระบบด้วย LINE ก่อนจองรอบ",
    };
  }

  const parsed = bookingSchema.safeParse({
    teeTimeId: formData.get("teeTimeId"),
    playerCount: formData.get("playerCount"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const teeTime = await tx.teeTime.findUnique({
        where: { id: parsed.data.teeTimeId },
        include: { course: true },
      });

      if (!teeTime || teeTime.status === TeeTimeStatus.CLOSED) {
        throw new Error("ไม่พบรอบที่เลือกหรือรอบนี้ปิดรับจองแล้ว");
      }

      if (teeTime.availableSlots < parsed.data.playerCount) {
        throw new Error("จำนวนผู้เล่นมากกว่าช่องว่างที่เหลืออยู่");
      }

      const nextAvailableSlots = teeTime.availableSlots - parsed.data.playerCount;
      const nextStatus =
        nextAvailableSlots === 0
          ? TeeTimeStatus.FULL
          : nextAvailableSlots <= 2
            ? TeeTimeStatus.LIMITED
            : TeeTimeStatus.OPEN;

      await tx.teeTime.update({
        where: { id: teeTime.id },
        data: {
          availableSlots: nextAvailableSlots,
          status: nextStatus,
        },
      });

      return tx.booking.create({
        data: {
          bookingCode: makeBookingCode(teeTime.course.name),
          userId: session.user.id,
          teeTimeId: teeTime.id,
          playerCount: parsed.data.playerCount,
          note: parsed.data.note,
          totalPrice: teeTime.price * parsed.data.playerCount,
          status: BookingStatus.CONFIRMED,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/my-bookings");

    return {
      status: "success",
      message: "จองรอบเรียบร้อยแล้ว",
      bookingCode: booking.bookingCode,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดระหว่างสร้างการจอง",
    };
  }
}

export async function cancelBookingAction(formData: FormData) {
  if (process.env.VERCEL) {
    return;
  }

  const session = await getSafeServerSession();
  const bookingId = String(formData.get("bookingId") ?? "");

  if (!session?.user?.id || !bookingId) {
    return;
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.user.id,
      status: BookingStatus.CONFIRMED,
    },
    include: {
      teeTime: true,
    },
  });

  if (!booking) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedSlots = booking.teeTime.availableSlots + booking.playerCount;
    const nextStatus =
      updatedSlots <= 2 ? TeeTimeStatus.LIMITED : TeeTimeStatus.OPEN;

    await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    await tx.teeTime.update({
      where: { id: booking.teeTime.id },
      data: {
        availableSlots: updatedSlots,
        status: nextStatus,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/my-bookings");
}
