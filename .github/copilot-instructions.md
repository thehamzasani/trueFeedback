# Copilot Instructions for AMA App (Mystery Message)

## Project Overview
**True Feedback** is a Next.js 14 anonymous messaging platform similar to Qooh.me. Users create profiles, receive anonymous messages from other users, and can suggest AI-generated conversation starters. Key tech stack: Next.js 14, MongoDB, NextAuth.js, Zod validation, Tailwind CSS + shadcn/ui, OpenAI, Resend emails.

## Architecture & Data Flows

### User Authentication & Verification Flow
- **Location**: `src/app/api/auth/[...nextauth]/options.ts`, `src/model/User.ts`
- **Pattern**: NextAuth.js with JWT strategy and Credentials provider
- **Key models**: User schema stores username, email, hashedPassword, verifyCode (6-digit), verifyCodeExpiry, isVerified, isAcceptingMessages, and embedded messages array
- **Verification workflow**: On signup, verification code is generated and sent via Resend email (`src/helpers/sendVerificationEmail.ts`). Verification endpoint validates code and sets `isVerified=true` before user can login.
- **Session enrichment**: JWT callback populates token with `_id`, `username`, `isVerified`, `isAcceptingMessages`. Session callback mirrors these to `session.user`.

### Message Ingestion & Retrieval
- **Send**: POST `/api/send-message` - anonymous users send messages to usernames (no auth required). Messages pushed to user's embedded messages array only if `isAcceptingMessages=true`.
- **Get**: GET `/api/get-messages` - authenticated users retrieve their messages using MongoDB aggregation pipeline (unwind, sort by createdAt desc, group). Returns sorted array.
- **Delete**: DELETE `/api/delete-message/[messageId]` - removes message by ID.

### Message Suggestion (AI-Powered)
- **Location**: `src/app/api/suggest-messages/route.ts`
- **Runtime**: `edge` (Vercel edge runtime required)
- **Implementation**: Uses OpenAI Completions API (`gpt-3.5-turbo-instruct`) with streaming via `ai` library. Returns 3 questions separated by `||` delimiter.
- **Client-side parsing**: `src/app/u/[username]/page.tsx` uses `parseStringMessages()` to split on `||`.

### Public Profile Pages
- **Location**: `src/app/u/[username]/page.tsx` - public send-message interface
- **No auth required** - allows anonymous message submission. Integrates suggestion feature.

## Code Patterns & Conventions

### API Route Response Format
**All API responses** follow `ApiResponse` interface (`src/types/ApiResponse.ts`):
```typescript
{ success: boolean; message: string; isAcceptingMessages?: boolean; messages?: Array<Message> }
```
HTTP status codes matter: `201` for resource creation, `400` for validation errors, `401` for auth failure, `403` for forbidden (e.g., user not accepting messages), `404` for not found, `500` for server errors.

### Database Connection Pattern
**Single singleton**: `src/lib/dbConnect.ts` maintains connection state with `connection.isConnected`. Call `await dbConnect()` at start of every API route. Connection auto-connects or reuses existing connection.

### Validation Layer
**Zod schemas** in `src/schemas/`:
- `signUpSchema`: username (2-20 chars, alphanumeric+underscore), email (valid format), password (min 6 chars)
- `messageSchema`: content (10-300 chars)
- `acceptMessageSchema`: boolean toggle
- Pattern: Export schema + use `zodResolver` with `react-hook-form`

### Middleware & Route Protection
- **Location**: `src/middleware.ts`
- **Matcher**: `/dashboard/*`, `/sign-in`, `/sign-up`, `/`, `/verify/*`
- **Logic**: If authenticated → redirect `/sign-in`, `/sign-up`, `/verify` → `/dashboard`. If not authenticated → redirect `/dashboard` → `/sign-in`.

### Component & UI Patterns
- **UI Kit**: shadcn/ui components (`src/components/ui/`) - Button, Card, Textarea, Form, AlertDialog, Toast
- **Form handling**: `react-hook-form` + Zod resolver
- **Client components**: Mark with `'use client'` (RSC default)
- **Toast notifications**: Import `useToast()` from `@/components/ui/use-toast`
- **Message deletion**: Uses AlertDialog confirmation before DELETE request

### Email Templates
- **Location**: `emails/VerificationEmail.tsx`
- **Service**: Resend (`src/lib/resend.ts`)
- **From address**: `dev@hiteshchoudhary.com`

## Essential Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables Required
```
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
OPENAI_API_KEY
RESEND_API_KEY
```

## Key File References
- **Models**: `src/model/User.ts` (User & Message schemas)
- **Auth**: `src/app/api/auth/[...nextauth]/options.ts`
- **Public pages**: `src/app/(app)/` (landing, dashboard), `src/app/u/[username]/` (public send)
- **Auth pages**: `src/app/(auth)/sign-in/`, `/sign-up/`, `/verify/[username]/`
- **UI Components**: `src/components/ui/` (Radix UI + Tailwind)
- **API routes**: `src/app/api/` (all backend logic)
- **Schemas**: `src/schemas/` (Zod validation)

## Developer Workflows

### Adding New API Endpoints
1. Create file in `src/app/api/[feature]/route.ts`
2. Import `dbConnect`, call at route start
3. Use `ApiResponse` interface for returns
4. Apply Zod schema validation on request data
5. Return `Response.json()` with appropriate status codes
6. Add auth check with `getServerSession(authOptions)` if needed

### Modifying User Model
- Edit `src/model/User.ts` (Mongoose schema)
- Update `src/types/next-auth.d.ts` if adding Session/JWT fields
- Verify auth callbacks in `options.ts` include new fields

### Client-Server Communication
- Use `axios` for HTTP requests (see `MessageCard.tsx`, `u/[username]/page.tsx`)
- Catch `AxiosError<ApiResponse>` for typed error handling
- Display errors via `useToast()` for UX feedback

## Project-Specific Notes
- **Embedded messages** design: Messages are stored as subdocuments in User.messages array, not separate collection. Aggregation pipeline used for retrieval to maintain sort order.
- **Verification code**: 6-digit random, expires in 1 hour
- **Username uniqueness**: Enforced via MongoDB unique index + API check before signup
- **Deleted messages**: Leave soft-delete capability in mind for future audit requirements
- **Streaming responses**: Suggest-messages endpoint uses `StreamingTextResponse` from `ai` library for real-time UI feedback
