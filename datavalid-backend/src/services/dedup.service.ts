
const jobOrderIdSets = new Map<string, Set<string>>();

export function getOrderIdSet(jobId: string): Set<string> {
  if (!jobOrderIdSets.has(jobId)) {
    jobOrderIdSets.set(jobId, new Set());
  }
  return jobOrderIdSets.get(jobId)!;
}

export function clearOrderIdSet(jobId: string): void {
  jobOrderIdSets.delete(jobId);
}


//In-memory duplicate order ID tracker per job. For production at scale, swap this map for a Redis Set per jobId.