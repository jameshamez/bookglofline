import { PrismaClient, TeeTimeStatus } from "@prisma/client";
import { addDays, set } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.teeTime.deleteMany();
  await prisma.golfCourse.deleteMany();

  const courses = await Promise.all([
    prisma.golfCourse.create({
      data: {
        name: "Alpine Ridge Golf Club",
        slug: "alpine-ridge",
        location: "Bangna, Samut Prakan",
        description:
          "สนามสไตล์รีสอร์ตที่เน้นสปีดการออกรอบและการบริการก่อนถึง tee-off",
        coverImage:
          "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
      },
    }),
    prisma.golfCourse.create({
      data: {
        name: "Riverbend Country Course",
        slug: "riverbend-country-course",
        location: "Pathum Thani",
        description:
          "แฟร์เวย์กว้าง เดินทางง่าย เหมาะกับก๊วน 2-4 คนที่ต้องการจองรอบเร็ว",
        coverImage:
          "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?auto=format&fit=crop&w=1200&q=80",
      },
    }),
    prisma.golfCourse.create({
      data: {
        name: "Siam Dunes Signature",
        slug: "siam-dunes-signature",
        location: "Pattaya, Chonburi",
        description:
          "สนามวิวเปิดโล่งพร้อม prime time ตอนเช้า และแพ็กเกจวันหยุดสำหรับนักกอล์ฟต่างจังหวัด",
        coverImage:
          "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=1200&q=80",
      },
    }),
  ]);

  const schedules = [
    { hour: 6, minute: 20, price: 2400, slots: 4 },
    { hour: 6, minute: 40, price: 2400, slots: 3 },
    { hour: 7, minute: 0, price: 2600, slots: 4 },
    { hour: 7, minute: 20, price: 2600, slots: 2 },
    { hour: 11, minute: 40, price: 2200, slots: 4 },
    { hour: 12, minute: 0, price: 2200, slots: 4 },
  ];

  const teeTimes = courses.flatMap((course, courseIndex) =>
    Array.from({ length: 4 }).flatMap((_, dayOffset) =>
      schedules.map((slot, slotIndex) => {
        const dateTime = set(addDays(new Date(), dayOffset), {
          hours: slot.hour,
          minutes: slot.minute + courseIndex * 5,
          seconds: 0,
          milliseconds: 0,
        });

        const availableSlots = Math.max(
          0,
          slot.slots - ((dayOffset + slotIndex + courseIndex) % 3),
        );
        const status =
          availableSlots === 0
            ? TeeTimeStatus.FULL
            : availableSlots <= 2
              ? TeeTimeStatus.LIMITED
              : TeeTimeStatus.OPEN;

        return prisma.teeTime.create({
          data: {
            courseId: course.id,
            dateTime,
            holes: 18,
            price: slot.price + courseIndex * 150,
            flightSize: 4,
            availableSlots,
            status,
          },
        });
      }),
    ),
  );

  await Promise.all(teeTimes);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
