# ♻️ Ecolyze (RecycleSmart) - Backend API Server

ระบบหลังบ้าน (Backend API) สำหรับแพลตฟอร์มคัดแยกขยะอัจฉริยะ **Ecolyze (RecycleSmart)** พัฒนาด้วย **Node.js, Express, TypeScript, Google Gemini AI (Vision & Chat), และ Supabase**

---

## 🚀 ฟีเจอร์หลัก (Key Features)

1. **Authentication & User Profile (`/api/auth`)**:
   - `POST /api/auth/register` : สมัครสมาชิกใหม่
   - `POST /api/auth/login` : เข้าสู่ระบบ รับ JWT Token
   - `GET /api/auth/me` : ดึงข้อมูลโปรไฟล์และคะแนนสะสมของผู้ใช้

2. **AI Waste Classification (`/api/analyze`)**:
   - `POST /api/analyze` : อัปโหลดรูปภาพขยะ (Multipart Form-Data) ให้ Google Gemini AI วิเคราะห์จำแนกประเภทตามมาตรฐานกรมควบคุมมลพิษ และ มข. (4 ถัง: ทั่วไป, รีไซเคิล, เปียก, อันตราย) พร้อมคำนวณแต้มสะสมและบันทึกลงฐานข้อมูล

3. **AI Chatbot Assistant (`/api/chat`)**:
   - `POST /api/chat` : ผู้ช่วยอัจฉริยะตอบคำถามเกี่ยวกับการคัดแยกขยะและวิธีเตรียมขยะก่อนทิ้ง

4. **Scan History (`/api/history`)**:
   - `GET /api/history` : ดูประวัติการสแกนขยะของผู้ใช้งาน

5. **Waste Drop-off Locations (`/api/locations`)**:
   - `GET /api/locations` : รายการพิกัดจุดทิ้งขยะรอบมหาวิทยาลัยขอนแก่น สำหรับแสดงผลบน Leaflet Map
   - `POST /api/locations` : เพิ่มจุดทิ้งขยะใหม่
   - `PUT /api/locations/:id` : แก้ไขจุดทิ้งขยะ
   - `DELETE /api/locations/:id` : ลบจุดทิ้งขยะ

6. **Rewards & Gamification (`/api/rewards`)**:
   - `GET /api/rewards` : รายการของรางวัลที่สามารถแลกได้
   - `POST /api/rewards/redeem` : แลกของรางวัลโดยการตัดแต้มสะสม

7. **Admin Management & Dashboard (`/api/admin`)**:
   - `GET /api/admin/stats` : ข้อมูลสถิติรวมสำหรับ Admin Dashboard (จำนวนสแกน, ความแม่นยำ AI, ผู้ใช้, สถานะระบบ)
   - `GET /api/admin/users` : รายชื่อผู้ใช้งานในระบบ
   - `GET /api/admin/reports` : รายการแจ้งปัญหาถังขยะเต็ม/ชำรุด
   - `POST /api/admin/reports` : ส่งรายงานแจ้งปัญหา
   - `GET /api/admin/guidelines` : ข้อมูลคู่มือการคัดแยกขยะ

---

## 🛠️ วิธีการติดตั้งและรันระบบ

### 1. ติดตั้ง Dependencies
```bash
cd backend
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วระบุค่า:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key

# Google Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. เริ่มต้นรันเซิร์ฟเวอร์
- **Development Mode (พร้อม Hot Reload):**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

เซิร์ฟเวอร์จะเปิดทำงานที่ `http://localhost:5000`
สามารถทดสอบ Health Check ได้ที่ `http://localhost:5000/api/health` หรือ `http://localhost:5000/`
