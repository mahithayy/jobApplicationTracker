import { describe, it, expect } from '@jest/globals';
import { checkRateLimit } from "./rate-limit";

describe("Rate Limiter Unit Tests", () => {
  const testUserId = "test-user-123";

  it("should allow the first request", () => {
    const result = checkRateLimit(testUserId, 5, 60000);
    expect(result.success).toBe(true);
  });

  it("should block requests that exceed the limit", () => {
    const spamUserId = "spammer-456";
    const limit = 3;

    // Make 3 allowed requests
    for (let i = 0; i < limit; i++) {
      checkRateLimit(spamUserId, limit, 60000);
    }

    // The 4th request should be blocked
    const blockedResult = checkRateLimit(spamUserId, limit, 60000);
    expect(blockedResult.success).toBe(false);
  });
});