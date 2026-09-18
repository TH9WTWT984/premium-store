export const DEFAULT_PENDING_ORDER_TIMEOUT_MINUTES = 30;

export function getPendingOrderTimeoutMinutes() {
  const raw = Number(process.env.PENDING_ORDER_TIMEOUT_MINUTES ?? DEFAULT_PENDING_ORDER_TIMEOUT_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PENDING_ORDER_TIMEOUT_MINUTES;
}

export function getPendingOrderExpiresAt(createdAt: Date) {
  return new Date(createdAt.getTime() + getPendingOrderTimeoutMinutes() * 60_000);
}

export function isPendingOrderExpired(createdAt: Date, now = new Date()) {
  return now.getTime() >= getPendingOrderExpiresAt(createdAt).getTime();
}
