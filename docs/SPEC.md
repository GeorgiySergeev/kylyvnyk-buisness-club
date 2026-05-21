# FINAL TECHNICAL SPECIFICATION

**KYLYVNYK CLUB — MVP MOBILE-FIRST VERSION**

---

## PROJECT CONCEPT

**KYLYVNYK CLUB** — international private membership platform,
registered in the USA.

**The project is positioned as:**

- international business club;
- private membership platform;
- premium partner network;
- verified partners directory;
- access system to special conditions.

**The project is NOT positioned as:**

- MLM;
- affiliate system;
- investment platform;
- financial system;
- wallet/payment platform;
- marketplace;
- income-generating site;
- passive income system.

---

## MAIN MVP GOAL

**Create:**

- simple;
- premium;
- mobile-first;
- fast;
- scalable;
- legally cautious website.

**Primary MVP task:**

- member registration;
- digital club card;
- partners directory;
- VIP subscription;
- business partner placement;
- Business Introductions without MLM mechanics.

---

## MAIN WEBSITE STYLE

**Style:**

- black & gold;
- luxury minimalism;
- large elements;
- minimum text;
- premium UI;
- mobile-first UX.

**Main focus:** maximum simplicity and clarity of use.

---

## HERO BLOCK

**On the first screen:**

- KYLYVNYK CLUB logo;
- international visual;
- planet / globe;
- premium atmosphere.

**Slogan:**

> Save. Develop your business. Live better.

**Under the slogan:** 3 main CTA buttons.

---

## THREE MAIN BUTTONS

### 1. BECOME A MEMBER

_Free_

- **Context:** Club card and access to partner offers.
- **Button:** Get Card

### 2. VIP MEMBER

_$19.99 / month_

- **Context:** Enhanced club features and Business Introductions.
- **Button:** Become a VIP Member

### 3. BUSINESS PARTNER

_from $19.99 / month_

- **Context:** Business placement after club verification.
- **Button:** Submit Business

---

## STATISTICS

**3 circular blocks:**

- members;
- countries;
- partners.

**Example:**

- 10,245+ members;
- 35+ countries;
- 1,250+ partners.

_Important: use only real or approximately confirmed data._

---

## TOP PARTNERS

On the main page: only 3 cards.

**Card contains:**

- logo;
- name;
- category;
- country;
- city;
- special condition;
- Details button.

_Allowed display: real discounts or special conditions._

---

## HOW IT WORKS

**4 steps:**

1. **Registration**  
   Fast registration in the club.
2. **Receiving the Card**  
   Digital club card in the personal account.
3. **Search for Partners**  
   Search by countries, cities, and categories.
4. **Access to Special Conditions**  
   Offers are available to club members after login.

---

## PARTNER FILTER

**Filters:**

- All countries;
- All cities;
- All categories;
- Find a partner.

**All buttons:**

- large;
- gold;
- mobile-friendly.

---

## RECOMMENDED PARTNERS

On the main page: 3 cards.  
Without open discounts.

**Text:** Special conditions available after registration.  
**Button:** Show More

---

## PARTNER CATALOG

Only businesses with the status `PUBLISHED` are displayed.

**Card:**

- logo;
- name;
- country;
- city;
- category;
- brief description;
- Details button.

---

## USER TYPES

### FREE MEMBER

**Can:**

- register;
- get a digital card;
- browse the catalog;
- see offers after login.

**Cannot:**

- submit a business;
- use VIP features.

### VIP MEMBER

**Cost:** $19.99 / month

**Can:**

- use VIP features;
- submit 1 business;
- use Business Introductions.

### BUSINESS PROFILE

This is: the user's business profile after administration approval.

**Provides:**

- business publication;
- placement in the catalog;
- participation in Business Introductions.

---

## BUSINESS INTRODUCTIONS

**Use only the term:** Business Introduction

**DO NOT use:**

