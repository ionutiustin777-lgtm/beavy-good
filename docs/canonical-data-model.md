# Beavy: canonical data model

## Canonical product
A canonical product describes what the shopper wants, independent of retailer:
- stable internal ID and normalized name;
- brand, when known;
- food category;
- net quantity and standardized unit;
- barcode, only when verified;
- matching status: verified, needs review, or rejected.

Do not merge products automatically based only on similar names. Brand, size, variant, and unit can change equivalence.

## Retailer offer
An offer belongs to one canonical product and preserves its provenance:
- retailer and channel (physical, delivery, or marketplace);
- permitted source name and source URL;
- retailer product ID, when available;
- observed price and price per base unit;
- promotion conditions and validity, when known;
- SGR deposit, separate from product price;
- observation timestamp and verification status.

A price without a source and observation timestamp must not be presented as verified. Estimated or stale values must be labeled clearly.

## Basket total
Calculate separately:
1. product subtotal;
2. eligible discounts and their conditions;
3. SGR deposits;
4. delivery and order-level fees;
5. estimated amount payable.

Delivery fees belong to the order, not each product. Do not apply a promotion unless its conditions are met. Do not combine offers across channels unless the actual shopping flow supports that basket.

## Source policy
- Do not use Laraft or take data from sources without a permitted basis.
- Prefer official APIs, authorized feeds, explicitly reusable datasets, or manually verified data.
- Preserve source and observation time for every offer.
- If a price cannot be verified, mark it missing, stale, or estimated; never invent it.

This document defines rules; it does not claim that any data source or integration is connected.
