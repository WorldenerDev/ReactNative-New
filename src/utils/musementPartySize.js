/**
 * Musement quantity / party-size helpers.
 * Product min_buy is per ticket holder; timeslot min_buy is the total party size.
 * max_buy of -1 means unlimited. max_buy of 0 means unavailable.
 */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function effectiveProductMinBuy(minBuy) {
  const n = toNumber(minBuy);
  if (n == null || n < 1) return 1;
  return n;
}

export function effectiveMaxBuy(maxBuy) {
  const n = toNumber(maxBuy);
  if (n == null || n < 0) return Number.POSITIVE_INFINITY;
  return n;
}

export function nextTicketQuantity(currentQty, change, minBuy, maxBuy) {
  const current = Number(currentQty) || 0;
  const min = effectiveProductMinBuy(minBuy);
  const max = effectiveMaxBuy(maxBuy);

  if (change > 0) {
    if (max === 0) return current;
    const next = current === 0 ? min : current + change;
    return Math.min(next, max);
  }

  const next = current + change;
  return next < min ? 0 : Math.max(0, next);
}

export function canIncrementTicket({
  ticket,
  quantities,
  ticketTypes,
  slotMaxBuy,
}) {
  const qty = quantities[ticket.id] || 0;
  const max = effectiveMaxBuy(ticket.max);
  if (max === 0 || qty >= max) return false;

  const next = nextTicketQuantity(qty, 1, ticket.min, ticket.max);
  if (next === qty) return false;

  const othersTotal = (ticketTypes || []).reduce((sum, item) => {
    if (item.id === ticket.id) return sum;
    return sum + (quantities[item.id] || 0);
  }, 0);
  const slotMax = effectiveMaxBuy(slotMaxBuy);
  if (Number.isFinite(slotMax) && othersTotal + next > slotMax) return false;

  return true;
}

export function getPartySizeError({
  tickets,
  quantities,
  slotMinBuy,
  slotMaxBuy,
}) {
  const selected = (tickets || [])
    .map((ticket) => ({
      name: ticket.name || "This ticket",
      quantity: quantities[ticket.id] || 0,
      min_buy: ticket.min,
      max_buy: ticket.max,
    }))
    .filter((ticket) => ticket.quantity > 0);

  if (!selected.length) {
    return "Please select at least one ticket";
  }

  for (const item of selected) {
    const min = toNumber(item.min_buy);
    const max = toNumber(item.max_buy);
    if (min != null && min >= 1 && item.quantity < min) {
      return `${item.name} requires at least ${min} ticket${min === 1 ? "" : "s"}`;
    }
    if (max != null && max >= 0 && item.quantity > max) {
      return `${item.name} allows at most ${max} ticket${max === 1 ? "" : "s"}`;
    }
  }

  const total = selected.reduce((sum, item) => sum + item.quantity, 0);
  const slotMin = toNumber(slotMinBuy);
  const slotMax = toNumber(slotMaxBuy);

  if (slotMin != null && slotMin >= 1 && total < slotMin) {
    return `This timeslot requires at least ${slotMin} tickets in total`;
  }
  if (slotMax != null && slotMax >= 0 && total > slotMax) {
    return `This timeslot allows at most ${slotMax} tickets in total`;
  }

  return null;
}
