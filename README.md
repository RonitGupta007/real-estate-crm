# EstateInt — Luxury Real Estate CRM

An enterprise-grade Customer Relationship Management (CRM) and Deal Pipeline application engineered specifically for luxury real estate brokerages, managing agents, and multi-agent teams.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **Prisma ORM**, **SQLite**, and **Lucide Icons**.

---

## 🌟 Key Modules & Features

### 1. 📊 Executive Brokerage Dashboard (`/`)
- **Key Performance Indicators (KPIs)**:
  - Active Inventory Portfolio Value ($19.5M+)
  - Total Active Pipeline Volume ($22.5M across active stages)
  - Year-to-Date Realized Commission Earnings ($267K)
  - Active Client / High-Net-Worth Lead Count
- **Deal Velocity Funnel**: Visual distribution across stages (*Discovery*, *Touring*, *Offer Submitted*, *In Escrow*, *Closing*, *Closed Won*).
- **Upcoming Tours & Showings**: Today & upcoming appointments with 1-click status completion toggles.
- **Live Activity Audit Feed**: Timestamped record of phone calls, offers, pre-approval verifications, and contract progressions.
- **Agentic Recommendation Alert**: Instant notification banner when high-priority buyer actions are detected.

### 2. 🤖 Agentic Follow-Up & Outreach Copilot (`/follow-ups`)
- **Autonomous Opportunity Detection**:
  - **Post-Showing Follow-ups**: Detects completed walkthroughs and triggers concierge follow-up within the critical 24-48h window.
  - **Stale Lead Re-Engagement**: Flags high-priority buyers with no contact in 40+ hours.
  - **Active Offer Check-ins**: Generates counter-offer and escrow check-in scripts for pending contracts.
  - **Inventory Matching**: Matches new active listings with client budgets and asset type preferences.
- **Multi-Channel Outreach Formats**:
  - ✉️ **Executive Email**: Complete with subject lines, luxury tone, and property specs.
  - 💬 **SMS / WhatsApp**: Direct, casual, high-converting outreach text.
  - 📞 **Broker Phone Script**: Bulleted phone talking points for agent calls.
- **1-Click Execution**: Instantly dispatches outreach, updates the client's `lastContactedAt` timestamp, advances lead status, and appends an entry to the brokerage audit log.
- **Autonomous CRM Audit Button**: Triggers an on-demand AI scan of all database signals.

### 3. 🏢 Property Catalog & Inventory (`/properties`)
- **Visual Listing Cards**: High-resolution architectural photography, asking price, price/sqft metric, beds/baths/sqft specs, and amenity badges.
- **Search & Filter Bar**:
  - Filter by status (*Active*, *Pending*, *Under Contract*, *Sold*, *Off Market*).
  - Filter by asset type (*Luxury Estate*, *Condo / Penthouse*, *Single Family*, *Townhouse*, *Commercial*).
  - Search by title, street, city, state.
- **Property Detail Slideover**: Detailed architectural specs, location, notes, and direct links to create pipeline deals or book showings.
- **Add Property Modal**: Quick form with automatic square-foot pricing calculation.

### 3. 👥 Client & Lead Management (`/leads`)
- **Complete Client Database**: Buyers, Sellers, Commercial Investors, Co-Broke Agents.
- **Priority & Lead Scoring**: Urgent (Hot Lead), High, Medium, Low priority tags.
- **Budget Ranges & Target Locations**: Track budget minimums and maximums, preferred neighborhoods, and property preferences.
- **Lead Detail File & Interactive Note Logger**:
  - Direct mail and call links.
  - Active deals and scheduled tours linked to this client.
  - Live activity logger: Log phone calls and conversation notes with automatic timestamping.

### 4. 💼 Visual Deal Pipeline Kanban (`/pipeline`)
- **Kanban Board**: Drag and advance stages from *Discovery* ➔ *Showing* ➔ *Offer Submitted* ➔ *Under Contract* ➔ *Closing* ➔ *Closed Won*.
- **Stage Summaries**: Real-time dollar volume and deal count at the top of every column.
- **Deal Cards**: Show buyer name, property address, deal value, expected commission (with configurable rate e.g. 2.5%–3.0%), win probability bar, and target closing date.
- **One-Click Advancement**: Advance deals forward or back with instant SQLite database synchronization.

### 5. 📅 Showings, Tours & Calendar (`/schedule`)
- **Event Scheduling**: Property viewings, broker open houses, client consultations, and property inspections.
- **Status Lifecycle**: Scheduled ➔ Confirmed ➔ Completed / Cancelled.
- **Detailed Tour Cards**: Showing location, client name, assigned broker, and private notes.

### 7. 📈 Brokerage Analytics & Commission Simulator (`/analytics`)
- **Performance Breakdown**: Closed sales volume, realized commission, and weighted revenue forecasts.
- **Inventory Asset Mix**: Breakdown of properties by asset class.
- **Agent Production Leaderboard**: Track production for Sarah Jenkins, Michael Vance, and Elena Rostova.
- **Interactive Commission Calculator**: Interactive slider to simulate transaction prices, commission splits (e.g. 80/20 broker split), and calculate gross vs take-home payout.

### 8. 💎 VIP Client Portal (`/portal`)
- **Exclusive Client-Facing Experience**: Luxury bespoke interface tailored to high-net-worth buyers and sellers.
- **Client Profile Switcher**: Switch between any client (*Alexander Wright*, *Marcus Sterling*, *Sophia Chen*, etc.) to preview their bespoke portal.
- **Live Escrow & Transaction Roadmap**: 5-step milestone tracker (*Offer Submitted ➔ Earnest Deposit ➔ Due Diligence ➔ Appraisal & Financing ➔ Closing Recording*) with real-time status and contingency tracking.
- **Curated Property Portfolio**: Properties handpicked by the managing broker matching the buyer's budget and criteria with instant **"Request Private Walkthrough"** booking.
- **Showing Itinerary**: Chronological schedule of accompanied private tours with date, time, and address.
- **Encrypted Document Vault**: Access to signed Purchase Agreements, Preliminary Title Reports, Inspection disclosures, and verified Escrow Wire instructions.
- **Direct Broker Concierge Chat**: Direct messaging line with managing broker Sarah Jenkins, writing directly into the CRM client activity timeline.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution

```bash
# 1. Navigate to directory
cd C:\Users\DELL\real-estate-crm

# 2. Seed database with realistic luxury real estate data
npm run seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Architecture (Prisma + SQLite)

- **`Property`**: Listings inventory, pricing, bedrooms, bathrooms, square footage, amenities, coordinates, status, and agent assignment.
- **`Lead`**: Clients, buyers, sellers, budget min/max, preferred location, priority, and source.
- **`Deal`**: Transactions, pipeline stage, deal value, commission percentage, probability, and closing date.
- **`Showing`**: Appointments, property viewings, inspections, agent, timestamps, and status.
- **`Activity`**: Audit trail of phone calls, meetings, notes, and deal stage promotions.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **ORM & Database**: Prisma 6 + SQLite (`dev.db`)
- **TypeScript**: Fully type-safe
