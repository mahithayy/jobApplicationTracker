# Job Application Tracker

A full-stack, secure, and responsive Kanban-style job application tracker built to streamline the job search process. This application allows users to capture, organize, and manage their applications through various stages of the hiring pipeline.

##  Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI / Radix UI
* **Backend**: Next.js Server Actions, Node.js
* **Database**: MongoDB (Mongoose ORM)
* **Authentication**: Better Auth (Email/Password with JWT sessions)
* **State Management & Interactions**: `@dnd-kit` for complex drag-and-drop operations
* **Testing**: Cypress (E2E) and Jest (Integration/Unit)

##  Security & Real-World Considerations

This project was built with production-grade security and scalability in mind:
* **XSS Protection**: All user inputs are rigorously validated via `Zod` and sanitized using `isomorphic-dompurify` before database insertion.
* **Rate Limiting**: Custom in-memory rate limiting (10 requests/minute) is applied to crucial server actions to prevent abuse and brute-force attacks.
* **Security Headers**: Strict HTTP headers including Content-Security-Policy (CSP), X-Frame-Options (DENY), and X-Content-Type-Options (nosniff) are enforced via `next.config.ts`.
* **Authorization**: Granular server-side checks ensure users can only read, update, or delete job applications linked to their specific `userId`.

##  Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mahithayy/jobApplicationTracker.git](https://github.com/mahithayy/jobApplicationTracker.git)
   cd jobtracker
Install dependencies:

Bash
npm install
Environment Variables:
Create a .env.local file in the root directory:

Code snippet
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secure_random_string
Run the development server:

Bash
npm run dev
Testing
The application features comprehensive test coverage.

Unit & Integration Tests (Jest): Validates the custom rate-limiter and Zod schema sanitization layer.
npm run test:unit

End-to-End Tests (Cypress): Validates UI rendering and critical user flows.
npm run test:e2e