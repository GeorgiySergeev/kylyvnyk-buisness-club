# Skill: PII contracts on public routes

## The only public data-returning route in MVP

`GET /en/verify-card/[number]`

**Allowed response fields — exactly these 5:**

```ts
type PublicCardDTO = {
  number: string;
  memberName: string | null;
  memberType: "VIP" | "BUSINESS" | "FREE" | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "NOT_FOUND";
  expiresAt: string | null;
};
```

**Forbidden in this response:**
userId, email, phone, clerkUserId, createdAt, updatedAt,
stripeCustomerId, countryId, cityId, role, anything else.

## Implementation rules

```ts
// ✅ Always return through typed DTO
return {
  number: card.number,
  memberName: card.user.displayName,
  memberType: card.memberType,
  status: card.status,
  expiresAt: card.expiresAt?.toISOString() ?? null,
};

// ❌ Never spread DB row
return { ...card };              // leaks all columns
return { ...card, ...card.user }; // catastrophic
```

## NOT_FOUND must have same shape

```ts
// ✅ Constant shape — prevents existence oracle via response size
if (!card) {
  return {
    number: requestedNumber,
    memberName: null,
    memberType: null,
    status: "NOT_FOUND",
    expiresAt: null,
  };
}
```

## Playwright assertion (required for every public route)

```ts
test("verify-card returns only allowed PII keys", async ({ request }) => {
  const res = await request.get("/api/cards/lookup/VIP-UA-SEED00001");
  const body = await res.json();
  expect(Object.keys(body).sort()).toEqual(
    ["expiresAt", "memberName", "memberType", "number", "status"].sort()
  );
});
```

## No caching on this route

```ts
// ✅
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ❌ — admin revoking a card must take effect immediately
export const revalidate = 120;
```

## Rate limiting (Patch-08)

Per-IP: 10 lookups / minute.
Per-number: 5 lookups / 10 minutes.
Upstash fails closed (if Redis unreachable → block the request).