- commission;
- earnings;
- affiliate;
- MLM;
- passive income;
- bonus per user.

_In MVP: without automatic payouts and without MLM mechanics._

---

## BUSINESS INTRODUCTIONS LOGIC

Only for VIP.  
Limits and restrictions: only via admin panel.

**Do not show publicly:**

- limits;
- levels;
- ratings;
- top members.

---

## REGISTRATION

### FREE MEMBER

**Minimum data:**

- email;
- password.

**Optional:**

- phone.

**Confirmation:**

- email verification; or
- SMS verification.

### VIP MEMBER

**Additionally:**

- first name;
- last name;
- country;
- city.

### BUSINESS PROFILE

**Minimum:**

- business name;
- representative name;
- email;
- phone;
- country;
- city;
- category;
- website/social link.

---

## DO NOT COLLECT IN MVP

**Do not collect:**

- passport;
- ID;
- date of birth;
- residential address;
- bank details;
- tax documents;
- internal balance;
- document photos.

---

## DIGITAL CLUB CARD

**QR leads to:** `/verify-card/VIP-UA-000501`

**Show:**

- name;
- card number;
- status;
- member type;
- expiry date.

**DO NOT show:**

- email;
- phone;
- payments;
- history;
- introductions.

---

## STRIPE

**Use:**

- Stripe Subscriptions;
- Stripe Payment Links;
- Stripe invoices;
- automatic receipts.

---

## SUBSCRIPTION CANCELLATION

**In the account:** Cancel VIP Membership

**Logic:**

- online cancellation;
- VIP remains active until the end of the period;
- next month is not charged;
- business is hidden after the subscription ends.

---

## STATUSES

### USER

- ACTIVE
- BLOCKED

### VIP

- ACTIVE
- CANCELED

### BUSINESS

- UNDER REVIEW
- PUBLISHED
- HIDDEN

---

## PERSONAL ACCOUNT

### FREE MEMBER

- digital card;
- catalog;
- special conditions;
- upgrade to VIP;
- profile.

### VIP MEMBER

- VIP access;
- catalog;
- Business Introductions;
- business submission;
- subscription;
- profile.

### BUSINESS PROFILE

- my business;
- publication status;
- subscription;
- profile.

---

## ADMIN PANEL

**Administrator manages:**

- users;
- VIP;
- businesses;
- categories;
- countries;
- Business Introductions;
- Stripe links;
- subscriptions;
- blocks;
- logs.

---

## LEGAL PAGES

**Mandatory:**

- Terms of Use;
- Privacy Policy;
- Cookie Policy;
- Refund Policy;
- Club Rules;
- Partner Rules;
- Business Introduction Rules;
- Disclaimer;
- Contact Us.

---

## MAIN LEGAL WORDING

**Add to footer and Terms:**

> KYLYVNYK CLUB is an independent private membership platform.
>
> KYLYVNYK CLUB is not an employer, investment platform, MLM company or
> guarantee-of-income system.
>
> Special conditions are provided directly by independent third-party partners.
>
> KYLYVNYK CLUB does not guarantee savings, income, commissions, bonuses,
> clients or business results.
>
> Partners independently provide their own services and are responsible for
> their own licenses, permits and compliance.
>
> KYLYVNYK CLUB does not participate in transactions, negotiations or agreements
> between users and partners.

---

## ARBITRATION & LIABILITY

**Add to Terms:**

- governing law;
- arbitration clause;
- waiver of class actions;
- limitation of liability;
- limitation of damages.

---

## REFUND POLICY

**Add:**

> Subscription fees are non-refundable except where required by law.

---

## HIGH-RISK CATEGORIES

**Do not allow in MVP:**

- crypto;
- gambling;
- adult;
- firearms;
- unlicensed financial services;
- high-risk investments.

---

## SECURITY

**Mandatory:**

- HTTPS;
- CAPTCHA;
- password hashing;
- email verification;
- admin 2FA;
- backups.
