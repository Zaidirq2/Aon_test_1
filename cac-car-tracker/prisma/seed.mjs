// Seeds 3 demo jobs at different stages. Run with: npx prisma db seed
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const STAGE_KEYS = [
  "received",
  "inspection",
  "washing",
  "polishing",
  "protection",
  "final_check",
  "ready",
];

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

const jobs = [
  {
    token: "demo-ahmed",
    customerName: "أحمد كريم",
    customerPhone: "07701234567",
    carMake: "Toyota",
    carModel: "Land Cruiser 2023",
    plate: "أ 12345 بغداد",
    serviceName: "حماية كاملة PPF + كوتنج سيراميك",
    stageIndex: 4, // protection
    createdAt: hoursAgo(30),
    estimatedReadyAt: hoursFromNow(20),
    notes: {
      received: "تم استلام السيارة وفحص الهيكل بحضور الزبون.",
      inspection: "لا توجد خدوش عميقة، يوجد تلوث بسيط في الطلاء.",
      washing: "غسيل عميق وإزالة التلوث بالصلصال.",
      polishing: "تلميع على مرحلتين بمنتجات Koch-Chemie.",
      protection: "بدأ تركيب فلم الحماية Pro Film على المقدمة.",
    },
  },
  {
    token: "demo-sara",
    customerName: "سارة علي",
    customerPhone: "07809876543",
    carMake: "Mercedes-Benz",
    carModel: "C200 2022",
    plate: "ب 77421 بغداد",
    serviceName: "تلميع وتصحيح الطلاء + كوتنج Gtechniq",
    stageIndex: 1, // inspection
    createdAt: hoursAgo(3),
    estimatedReadyAt: hoursFromNow(28),
    notes: {
      received: "استلام السيارة، المفتاح الاحتياطي مع الزبون.",
      inspection: "جاري فحص الطلاء بجهاز قياس السماكة.",
    },
  },
  {
    token: "demo-mustafa",
    customerName: "مصطفى حسن",
    customerPhone: "07511122233",
    carMake: "BMW",
    carModel: "X5 2021",
    plate: "ج 30987 بغداد",
    serviceName: "غسيل تفصيلي داخلي وخارجي",
    stageIndex: 6, // ready
    createdAt: hoursAgo(9),
    estimatedReadyAt: hoursAgo(1),
    notes: {
      received: "استلام السيارة.",
      inspection: "فحص سريع، الحالة ممتازة.",
      washing: "غسيل خارجي + تنظيف المقصورة بالبخار.",
      polishing: "تلميع سريع للمصابيح.",
      protection: "طبقة حماية سريعة (سبراي سيلنت).",
      final_check: "تم الفحص النهائي والتصوير.",
      ready: "السيارة جاهزة للاستلام في صالة الانتظار.",
    },
  },
];

async function main() {
  await prisma.stageUpdate.deleteMany();
  await prisma.job.deleteMany();

  for (const j of jobs) {
    const token = j.token || randomBytes(12).toString("base64url");
    const currentStage = STAGE_KEYS[j.stageIndex];
    const job = await prisma.job.create({
      data: {
        token,
        customerName: j.customerName,
        customerPhone: j.customerPhone,
        carMake: j.carMake,
        carModel: j.carModel,
        plate: j.plate,
        serviceName: j.serviceName,
        currentStage,
        createdAt: j.createdAt,
        estimatedReadyAt: j.estimatedReadyAt,
      },
    });

    const totalSpan = Date.now() - j.createdAt.getTime();
    for (let i = 0; i <= j.stageIndex; i++) {
      const stage = STAGE_KEYS[i];
      // Spread the updates evenly between creation and now.
      const at = new Date(j.createdAt.getTime() + (totalSpan * (i + 1)) / (j.stageIndex + 2));
      await prisma.stageUpdate.create({
        data: { jobId: job.id, stage, note: j.notes[stage] ?? null, createdAt: at },
      });
    }
    console.log(`Seeded ${j.carMake} ${j.carModel} -> /t/${token} (${currentStage})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
