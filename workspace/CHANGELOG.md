<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
### [2026-03-05] — User Confirmed System Working
- User confirmed all features working correctly

### [2026-03-05] — WordPress Connection Verified Working
- Confirmed WordPress integration working correctly in both admin panel and live site
- Removed temporary debug logs from `WordPressAdmin` and `SocialBlog` components
- Files changed: `src/pages/AdminPage/components/WordPressAdmin.tsx`, `src/sections/SocialBlog/index.tsx`

### [2026-02-27] — Multi-Item Sq Ft Calculator in Admin Pricing Formula
- Added `sqftCalcItems` state (array of `{w, h, qty}` rows) to `ProductsAdmin`
- Calculator renders inside the Sq Ft Pricing section: add/remove rows, each shows per-row sq ft
- Running totals row shows total sq ft across all items, min sq ft floor, rate, and estimated total price
- "Clear all" button resets rows; single-item quick preview kept below for reference
- Files changed: `src/pages/AdminPage/components/ProductsAdmin.tsx`

### [2026-02-27] — Sq Ft Pricing Mode for Products
- Added `sqftEnabled`, `sqftPricePerSqFt`, `sqftMinSqFt` fields to `Product` entity
- Added `calculateSqftPrice()` to `pricingCalculator.ts` — computes (W×H÷144)×qty×rate, enforces min sq ft floor, adds rush fee
- Updated `ProductsAdmin` — "Sq Ft Pricing" toggle section in Pricing Formula with price/sq ft, min sq ft, and live preview calculator (width/height/qty inputs)
- Updated `ProductDetailModal` — when sqft mode active, shows W×H×Qty dimension inputs instead of size/qty dropdowns; live sq ft breakdown panel; order/cart saves dimensions as size string
- Product cards show "Sq ft pricing" badge instead of "Formula active" when sqft mode is on

### [2026-02-27] — Product Pricing Formula Engine
- Added 7 new fields to `Product` entity: `costPerItem`, `sellPrice`, `pricingTiers`, `colorUpcharge`, `sizeUpcharge`, `coatingUpcharge`, `rushUpcharge`
- Created `src/utils/pricingCalculator.ts` — `calculatePrice()` resolves tier-based unit price, applies per-unit size/color/coating upcharges, adds flat rush fee, returns full `PricingResult`
- Updated `ProductsAdmin` — collapsible "Pricing Formula" section with cost/sell/rush fields, quantity tier table, size/color/coating upcharge tables (Load Defaults + custom rows), live pricing preview table with discount %, and profit margin display
- Updated `ProductDetailModal` — replaced hardcoded formula with `calculatePrice()`; shows itemized price breakdown panel (tier, adjustments, rush fee) and savings badge when volume discount applies
- Cart subtotal now reflects real formula; backward-compatible (falls back to `product.price` if no formula set)

### [2026-02-26] — Fix Mobile Menu Not Appearing
- Root cause: `<MobileMenu />` was rendered after the footer in `App.tsx`, so toggling it made it visible at the bottom of the page
- Fix: moved `<MobileMenu />` into `Navbar/index.tsx`, rendered directly below the `<nav>` bar inside a shared sticky wrapper
- Files changed: `src/sections/Navbar/index.tsx`, `src/App.tsx`

### [2026-02-26] — WordPress Blog Integration
- Added `WordPressSettings` entity (siteUrl, apiUsername, apiPassword, enabled, postsPerPage, label)
- Created `src/pages/AdminPage/components/WordPressAdmin.tsx` — full setup UI with step-by-step instructions, Application Password guide, Test Connection button, CORS note, and live API endpoint preview
- Added "Blog / WP 📝" tab to `AdminPage`
- Updated `SocialBlog` to fetch live posts from WordPress REST API (`/wp-json/wp/v2/posts?_embed`) when enabled; falls back to static posts on error
- "View All Posts" button links to the WordPress site when connected; "Live from WordPress" badge shown when active

### [2026-02-26] — Fix Tailwind Directive Order
- `@tailwind base` was declared AFTER `@tailwind components` and `@tailwind utilities` in `tailwind.css`
- This caused base CSS resets to override utility classes, breaking the entire layout
- Fixed by reordering to the correct sequence: base → components → utilities
- Files changed: `tailwind.css`

### [2026-02-26] — Add SEO Meta Tags and Structured Data
- Added `<meta name="keywords">` with 40+ keywords: custom print, banners, signs, car wraps, embroidery, Terrell TX, DFW, etc.
- Expanded `<meta name="description">` to include all services and service areas
- Added Open Graph, Twitter Card, canonical URL, and geo meta tags
- Added JSON-LD `LocalBusiness` structured data schema for Google rich results
- Files changed: `index.html`

