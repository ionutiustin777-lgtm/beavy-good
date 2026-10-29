# Beavy Good

A clean, incremental rebuild of Beavy: a Romanian grocery budget and basket-planning app.

## Current scope

- Responsive Romanian-language budget planner UI
- Budget, household size, planning period, food categories and shopping priority
- No external price feeds, database, authentication or retailer integrations yet
- The current submit action is a UI prototype only; it does not claim live prices or generate a real basket

## Stack

- React + TypeScript
- Vite
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Product principles

1. Optimize the total basket cost, not isolated item prices.
2. Keep physical-store and delivery offers distinct unless verified to be equivalent.
3. Include delivery fees and SGR deposits where applicable.
4. Label verified prices, estimates and stale data clearly.
5. Use authorized, transparent data sources; no Laraft integration.
6. Add Supabase and Cloudflare only when the relevant feature is ready to be tested.

## Roadmap

1. Foundation and responsive budget planner
2. Canonical food-product catalog and search
3. Basket model and transparent cost calculations
4. Legitimate offer data sources and freshness metadata
5. Supabase persistence
6. Cloudflare deployment and smoke tests
