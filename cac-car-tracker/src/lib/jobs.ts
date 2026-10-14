import { prisma } from "./db";

/** Shape sent to the customer page (no customer name/phone; only what the tracking view needs). */
export type TrackerJob = {
  carMake: string;
  carModel: string;
  plate: string;
  serviceName: string;
  currentStage: string;
  estimatedReadyAt: string | null;
  createdAt: string;
  deliveredAt: string | null;
  lastUpdateAt: string;
  updates: {
    id: string;
    stage: string;
    note: string | null;
    photoUrl: string | null;
    createdAt: string;
  }[];
};

export async function getTrackerJob(token: string): Promise<TrackerJob | null> {
  const job = await prisma.job.findUnique({
    where: { token },
    include: { updates: { orderBy: { createdAt: "asc" } } },
  });
  if (!job) return null;
  const last = job.updates.at(-1)?.createdAt ?? job.createdAt;
  return {
    carMake: job.carMake,
    carModel: job.carModel,
    plate: job.plate,
    serviceName: job.serviceName,
    currentStage: job.currentStage,
    estimatedReadyAt: job.estimatedReadyAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    deliveredAt: job.deliveredAt?.toISOString() ?? null,
    lastUpdateAt: (job.deliveredAt && job.deliveredAt > last ? job.deliveredAt : last).toISOString(),
    updates: job.updates.map((u) => ({
      id: u.id,
      stage: u.stage,
      note: u.note,
      photoUrl: u.photoPath ? `/api/photos/${encodeURIComponent(u.photoPath)}` : null,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}
