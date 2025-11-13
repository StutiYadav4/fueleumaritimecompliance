# 🚀 FuelEU Maritime Dashboard – Agent Workflow Documentation

This document explains how the **frontend**, **backend**, **core logic**, and **database adapters** work together in an agent-style workflow.  
The system uses **Hexagonal Architecture**, ensuring clean separation of concerns and easy testing.

---

# 1. 🎯 System Overview

The FuelEU Dashboard supports:

- Route management
- Baseline comparison
- GHG intensity checks
- Compliance Balance (CB) calculation
- Banking of surplus (Article 20)
- Applying banked surplus to deficits
- Pooling of ships (Article 21)

Architecture flow:

User → Frontend → API Client → Express HTTP → Core Logic → Database → Back to UI

yaml
Copy code

---

# 2. 🧠 Agent Responsibilities

## **A) Frontend UI Agent (React + Tailwind)**

Responsible for:

- Rendering tabs:
  - Routes
  - Compare
  - Banking
  - Pooling
- Capturing inputs (shipId, year, CB values)
- Validating:
  - "Enter valid ship ID"
  - "CB must be a number"
- Showing results, tables, alerts, pass/fail
- Never calculates any business logic (CB, pooling, banking)

The frontend behaves as a **presentation agent**.

---

## **B) API Client Agent (`useApi.ts`)**

This agent abstracts all backend calls.

It provides clean functions:

fetchRoutes()
setBaseline(id)
fetchComparison()
fetchCB(shipId, year)
bankSurplus(shipId, year)
applyBankSurplus(shipId, year)
createPool(year, members)

yaml
Copy code

Responsibilities:

- Validate inputs before hitting the backend
- Standardize response format
- Provide a consistent interface to the UI

This ensures the UI never touches raw URLs or Axios manually.

---

## **C) HTTP Agent (Express Server)**

Located at:

src/adapters/inbound/http/expressServer.ts

markdown
Copy code

Responsibilities:

- Convert HTTP requests → function calls
- Validate request parameters
- Send JSON responses back to frontend
- Error handling and shaping frontend-friendly errors

Endpoints this agent exposes:

### `/routes`  
- GET all routes  
- POST set baseline  
- GET comparison report  

### `/compliance`
- GET CB for ship + year

### `/banking`
- GET records  
- POST bank  
- POST apply surplus  

### `/pools`
- POST create pool with allocations  

It does **zero business logic** — only routing.

---

## **D) Core Logic Agents (Application / Domain Layer)**

These are the "intelligence" of the entire system.

Located in:

src/core/application/

markdown
Copy code

### 1. **computeCBForRoute.ts**  
Implements official FuelEU calculation:

energy = fuelConsumptionT × 41,000 (MJ)
delta = targetIntensity − actualIntensity
cb_g = delta × energy
cb_t = cb_g / 1,000,000

yaml
Copy code

Returns both grams and tonnes.

---

### 2. **comparison.ts**  
Given baseline + route:

- Computes percent difference
- Flags route as compliant or not
- Makes the Compare tab work

---

### 3. **pooling.ts**  
Implements **FuelEU Article 21 Pooling**:

Rules enforced:

- Total pool sum ≥ 0  
- Surplus ships cannot go negative  
- Deficit ships cannot exit worse  
- Allocation is greedy from largest surplus → largest deficit  

Returns new `cbAfter` for every ship.

---

# 3. 🧱 Database Agent (Postgres Adapter)

Located in:

src/adapters/outbound/postgres/pgRepo.ts

markdown
Copy code

Responsibilities:

- Read/write DB rows
- Fetch by routeId + year
- Insert bank entries
- Compute available bank balance
- Register pools and members

Tables used:

| Table | Purpose |
|-------|---------|
| routes | seeded ship routes |
| bank_entries | banking records |
| pools | pooling events |
| pool_members | ship allocations |

This agent ensures **backend logic stays database-independent**.

---

# 4. 🔗 End-to-End Workflow Example

## **(A) Computing CB**

1. User enters shipId + year  
2. Frontend validates  
3. API client calls `/compliance/cb`  
4. Express extracts inputs  
5. Repo fetches route  
6. Core computes CB  
7. Express returns:

```json
{
  "cb_before": -340.95,
  "cb_after": -340.95,
  "applied": 0
}
(B) Banking surplus
UI calls bankSurplus(shipId, year)

Express fetches route

Core calculates CB

Repo inserts positive bank entry

New CB snapshot returned

(C) Applying surplus
UI calls applyBankSurplus

Core determines deficit

Repo checks available bank

Applies min(deficit, available)

Inserts negative bank entry

Returns updated values

(D) Pooling workflow
User adds members with cbBefore

UI validates pool sum

Calls /pools

Express validates members

Core pooling agent redistributes

Repo persists

UI shows before/after table

5. 🧪 Testing Agents
The testing workflow validates:

✔ Unit Tests
computeCB

comparison

pooling

✔ Integration Tests
GET /routes

GET /comparison

POST /bank

POST /apply

POST /pools

✔ Database Tests
Using pg-mem (in-memory Postgres) for safe testing.

6. ⭐ Final Summary
This agent-driven structure guarantees:

Clean separation of UI / logic / database

High maintainability

Easy debugging

Accurate FuelEU computations

Full understanding of end-to-end flow

Scalable structure for future features

Final signal flow:
pgsql
Copy code
UI Agent
 ↓
API Client Agent
 ↓
HTTP Agent
 ↓
Core Logic Agents
 ↓
Database Agent
 ↓
Back to UI
It is fully modular, testable, and aligns with professional backend architecture standards.
