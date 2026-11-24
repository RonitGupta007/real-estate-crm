# EstateInt CRM: Comprehensive Code Architecture & Implementation Walkthrough

A deep-dive technical reference detailing file structures, algorithmic logic, database schemas, Baileys WebSockets, and frontend state management.

---

### Project Metadata
| Metadata Property | Implementation Detail |
| :--- | :--- |
| **Project Name** | EstateInt: Luxury Real Estate CRM & Autonomous Outreach Copilot |
| **Target Stack** | Next.js 16 (App Router), React 19, TypeScript, Prisma ORM, SQLite, Baileys WebSockets, Astro 7 |
| **Author / Student** | Ronit (Roll No. 08617704425) |
| **Academic Institute** | Vivekananda School of Information Technology (VSIT / VIPS-TC), GGSIPU Delhi |
| **Repository URL** | [https://github.com/RonitGupta007/real-estate-crm](https://github.com/RonitGupta007/real-estate-crm) |

---

## 1. Architecture Overview & Directory Structure

EstateInt is designed as a decoupled, dual-server modern web platform:
1. **Authenticated Management CRM**: Powered by Next.js 16 (App Router) on `http://localhost:3000`. It provides rich interactive dashboards, visual Kanban boards, and autonomous follow-up dispatching.
2. **Public Marketing & Payment Engine**: Powered by Astro 7 on `http://localhost:4321`. It delivers sub-second static landing pages and simulates authentic BharatQR UPI token payments with GST receipts.

### Complete Repository Directory Map
| Codebase Path | Component Responsibility & Purpose |
| :--- | :--- |
| `prisma/schema.prisma` | Defines relational models (`Property`, `Lead`, `Deal`, `Showing`, `Activity`, `FollowUp`) and SQLite provider. |
| `prisma/seed.ts` | Seeding script that populates the database with authentic luxury Indian properties (Lodha, Oberoi, DLF). |
| `src/app/page.tsx` | Executive Dashboard displaying high-level KPIs, pipeline conversion funnel, and today's tour appointments. |
| `src/app/pipeline/page.tsx` | Visual Deal Pipeline Kanban board with HTML5 drag-and-drop and real-time deal stage mutations. |
| `src/app/follow-ups/page.tsx` | Agentic Follow-Up & Outreach Copilot featuring the White WhatsApp Status Button and AI audit trigger. |
| `src/app/leads/page.tsx` | Complete buyer & seller CRM directory with priority scoring, budget ranges, and contact slideouts. |
| `src/app/properties/page.tsx` | Property inventory catalog with architectural image galleries, MahaRERA IDs, and BHK spec filters. |
| `src/app/schedule/page.tsx` | Calendar and property walkthrough management interface. |
| `src/app/analytics/page.tsx` | Visual analytics engine calculating sales velocity, commission realizations, and lead sources. |
| `src/app/portal/[clientId]/page.tsx` | Exclusive VIP Buyer Portal offering MahaRERA legal deed downloads, private chat, and tour booking. |
| `src/app/api/*` | Serverless Next.js Route Handlers exposing RESTful JSON endpoints for all CRUD operations. |
| `src/components/AppShell.tsx` | Global application shell provider managing navigation state, global CRM context, and refresh triggers. |
| `src/components/modals/*` | Reusable dialog components (`WhatsAppSettingsModal`, `NewDealModal`, `NewLeadModal`, `NewPropertyModal`). |
| `src/lib/prisma.ts` | Global PrismaClient singleton connection instance preventing connection exhaustion during hot reload. |
| `src/lib/whatsapp-web.ts` | Native Baileys WebSocket multi-device engine, authentication session storage, and QR code streaming. |
| `src/lib/agentic-followup.ts` | Heuristic AI audit engine analyzing client inactivity signals, tour timestamps, and draft synthesis. |
| `src/lib/utils.ts` | Formatting utilities (Indian Crores/Lakhs currency conversion, date formatting, Tailwind clsx merge). |
| `server.mjs` (in companion `estateint`) | Independent Node.js HTTP server hosting the Astro marketing site and BharatQR UPI payment simulator. |

---

## 2. Database Layer & Prisma ORM Modeling

Data persistence is orchestrated by Prisma ORM v6 paired with SQLite 3.

### 2.1 Prisma Client Singleton Pattern (`src/lib/prisma.ts`)
In Next.js development mode, Hot Module Replacement (HMR) re-executes server files upon every code change. Instantiating `new PrismaClient()` directly inside route handlers would quickly exhaust database connections. To prevent this, EstateInt attaches the client instance to `globalThis`:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 2.2 Relational Entity Schema (`prisma/schema.prisma`)
The schema enforces strict relational constraints:
- **`Property`**: Real estate assets, pricing in INR, RERA IDs, carpet area, amenity JSON arrays, and assigned agents.
- **`Lead`**: High-net-worth client profiles, contact numbers, email, type (`BUYER`, `SELLER`, `INVESTOR`), budget ranges, and priority.
- **`Deal`**: Active transaction linked to a Lead and Property. Contains pipeline stages (`LEAD_IN`, `TOUR_SCHEDULED`, `OFFER_SUBMITTED`, `UNDER_CONTRACT`, `IN_ESCROW`, `CLOSED_WON`) and win probability.
- **`Showing`**: Physical or virtual property walkthroughs with scheduled start/end timestamps and completion states.
- **`FollowUp`**: AI-generated outreach recommendations with urgency tags, rationale, suggested channel, and draft copy.

```prisma
model Property {
  id              String      @id @default(cuid())
  title           String
  slug            String      @unique
  address         String
  city            String
  price           Float
  propertyType    String      // PENTHOUSE, VILLA, HERITAGE
  status          String      @default("ACTIVE")
  bedrooms        Int
  bathrooms       Float
  squareFeet      Int
  features        String      // JSON Amenities Array
  assignedAgent   String?
  deals           Deal[]
  showings        Showing[]
  activities      Activity[]
}

model Deal {
  id              String      @id @default(cuid())
  title           String
  value           Float
  stage           String      @default("LEAD_IN")
  probability     Int         @default(20)
  expectedClose   DateTime?
  leadId          String
  lead            Lead        @relation(fields: [leadId], references: [id])
  propertyId      String?
  property        Property?   @relation(fields: [propertyId], references: [id])
}
```

---

## 3. Core Autonomous Engines (`src/lib/`)

### 3.1 Baileys Native WhatsApp Web Engine (`src/lib/whatsapp-web.ts`)
Rather than routing messages through paid third-party cloud APIs (such as Twilio at $0.05/msg), EstateInt connects directly to WhatsApp's multi-device WebSocket rail using `@whiskeysockets/baileys`:
1. **Auth Persistence**: `useMultiFileAuthState` stores session credentials in `.whatsapp_auth/`.
2. **Socket Singleton**: Keeps the socket alive in `globalThis.__estateIntWAState`.
3. **QR Generation**: Captures raw challenge strings and transforms them into base-64 data URLs using `QRCode.toDataURL()`.
4. **Direct Message Dispatch**: Emits raw socket payloads directly to client JIDs (`91XXXXXXXXXX@s.whatsapp.net`).

```typescript
// src/lib/whatsapp-web.ts
export async function startWhatsAppSocket(): Promise<void> {
  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      state.status = "SCAN_QR";
      state.qrCode = await QRCode.toDataURL(qr);
    }
    if (connection === "open") {
      state.status = "CONNECTED";
      state.user = { id: sock.user?.id, name: sock.user?.name };
    }
  });

  sock.ev.on("creds.update", saveCreds);
}
```

### 3.2 Heuristic Agentic Follow-Up Copilot (`src/lib/agentic-followup.ts`)
The autonomous outreach engine performs algorithmic signal auditing across the CRM database whenever the agent clicks **Run AI Audit**:
- **Rule 1 (Post-Showing)**: Completed site visits in the last 72 hours trigger an urgent outreach offering RERA sanctioned layouts and token advance terms.
- **Rule 2 (Stale Leads)**: Buyers with zero contact for >40 hours receive a discrete luxury re-engagement note.
- **Rule 3 (Active Offers)**: Contracts in negotiation receive counter-offer scripts and escrow check-in notes.
- **Rule 4 (Inventory Match)**: Automatically pairs newly listed properties with buyer budgets.

---

## 4. REST API Route Handlers (`src/app/api/`)

Next.js 16 App Router handles backend logic via Route Handlers (`route.ts`):

### 4.1 Deal Stage Mutations (`src/app/api/deals/[id]/route.ts`)
```typescript
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { stage, value, probability } = body;

  const updatedDeal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      ...(stage && { stage }),
      ...(value !== undefined && { value: parseFloat(value) }),
      ...(probability !== undefined && { probability: parseInt(probability) }),
    },
    include: { lead: true, property: true },
  });

  return NextResponse.json(updatedDeal);
}
```

### 4.2 WhatsApp QR Code Delivery (`src/app/api/settings/whatsapp/qr/route.ts`)
```typescript
export async function GET() {
  const status = getWhatsAppWebStatus();
  if (status.isConnected) {
    return NextResponse.json({ status: "CONNECTED", isConnected: true });
  }
  if (!status.qrCode) {
    await startWhatsAppSocket();
  }
  return NextResponse.json(getWhatsAppWebStatus());
}
```

---

## 5. Frontend UI & Reactive State Architecture

### 5.1 Global CRM Context (`src/components/AppShell.tsx`)
The application utilizes React Context (`useCRM`) to broadcast state events across disconnected pages. When a new deal or lead is saved inside a modal, `triggerRefresh()` increments an internal counter, prompting active pages to re-fetch their data without requiring a full browser reload.

### 5.2 Follow-Ups Page & White WhatsApp Status Button (`src/app/follow-ups/page.tsx`)
In the upper header of the Follow-Ups page, the WhatsApp status button features a clean white luxury aesthetic with a dynamic status indicator dot:

```tsx
// White WhatsApp Status Button with Dynamic Status Dot
<button
  onClick={() => setWhatsAppModalOpen(true)}
  className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs shadow-md transition active:scale-98 border border-slate-200/60"
  title="Configure automated WhatsApp sending (Twilio / Meta / Baileys)"
>
  <MessageSquare className={`w-4 h-4 ${whatsAppStatus?.active ? "text-emerald-600" : "text-amber-500"}`} />
  <span>{whatsAppStatus?.active ? "WhatsApp: Active" : "WhatsApp Setup"}</span>
  <span className={`w-2 h-2 rounded-full ${whatsAppStatus?.active ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
</button>
```

And each recommendation card provides a 1-click fallback launcher:
```tsx
<a
  href={`https://wa.me/${item.lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`}
  target="_blank"
  rel="noreferrer"
  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
>
  <MessageSquare className="w-3.5 h-3.5" />
  <span>WhatsApp</span>
</a>
```

---

## 6. Astro Marketing Site & Demo Payment Gateway

The companion application in `estateint` runs on Astro 7 and is served via `server.mjs` on port 4321.

### Dynamic UPI BharatQR Generation (`server.mjs`)
When a buyer clicks "Book with Token Advance", the server constructs an authentic BharatQR UPI string:
```javascript
const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
const upiString = `upi://pay?pa=estateint@icici&pn=EstateInt%20Luxury&am=${amount}&tr=${orderId}&cu=INR`;
const qrCodeDataUrl = await QRCode.toDataURL(upiString, { width: 280, margin: 1 });
```

---

## 7. Viva & Code Defense Cheat Sheet

| Examiner Question | Model Technical Answer & Code Reference |
| :--- | :--- |
| **Q1: Why did you choose SQLite over MongoDB?** | Luxury real estate deals require strict relational integrity between Buyers, Properties, and Contracts. SQLite with Prisma provides ACID guarantees, eliminates foreign key orphan states, and requires zero external database server setup. |
| **Q2: How does Baileys differ from official WhatsApp Cloud API?** | Official Cloud API requires business verification, template approval delays, and costs ~₹0.80 per conversation. Baileys connects directly to WhatsApp's multi-device WebSocket rail via QR authentication, providing zero-cost messaging directly from the broker's phone. |
| **Q3: How do you prevent database connection exhaustion in Next.js?** | In `src/lib/prisma.ts`, we attach the PrismaClient instance to `globalThis`. During development HMR reloads, Next.js reuses the existing instance rather than creating new database connection pools. |
| **Q4: How does the AI Audit engine determine follow-up urgency?** | In `src/lib/agentic-followup.ts`, the algorithm checks completed property viewings in the past 72 hours (`URGENT`), uncontacted leads for >40 hours (`HIGH`), and deals in `OFFER_SUBMITTED` stage (`MEDIUM`). |
| **Q5: Why did you separate the CRM into Next.js and Astro?** | Next.js App Router is optimized for authenticated, dynamic dashboard applications. Astro 7 is optimized for public-facing, static marketing landing pages with zero client JS overhead, maximizing SEO and speed. |
| **Q6: How does the white WhatsApp status button update its state?** | The button in `src/app/follow-ups/page.tsx` reads `whatsAppStatus?.active` from the `/api/settings/whatsapp` endpoint. If active, it renders a green icon and pulsing emerald dot; if disconnected, it displays an amber setup badge. |
| **Q7: What security measures protect sensitive credentials?** | WhatsApp multi-device auth keys are stored in `.whatsapp_auth/` and database credentials in `.env`, both explicitly excluded from Git version control via `.gitignore`. |
| **Q8: How does the Kanban board persist card movements?** | When a card is dropped, the `handleDragEnd` hook immediately sends a PATCH request to `/api/deals/[id]` with the target stage, executing an atomic database update before refreshing UI state. |
