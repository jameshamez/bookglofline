import { addDays, set } from "date-fns";

export type MockCourse = {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
  coverImage: string | null;
  _count: {
    teeTimes: number;
  };
};

export type MockTeeTime = {
  id: string;
  courseId: string;
  dateTime: Date;
  holes: number;
  price: number;
  flightSize: number;
  availableSlots: number;
  status: "OPEN" | "LIMITED" | "FULL" | "CLOSED";
  course: Omit<MockCourse, "_count">;
};

const baseCourses = [
  {
    id: "course-alpine-ridge",
    name: "Alpine Ridge Golf Club",
    slug: "alpine-ridge",
    location: "Bangna, Samut Prakan",
    description: "Mock golf course for Vercel demo mode.",
    coverImage: null,
  },
  {
    id: "course-riverbend",
    name: "Riverbend Country Course",
    slug: "riverbend-country-course",
    location: "Pathum Thani",
    description: "Mock golf course for tee time listing.",
    coverImage: null,
  },
  {
    id: "course-siam-dunes",
    name: "Siam Dunes Signature",
    slug: "siam-dunes-signature",
    location: "Pattaya, Chonburi",
    description: "Mock golf course for pricing and availability demo.",
    coverImage: null,
  },
] as const;

export function getMockCourses(): MockCourse[] {
  return baseCourses.map((course) => ({
    ...course,
    _count: {
      teeTimes: 4,
    },
  }));
}

export function getMockTeeTimes(): MockTeeTime[] {
  const schedules = [
    { hour: 6, minute: 30, price: 2400, availableSlots: 4, status: "OPEN" as const },
    { hour: 7, minute: 10, price: 2600, availableSlots: 2, status: "LIMITED" as const },
    { hour: 11, minute: 40, price: 2200, availableSlots: 4, status: "OPEN" as const },
    { hour: 12, minute: 20, price: 2200, availableSlots: 3, status: "OPEN" as const },
  ];

  return baseCourses.flatMap((course, courseIndex) =>
    schedules.map((slot, slotIndex) => ({
      id: `teetime-${courseIndex + 1}-${slotIndex + 1}`,
      courseId: course.id,
      dateTime: set(addDays(new Date(), slotIndex % 2), {
        hours: slot.hour,
        minutes: slot.minute + courseIndex * 5,
        seconds: 0,
        milliseconds: 0,
      }),
      holes: 18,
      price: slot.price + courseIndex * 150,
      flightSize: 4,
      availableSlots: slot.availableSlots,
      status: slot.status,
      course,
    })),
  );
}
