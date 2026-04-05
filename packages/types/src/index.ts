/**
 * Shared DTOs and API types for Ascension.
 * Populated in later stages (catalog, cart, checkout).
 */

export type UserRole = "customer" | "admin";

export type FulfillmentStatus = "pending" | "shipped" | "delivered";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
