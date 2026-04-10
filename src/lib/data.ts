import { prisma } from "@/lib/prisma";
import { getMockCourses, getMockTeeTimes } from "@/lib/mock-data";

export async function getHomepageData() {
  try {
    const [courses, teeTimes] = await Promise.all([
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

    return { courses, teeTimes, usingMockData: false };
  } catch {
    return {
      courses: getMockCourses(),
      teeTimes: getMockTeeTimes(),
      usingMockData: true,
    };
  }
}

export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        teeTime: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { bookings, usingMockData: false };
  } catch {
    return { bookings: [], usingMockData: true };
  }
}
