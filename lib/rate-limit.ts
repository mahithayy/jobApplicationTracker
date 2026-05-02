const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const userRecord = rateLimitMap.get(identifier);

  // If this is the user's first request, add them to the map
  if (!userRecord) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true };
  }

  // If the time window has passed, reset their count
  if (now - userRecord.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true };
  }

  // If they have exceeded the limit within the time window, block them
  if (userRecord.count >= limit) {
    return { success: false };
  }

  // Otherwise, increment their count and allow the request
  userRecord.count += 1;
  return { success: true };
}