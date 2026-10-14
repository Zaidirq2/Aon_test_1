"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { checkPassword, createSession, destroySession, requireAuth } from "@/lib/auth";
import { STAGES, isStageKey } from "@/lib/stages";
import { fromLocalInputValue } from "@/lib/format";
import { savePhoto } from "@/lib/uploads";

export type ActionState = { error?: string } | undefined;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return { error: "wrong_password" };
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuth();
  const data = {
    customerName: str(formData, "customerName"),
    customerPhone: str(formData, "customerPhone"),
    carMake: str(formData, "carMake"),
    carModel: str(formData, "carModel"),
    plate: str(formData, "plate"),
    serviceName: str(formData, "serviceName"),
  };
  if (Object.values(data).some((v) => !v)) return { error: "required" };

  const job = await prisma.job.create({
    data: {
      ...data,
      token: randomBytes(12).toString("base64url"),
      currentStage: STAGES[0].key,
      estimatedReadyAt: fromLocalInputValue(str(formData, "estimatedReadyAt")),
      updates: { create: { stage: STAGES[0].key } },
    },
  });
  revalidatePath("/admin");
  redirect(`/admin/jobs/${job.id}`);
}

export async function updateStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuth();
  const jobId = str(formData, "jobId");
  const stage = str(formData, "stage");
  if (!jobId || !isStageKey(stage)) return { error: "invalid" };

  let photoPath: string | null = null;
  try {
    photoPath = await savePhoto(formData.get("photo"));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "upload_failed" };
  }
  const note = str(formData, "note") || null;

  await prisma.$transaction([
    prisma.stageUpdate.create({ data: { jobId, stage, note, photoPath } }),
    prisma.job.update({ where: { id: jobId }, data: { currentStage: stage, deliveredAt: null } }),
  ]);
  revalidatePath("/admin");
  revalidatePath(`/admin/jobs/${jobId}`);
  return undefined;
}

export async function markDelivered(formData: FormData): Promise<void> {
  await requireAuth();
  const jobId = str(formData, "jobId");
  if (!jobId) return;
  await prisma.job.update({ where: { id: jobId }, data: { deliveredAt: new Date(), currentStage: "ready" } });
  revalidatePath("/admin");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function updateEstimate(formData: FormData): Promise<void> {
  await requireAuth();
  const jobId = str(formData, "jobId");
  if (!jobId) return;
  await prisma.job.update({
    where: { id: jobId },
    data: { estimatedReadyAt: fromLocalInputValue(str(formData, "estimatedReadyAt")) },
  });
  revalidatePath(`/admin/jobs/${jobId}`);
}
