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

1. User enters `shipId` + `year`  
2. Frontend validates  
3. API client calls **`GET /compliance/cb`**  
4. Express extracts parameters  
5. Repository fetches matching route  
6. Core logic computes Compliance Balance (CB)  
7. Express returns the shaped response:

```json
{
  "cb_before": -340.95,
  "cb_after": -340.95,
  "applied": 0
}

## (B) Banking Surplus

1. UI calls **`bankSurplus(shipId, year)`**
2. Express fetches the route
3. Core computes CB (surplus or deficit)
4. Repository inserts a **positive bank entry**
5. Express returns an updated CB snapshot

---

## (C) Applying Surplus

1. UI calls **`applyBankSurplus(shipId, year)`**
2. Core identifies the **deficit amount**
3. Repository checks **available banked surplus**
4. System applies:
  min(deficit, availableSurplus)

5. A **negative bank entry** is inserted
6. Updated CB values are returned to the UI

---

## (D) Pooling Workflow

1. User adds pool members with their `cbBefore`
2. UI validates:

   - **Pool sum ≥ 0**

3. UI calls **`POST /pools`**
4. Express validates the payload
5. Core pooling logic redistributes CB across ships
6. Repository persists:

   - pool record  
   - pool members with `cbAfter`

7. UI displays the before/after results table

---

# 5. 🧪 Testing Agents

Full testing covers all layers:

### ✔ Unit Tests
- `computeCB`
- `comparison`
- `pooling`

### ✔ Integration Tests
- `GET /routes`
- `GET /routes/comparison`
- `POST /banking/bank`
- `POST /banking/apply`
- `POST /pools`

### ✔ Database Tests
- Uses **pg-mem** (an in-memory PostgreSQL emulator)
- Safe, isolated, deterministic database behavior

---

# 6. ⭐ Final Summary

This agent-driven architecture ensures:

- Clean separation of concerns  
- High maintainability  
- Easy debugging  
- Accurate FuelEU calculations  
- Predictable, testable behavior  
- Scalable design for future extensions  

### Final Signal Flow

UI Agent
↓
API Client Agent
↓
HTTP Agent (Express)
↓
Core Logic Agents
↓
Database Agent (Postgres)
↓
Back to UI

The system is fully modular, testable, and aligned with professional backend patterns.



