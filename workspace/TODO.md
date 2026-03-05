<instructions>
This file powers chat suggestion chips. Keep it focused and actionable.

Rules:
- Each task must be wrapped in "<todo>" and "</todo>" tags.
- Inside each <todo> block:
  - First line: title (required)
  - Second line: description (optional)
- You should proactively maintain this file after each response, even if the user did not explicitly ask.
- Add tasks only when there are concrete, project-specific next steps from current progress.
- Do NOT add filler tasks. Skip adding if no meaningful next step exists.
- Keep this list high-signal and concise, usually 1-3 strong tasks.
- If there are already 3 strong open tasks, usually do not add more.
- Remove or rewrite stale tasks when they are completed, obsolete, duplicated, or clearly lower-priority than current work.
- Re-rank remaining tasks by current impact and urgency.
- Prefer specific wording tied to real project scope/files; avoid vague goals.
</instructions>

<todo>
Set up pricing formulas for your products via /admin → Products
Edit each product, open "Pricing Formula", set Sell Price, add quantity tiers for volume discounts, and configure size/color/coating upcharges
</todo>

<todo>
Connect WordPress blog via /admin → Blog / WP tab
Enter your WordPress site URL, username, and Application Password, then click Test Connection and enable the integration
</todo>

<todo>
Set up Formspree for order email notifications
Replace YOUR_ORDER_FORM_ID in src/utils/sendOrderEmail.ts with a real Formspree form ID so order emails are sent to order@customprintdfw.com
</todo>

<todo>
Add sample products and services via /admin
Populate the Products, Services, and Portals tabs so the storefront shows real content to customers
</todo>


