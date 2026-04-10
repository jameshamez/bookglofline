# LINE Golf Booking MVP

ระบบจองรอบกอล์ฟบน `Next.js` ที่เชื่อมกับ `LINE Login` สำหรับ use case แนวเดียวกับ 42 TeeOff โดยโครงนี้ทำเป็น MVP ที่รันได้ในเครื่องทันทีและพร้อมต่อยอดเป็นโปรดักชัน

## ฟีเจอร์หลัก

- หน้าแสดงสนามกอล์ฟและ tee time ที่เปิดจอง
- เข้าสู่ระบบด้วย LINE ผ่าน `next-auth`
- จองรอบพร้อมเลือกจำนวนผู้เล่นและใส่หมายเหตุ
- หน้าดู `My Bookings` และยกเลิกการจอง
- ใช้ `Prisma + SQLite` เพื่อเริ่มพัฒนาได้เร็ว

## Stack

- `Next.js 16` + App Router
- `TypeScript`
- `Prisma`
- `next-auth` พร้อม custom LINE provider
- `Tailwind CSS`

## วิธีเริ่มใช้งาน

1. ติดตั้งแพ็กเกจ

```bash
npm install
```

2. สร้างไฟล์ `.env` จาก `.env.example`

```bash
copy .env.example .env
```

3. สร้างฐานข้อมูลและ seed ข้อมูลตัวอย่าง

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. รันโปรเจกต์

```bash
npm run dev
```

## การตั้งค่า LINE Login

ใส่ค่าต่อไปนี้ใน `.env`

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
LINE_CLIENT_ID="your-line-channel-id"
LINE_CLIENT_SECRET="your-line-channel-secret"
```

Callback URL ที่ต้องตั้งใน LINE Developers Console:

```text
http://localhost:3000/api/auth/callback/line
```

## โครงสร้างข้อมูลหลัก

- `User`
- `GolfCourse`
- `TeeTime`
- `Booking`

## ไอเดียต่อยอดจากฐานนี้

- LINE Official Account แจ้งเตือนหลังจอง
- แอดมินจัดการ inventory / ราคา / โปรโมชั่น
- รองรับคูปอง, payment gateway, refund flow
- LIFF mini app สำหรับเปิดใช้งานใน LINE OA