### [2026-02-26] — Diagnosed ERR_SSL_VERSION_OR_CIPHER_MISMATCH on live domain
- Error is on `customprintdfw.com` hosting server, not in app code
- Cause: outdated TLS version/cipher suite on the hosting SSL certificate
- Fix: renew SSL cert via hosting dashboard or re-issue Let's Encrypt via cPanel
- Recommended: verify with ssllabs.com/ssltest/analyze.html?d=customprintdfw.com

### [2026-02-26] — Fix ERR_SSL_VERSION_OR_CIPHER_MISMATCH Font Loading
- Root cause: `@font-face` URLs pointed to `cdn2.editmysite.com` which has SSL issues in Sandpack
- Replaced with Google Fonts CDN (`fonts.googleapis.com`) via `<link>` tags in `index.html`
- Removed broken `@font-face` declarations from `tailwind.css`
- Files changed: `index.html`, `tailwind.css`

### [2026-02-26] — Fix ERR_SSL_VERSION_OR_CIPHER_MISMATCH in PaymentButton
- Added 10s timeout to `loadScript` in `PaymentButton` to prevent hanging on SSL failures
- Added `onSkipPayment` prop to `PaymentButton`; error state now shows "Place Order — Pay Later / In Person" button
- Wired `onSkipPayment` in `CartSidebar`, `ProductDetailModal`, and `PortalStorefront` so users can always complete orders even when payment SDK fails to load

### [2026-02-26] — Update Facebook Link in Navbar
- Updated Facebook icon link in `NavbarLogo.tsx` to `https://www.facebook.com/profile.php?id=61573013084873`

### [2026-02-26] — Cart & Checkout System for Products
- Created `src/context/CartContext.tsx` — CartProvider with items, addItem, removeItem, clearCart, openCart/closeCart, totalPrice
- Created `src/components/CartSidebar/index.tsx` — slide-in cart panel with item list, checkout form, payment step, and success state
- Updated `ProductDetailModal` — added "Add to Cart" primary button (lime/yellow); "Upload Design" and "Design Online" become secondary; brief "Added!" flash then modal closes
- Updated `Navbar` — cart icon with live item count badge; clicking opens CartSidebar
- Updated `App.tsx` — wrapped MainSite with CartProvider; added CartSidebar render

### [2026-02-26] — PayPal/Square SDK Checkout Integration
- Added `paymentProvider` and `paymentReference` fields to `Order` entity via `backend_database_patch_entities`
- Created `src/hooks/usePaymentSettings.ts` — fetches the `main` PaymentSettings record and exposes `settings` + `isEnabled`
- Created `src/components/PaymentButton/index.tsx` — self-contained component that dynamically loads PayPal JS SDK or Square Web Payments SDK, renders the appropriate UI, and calls `onSuccess(details)` / `onError(msg)` callbacks
- Updated `ProductDetailModal` — added "payment" state; "Place Order" becomes "Continue to Payment →" when enabled; payment step shows order summary + PaymentButton; payment reference saved to Order record
- Updated `PortalStorefront` `OrderModal` — same payment step pattern with `step: "form" | "payment"` state; total calculated from unit price × qty

### [2026-02-26] — Payment Setup Tab in Admin Panel
- Added `PaymentSettings` entity (provider, enabled, paypalClientId, paypalMode, squareAppId, squareLocationId, squareEnvironment, label)
- Created `src/pages/AdminPage/components/PaymentsAdmin.tsx` — full UI to configure PayPal or Square with step-by-step setup instructions, secret field toggles, sandbox/production mode selector, and master on/off toggle
- Added "Payments 💳" tab to `AdminPage`; settings saved/updated as a single `label: 'main'` record in DB

### [2026-02-26] — Product Configurator Option Toggles (Admin + Modal)
- Added `enabledOptions` field to `Product` entity (comma-separated: size, paper, quantity, color, coating, cardSlit, productionTime)
- Updated `ProductsAdmin` form with per-option toggle switches + "All on / All off" shortcuts; product cards show colored badges for enabled/disabled options
- Updated `ProductDetailModal` to parse `enabledOptions` and conditionally render only enabled configuration sections
- Order form summary and DB save also respect enabled options (omits disabled fields)
- Default (no `enabledOptions` set) = all options shown (backward compatible)

### [2026-02-26] — Portal Product Options (Sizes, Colors, Styles, Print Types, Locations)
- Added 6 new fields to `PortalProduct` entity: `availableSizes`, `availableColors`, `availableStyles`, `printLocations`, `printTypes`, `minQty`
- Added `style`, `printLocation`, `printType` to `Order` entity
- Updated `PortalProductsAdmin` with `ChipSelector` component — preset chips + custom input for each option type; option count badges on product cards
- Updated `PortalStorefront` `OrderModal` — dynamic size pill buttons, color swatches (hex map), style/print-location/print-type selectors, +/− qty stepper with min qty enforcement
- Updated `sendOrderEmail` and `OrdersAdmin` expanded details to include all new fields

