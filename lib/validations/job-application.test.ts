import { describe, it, expect, jest } from '@jest/globals';

jest.mock("isomorphic-dompurify", () => {
  return {
    sanitize: (value: unknown) => value, // Just return the value unchanged during the test
  };
});

import { jobApplicationSchema } from "./job-application";

describe("Job Application Schema Integration Tests", () => {
  const validBaseData = {
    company: "House of EdTech",
    position: "Full Stack Developer",
    columnId: "col-1",
    boardId: "board-1",
  };

  it("should successfully validate standard correct data", () => {
    const data = {
      ...validBaseData,
      salary: "$100k",
      jobUrl: "https://example.com/job",
    };

    const result = jobApplicationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should fail validation if an insecure HTTP url is provided", () => {
    const data = {
      ...validBaseData,
      jobUrl: "http://insecure-link.com", // Insecure
    };

    const result = jobApplicationSchema.safeParse(data);

    // Simply assert that the validation failed and blocked the bad URL
    expect(result.success).toBe(false);
  });

  it("should successfully validate if the jobUrl is left completely empty", () => {
    const data = {
      ...validBaseData,
      jobUrl: "", // Empty string from frontend form
    };

    const result = jobApplicationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
