export function extractHttpsUrl(input) {
  if (!input) return null;
  const match = String(input).match(/https:\/\/[^\s<>"']+/i);
  if (!match) return null;
  try {
    return decodeURIComponent(match[0]).replace(/[),.;]+$/g, "");
  } catch (error) {
    return match[0].replace(/[),.;]+$/g, "");
  }
}

export function parseInboundLink(raw) {
  if (!raw || typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const appScheme = value.match(/^([a-z0-9.]+):\/\/([^?#]*)(\?[^#]*)?/i);
  const scheme = appScheme?.[1]?.toLowerCase();
  const isAppScheme = scheme === "live.worldener.app" || scheme === "worldener";

  if (!isAppScheme) {
    const url = extractHttpsUrl(value);
    return url ? { action: "save", url } : null;
  }

  const path = appScheme[2] || "";
  const params = new URLSearchParams((appScheme[3] || "").replace(/^\?/, ""));
  const sharedUrl = extractHttpsUrl(params.get("url") || "");

  if (path === "save" || path.startsWith("save")) {
    return { action: "save", url: sharedUrl };
  }
  if (path === "create-trip" || path.startsWith("create-trip")) {
    return { action: "createTrip", url: sharedUrl };
  }
  const wishlist = path.match(/^trip\/([^/]+)\/wishlist\/?$/);
  if (wishlist) {
    return { action: "wishlist", tripId: decodeURIComponent(wishlist[1]) };
  }
  return null;
}

export function formatTripShareTitle(trip) {
  const name = trip?.name || trip?.destination || trip?.city?.name || "Trip";
  if (!trip?.start_at) return name;
  const date = new Date(trip.start_at);
  if (Number.isNaN(date.getTime())) return name;
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${name} - ${label}`;
}

export function memberCountLabel(count) {
  const total = Number(count) || 1;
  return `${total} member${total === 1 ? "" : "s"}`;
}
