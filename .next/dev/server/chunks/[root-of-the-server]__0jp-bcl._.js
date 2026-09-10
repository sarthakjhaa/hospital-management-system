module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/schedules/available-slots/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$availability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/availability.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get('doctorId');
        const dateStr = searchParams.get('date');
        if (!doctorId || !dateStr) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'doctorId and date query parameters are required'
            }, {
                status: 400
            });
        }
        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid date string provided'
            }, {
                status: 400
            });
        }
        const slotsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$availability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDoctorAvailableSlots"])(doctorId, targetDate);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(slotsResult);
    } catch (error) {
        console.error('Fetch available slots error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch doctor available time slots'
        }, {
            status: 500
        });
    }
}
}),
"[project]/src/lib/availability.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateTimeSlots",
    ()=>generateTimeSlots,
    "getDoctorAvailableSlots",
    ()=>getDoctorAvailableSlots,
    "getSlotMinutes",
    ()=>getSlotMinutes,
    "normalizeSlot",
    ()=>normalizeSlot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
;
const DAY_NAMES = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
];
function normalizeSlot(slot) {
    if (!slot) return '';
    const trimmed = slot.trim().toUpperCase();
    // Match 12-hour format like "9:00 AM" or "09:00 AM" or "2:30 PM"
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (ampmMatch) {
        const hours = parseInt(ampmMatch[1], 10).toString().padStart(2, '0');
        const mins = ampmMatch[2];
        const period = ampmMatch[3];
        return `${hours}:${mins} ${period}`;
    }
    // Match 24-hour format like "09:00" or "14:30"
    const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (h24Match) {
        let hours = parseInt(h24Match[1], 10);
        const mins = h24Match[2];
        const period = hours >= 12 ? 'PM' : 'AM';
        if (hours === 0) hours = 12;
        else if (hours > 12) hours -= 12;
        const formattedHours = hours.toString().padStart(2, '0');
        return `${formattedHours}:${mins} ${period}`;
    }
    return trimmed;
}
function getSlotMinutes(slot) {
    const norm = normalizeSlot(slot);
    const match = norm.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3];
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}
function generateTimeSlots(startTime = '09:00', endTime = '17:00', stepMins = 30) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    while(currentMinutes + stepMins <= endMinutes){
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const time24 = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        slots.push(normalizeSlot(time24));
        currentMinutes += stepMins;
    }
    return slots;
}
async function getDoctorAvailableSlots(doctorId, targetDate) {
    const dayIndex = targetDate.getDay();
    const dayOfWeek = DAY_NAMES[dayIndex];
    // 1. Fetch Doctor Working Schedule for the day of week
    const schedule = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].doctorSchedule.findFirst({
        where: {
            doctorId,
            dayOfWeek
        }
    });
    // Default OPD schedule if no explicit DoctorSchedule row exists in DB
    const isAvailable = schedule ? schedule.isAvailable : true;
    const startTime = schedule?.startTime || '09:00';
    const endTime = schedule?.endTime || '17:00';
    if (!isAvailable) {
        return {
            isWorkingDay: false,
            dayOfWeek,
            slotDurationMins: 30,
            availableSlots: [],
            bookedSlots: [],
            message: `Doctor has no available OPD schedule on ${dayOfWeek}s.`
        };
    }
    // 2. Generate standard 12-hour AM/PM time slots
    const rawSlots = generateTimeSlots(startTime, endTime, 30);
    // 3. Fetch existing booked appointments for doctor on target date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const existingAppointments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].appointment.findMany({
        where: {
            doctorId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                in: [
                    __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["AppointmentStatus"].PENDING,
                    __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["AppointmentStatus"].CONFIRMED
                ]
            }
        },
        select: {
            timeSlot: true
        }
    });
    const bookedSlotsNormalized = existingAppointments.map((a)=>normalizeSlot(a.timeSlot));
    // 4. Check if date is today, filter out past time slots
    const now = new Date();
    const isToday = targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() === now.getMonth() && targetDate.getDate() === now.getDate();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const availableSlots = rawSlots.filter((slot)=>{
        const norm = normalizeSlot(slot);
        if (bookedSlotsNormalized.includes(norm)) return false;
        if (isToday) {
            const slotMins = getSlotMinutes(slot);
            if (slotMins <= currentMinutes) return false; // past slot today
        }
        return true;
    });
    return {
        isWorkingDay: true,
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMins: 30,
        availableSlots,
        bookedSlots: bookedSlotsNormalized
    };
}
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0jp-bcl._.js.map