### [2026-02-26] — Order Email Notifications
- Created `src/utils/sendOrderEmail.ts` — Formspree-based utility that sends a formatted order notification email
- Integrated into `PortalStorefront` `OrderModal` and `ProductDetailModal` order submit handlers (fire-and-forget after DB save)
- User must replace `YOUR_ORDER_FORM_ID` in `sendOrderEmail.ts` with their Formspree form ID (recipient: order@customprintdfw.com)
- Email includes all order details: product, size, qty, price, paper, color, coating, production time, customer info, notes

### [2026-02-26] — Order Tracking System
- Added `Order` entity (type, status, customerName, customerEmail, productName, price, quantity, + config fields) via `backend_database_patch_entities`
- Updated `PortalStorefront` `OrderModal` to save orders to DB via `useMutation('Order')` with loading/error states
- Updated `ProductDetailModal` — "Upload Design" / "Design Online" now open an order form that saves to DB; success screen shows after
- Created `src/pages/AdminPage/components/OrdersAdmin.tsx` — full orders list with status filter, type filter, stats, inline status update, delete, expandable details
- Added "Orders 🛒" tab to `AdminPage`

### [2026-02-26] — Fix PortalProductsAdmin Build Error
- Hooks (`useQuery`, `useMutation`) and state were declared outside the component function body
- Moved all hooks/state inside `PortalProductsAdmin`; `ImageUploadField` kept as separate component above it

### [2026-02-26] — Smooth Scroll + Mobile Menu Auto-Close
- Added `scroll-behavior: smooth` and `scroll-padding-top: 80px` to `html` in `tailwind.css`
- Updated `MobileMenuList` to call `closeMobileMenu()` on every link click

### [2026-02-26] — Email Link Updated to Gmail Compose
- Changed email link in `ContactSection` from `mailto:` to Gmail compose URL (`mail.google.com/mail/?view=cm&to=...`)

### [2026-02-26] — Phone Link Updated to Google Voice
- Changed phone `tel:` link in `ContactSection` to Google Voice URL (`voice.google.com/calls?a=nc,...`)

### [2026-02-26] — Portal Products: Admin Management + Customer Storefront
- Added `PortalProduct` entity (portalId, name, price, image, description, category) via `backend_database_patch_entities`
- Created `src/pages/AdminPage/components/PortalProductsAdmin.tsx` — full CRUD for products scoped to a portal
- Updated `PortalsAdmin` with "Products" button per portal card that navigates into `PortalProductsAdmin`
- Created `src/components/PortalStorefront/index.tsx` — customer-facing modal with category filter, product grid, and order form
- Updated `WebToPrintPortals` "Shop Now" button to open `PortalStorefront` modal for that portal
### [2026-02-26] — Contact Form Formspree Integration
- Wired `ContactSection` form to Formspree via `fetch` POST (no new npm packages)
- Added controlled form state with `useState` for all fields + `FormState` type (idle/submitting/success/error)
- Success state shows confirmation screen; error state shows inline alert with message
- Button shows spinner + "Sending..." during submission; fields disabled while submitting
- User must replace `YOUR_FORM_ID` in `FORMSPREE_ENDPOINT` constant to activate
### [2026-02-26] — SDK Integration + Admin Panel
- Added `@animaapp/playground-react-sdk` 0.10.0; wrapped app with `AnimaProvider` in `src/index.tsx`
- Refactored `ServicesGrid`, `ProductShowcase`, `WebToPrintPortals` to use `useQuery` from SDK
- Removed local `Product` interface from `ProductDetailModal`; now uses SDK's `Product` type
- Created full admin panel at `/admin` (`src/pages/AdminPage/`) with CRUD for Products, Services, Portals
- Added `BrowserRouter` routing in `App.tsx`; Admin link in navbar (visible when logged in)
### [2026-02-26] — Web-to-Print Portals, Product Detail Modal, Social/Blog Added
- Created `src/sections/WebToPrintPortals/index.tsx` with school portals (Terrell, Kaufman, Forney ISD) and spirit shops
- Created `src/components/ProductDetailModal/index.tsx` with full configurator (size, paper, qty, color, coating, production time, pricing)
- Created `src/sections/SocialBlog/index.tsx` with social media cards (FB, IG, TikTok, X) and 3 blog posts
- Updated `ProductShowcase` to accept `onProductSelect` prop and trigger modal on click
- Updated `App.tsx` with useState for modal, added all new sections; updated nav with Portals + Blog links
### [2026-02-24] — CustomPrint DFW Website Created
- Built complete custom print shop website with brand colors (lime green, black, blue, yellow)
- Implemented hero section with logo, services grid (CNC, car wrap, DTF, t-shirt, embroidery, signs, banners)
- Added product showcase with 6 featured products and pricing
- Created contact section with business info (116 N. Adelaide St. Terrell TX, 972.863.1551, order@customprintdfw.com)
- Removed unused components (CartDropdown, NavbarCart, ContentSection, MobileMenuToggle)
</changelog>
