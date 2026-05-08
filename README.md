# CEX-Backend

Backend for a centralized cryptocurrency exchange — order book, matching engine, multi-chain deposits and withdrawals, real-time trading. Built at Metadee AI (Jan–Apr 2025).

Pairs with [CEX-Frontend](https://github.com/jayeshy14/CEX-Frontend).

---

## What's in here

| Subsystem | Code | What it does |
|-----------|------|--------------|
| **Matching engine** | `services/matchingEngine.js` | Matches buy/sell orders against the book; emits trades; updates wallet balances atomically |
| **Order book** | `utils/trading/orderBook.js` | Sorted price-time-priority book per trading pair |
| **Trade execution** | `utils/trading/executeTrade.js` | Settles a matched pair: locks → debits → credits → records |
| **Multi-chain deposits** | `utils/EVM-chains/`, `utils/BTC/`, `utils/Solana/` | Per-chain deposit-address generation and inbound transfer monitoring |
| **Deposit monitoring** | `services/monitorDeposits.js` | Webhook-driven (EVM chains) and polling (BTC/SOL) ingestion |
| **Pricing** | `services/priceUpdater.js` | CoinGecko polling + in-memory cache (`node-cache`, 60s TTL) |
| **Auth** | `controllers/authController.js` | Email/password + Google OAuth + password reset |
| **API docs** | `swagger.js`, `swagger-docs/` | Swagger / OpenAPI spec for every route |

---

## Stack

- **Runtime** — Node.js + Express
- **Database** — MongoDB (Mongoose)
- **Chains** — Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Bitcoin, Solana (10+ chains via per-chain util modules)
- **Wallets** — HD-derivation via `bip32`/`bip39`; Bitcoin via `bitcoinjs-lib` + `coinselect`; Solana via `@solana/web3.js` and `@solana/spl-token`
- **Pricing** — CoinGecko API
- **Caching** — `node-cache` for hot price data
- **Documentation** — Swagger
- **Containerization** — Docker + docker-compose

---

## Run locally

Prerequisites: Node 20+, Docker, MongoDB.

```bash
git clone https://github.com/jayeshy14/CEX-Backend.git
cd CEX-Backend
cp .env.example .env   # fill in keys
docker-compose up -d --build
```

Swagger docs: `http://localhost:3000/api-docs`

---

## Project structure

```
.
├── index.js                 Entry — Express bootstrap, route mounting
├── config/                  DB + env config
├── controllers/             Route handlers (auth, orders, deposits, withdrawals)
├── routes/                  Express routers
├── services/                Long-running / orchestration logic
│   ├── matchingEngine.js
│   ├── monitorDeposits.js
│   ├── priceUpdater.js
│   ├── cancelOrder.js
│   └── cacheService.js
├── utils/
│   ├── trading/             Order book + trade execution
│   ├── EVM-chains/          Per-EVM-chain deposit logic
│   ├── BTC/                 Bitcoin deposit / xpub / sweeps
│   ├── Solana/              Solana SPL deposits
│   ├── deposits/            Cross-chain deposit utilities
│   ├── scheduleSweeps.js    Cron-style fund sweeps to hot wallets
│   └── transferTokens.js    Outbound withdrawal executor
├── models/                  Mongoose schemas (User, Wallet, Order, Trade, ...)
├── seed.js                  Seeds supported chains/tokens for local dev
├── Dockerfile
└── docker-compose.yml
```

---

## License

MIT
