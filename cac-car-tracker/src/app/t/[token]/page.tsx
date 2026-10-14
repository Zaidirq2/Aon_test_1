import { getTrackerJob } from "@/lib/jobs";
import { Tracker } from "@/components/Tracker";
import { NotFound } from "@/components/NotFound";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await getTrackerJob(token);
  if (!job) return <NotFound />;
  return <Tracker token={token} initialJob={job} />;
}
