# Requirements: Backers

**Defined:** 2026-03-07
**Core Value:** A non-crypto fan can visit a creator's page, sign in with Google, and buy shares in one flow — with every trade generating real onchain volume and creator earnings through Bags.

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: API routes proxy all Bags API calls server-side with API key
- [x] **INFRA-02**: Token state data cached (30s TTL) to reduce API calls
- [ ] **INFRA-03**: Error boundaries and loading states on all routes
- [x] **INFRA-04**: Environment variable validation at startup

### Authentication

- [ ] **AUTH-01**: User can sign in with Google via Privy
- [ ] **AUTH-02**: Privy creates embedded Solana wallet on first login
- [ ] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: Auth-gated routes (dashboard, trade actions) redirect to login

### Landing Page

- [ ] **LAND-01**: Creator grid displays 5-10 pre-seeded creators with live data
- [ ] **LAND-02**: Each creator card shows avatar, name, token price, backer count
- [ ] **LAND-03**: Search bar allows typing any Twitter handle to find/create creator page
- [ ] **LAND-04**: Clear value proposition visible in first viewport without scrolling
- [ ] **LAND-05**: Page loads in under 2 seconds with pre-cached data

### Creator Page

- [ ] **CREA-01**: Creator page displays token stats from Bags State API (price, market cap, holders)
- [ ] **CREA-02**: Creator page shows fee earnings data (lifetime fees)
- [ ] **CREA-03**: Launch status badge shows token graduation state
- [ ] **CREA-04**: "Buy Shares" button initiates purchase flow
- [ ] **CREA-05**: "Sell Shares" button visible when user holds tokens
- [ ] **CREA-06**: Creator page works for any Twitter handle (permissionless)

### Trading

- [ ] **TRAD-01**: User can buy shares via Bags Trade API (transaction built server-side, signed client-side)
- [ ] **TRAD-02**: User can sell shares via Bags Trade API
- [ ] **TRAD-03**: Trade confirmation shows amount, price impact, and fees
- [ ] **TRAD-04**: Trade success/failure feedback displayed to user
- [ ] **TRAD-05**: All trades executed through partner key for revenue tracking

### Token Launch

- [ ] **LAUN-01**: User can launch token for creator without one (champion model)
- [ ] **LAUN-02**: Launch costs 0.2 SOL, clearly communicated before confirmation
- [ ] **LAUN-03**: Champion configures fee share split at launch
- [ ] **LAUN-04**: After launch, creator page immediately shows live data

### Wallet & Funding

- [ ] **WALL-01**: User can view embedded wallet SOL balance
- [ ] **WALL-02**: Fund wallet button triggers Privy MoonPay/Coinbase Pay flow
- [ ] **WALL-03**: Insufficient balance detected before trade with funding prompt

### Portfolio

- [ ] **PORT-01**: Dashboard shows user's token holdings with current value
- [ ] **PORT-02**: Each holding shows P&L (gain/loss)
- [ ] **PORT-03**: Dashboard shows total portfolio value
- [ ] **PORT-04**: Wallet SOL balance displayed on dashboard

### Demo Readiness

- [ ] **DEMO-01**: 5-10 creators pre-seeded with active Bags tokens on landing page
- [ ] **DEMO-02**: Real onchain trades executed for verifiable activity
- [ ] **DEMO-03**: App works standalone without explanation (async judging ready)

## v2 Requirements

### Partner Revenue

- **PART-01**: Partner revenue dashboard showing earnings from platform trades
- **PART-02**: Fee claiming interface for accumulated partner fees

### Creator Earnings

- **EARN-01**: Creator earnings display with lifetime fees and claim history
- **EARN-02**: Fee claim execution through Bags Fee Claiming API

### Enhanced Portfolio

- **PORT-05**: Transaction history with timestamps and tx hashes
- **PORT-06**: Price charts for held tokens

### Discovery

- **DISC-01**: Trending creators section based on volume/activity
- **DISC-02**: Category/tag filtering for creators

## Out of Scope

| Feature | Reason |
|---------|--------|
| Creator self-registration | Contradicts permissionless model |
| Custom fiat integration (Stripe) | Privy handles natively |
| Mobile app | Web-first for hackathon |
| Notifications | Not needed for hackathon |
| Admin dashboard | Not needed for hackathon |
| Social features (comments, follows) | Not the product — Backers is about financial backing |
| Content creation tools | Not the product |
| Real-time price websockets | Polling/caching sufficient for hackathon |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Complete |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-04 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| CREA-01 | Phase 3 | Pending |
| CREA-02 | Phase 3 | Pending |
| CREA-03 | Phase 3 | Pending |
| CREA-04 | Phase 3 | Pending |
| CREA-05 | Phase 3 | Pending |
| CREA-06 | Phase 3 | Pending |
| TRAD-01 | Phase 4 | Pending |
| TRAD-02 | Phase 4 | Pending |
| TRAD-03 | Phase 4 | Pending |
| TRAD-04 | Phase 4 | Pending |
| TRAD-05 | Phase 4 | Pending |
| LAUN-01 | Phase 5 | Pending |
| LAUN-02 | Phase 5 | Pending |
| LAUN-03 | Phase 5 | Pending |
| LAUN-04 | Phase 5 | Pending |
| WALL-01 | Phase 4 | Pending |
| WALL-02 | Phase 4 | Pending |
| WALL-03 | Phase 4 | Pending |
| PORT-01 | Phase 6 | Pending |
| PORT-02 | Phase 6 | Pending |
| PORT-03 | Phase 6 | Pending |
| PORT-04 | Phase 6 | Pending |
| DEMO-01 | Phase 7 | Pending |
| DEMO-02 | Phase 7 | Pending |
| DEMO-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*
