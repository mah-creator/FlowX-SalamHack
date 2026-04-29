# FlowX PRD Discovery Answers for Approval

This document consolidates the answered questions, the Mohammed/Ahmad scenario, and the original FlowX proposal idea: FlowX matches local payment obligations so money does not need to physically move across borders.

---

# FlowX Questions & Proposed Answers for Approval

## 1. Product Vision & Scope

**1. What is the main goal of FlowX in one sentence?**  
FlowX makes cross-border money receiving and sending faster, cheaper, and more secure by matching local payment requests instead of moving money directly across borders.

**2. What is FlowX meant to be?**  
FlowX is both a **money transfer coordination platform** and a **matching platform**. It receives transfer requests, matches opposite needs, holds money through payment gateways/escrow, and completes the transfer after both sides are verified.

**3. What should the MVP include only?**  
The MVP should include:
- User accounts
- Transfer request creation
- Matching system
- Local payment through supported payment gateways
- Escrow/payment confirmation
- Admin dashboard
- Transaction status tracking
- Basic KYC/verification
- Dispute handling

**4. What features should be postponed until after MVP?**  
Post-MVP:
- Chatbot
- Advanced exchange rate system
- Full notification system
- Receipt download
- AI fraud detection
- Mobile apps
- Premium services
- Partner APIs
- Loyalty/referral system

**5. Is the first version for a hackathon/demo, real launch, or investor pitch?**  
Hackathon/demo first.

**6. Which countries should FlowX support in the first version?**  
First version should focus on **Gaza and selected Arab countries**, starting with **Gaza ↔ Egypt** as the main use case.

**7. Which transfer direction is highest priority?**  
Gaza → Arab country and Arab country → Gaza, with Gaza ↔ Egypt as the priority scenario.

**8. What problem should the product solve first?**  
The product should solve:
- Restrictions
- Availability
- Speed
- Trust
- Cost

Priority order: **availability and trust first**, then speed and cost.

---

## 2. Users & Roles

**9. Who are the main users?**  
- Sender/request creator  
- Receiver  
- Payer  
- Business user  
- Verified agent/merchant  
- Admin/support team

**10. Does every user need to create an account?**  
Yes.

**11. Can a user be both sender and receiver?**  
Yes.

**12. Will users be individuals only, or also businesses?**  
Both individuals and businesses.

**13. Do you want verified agents/merchants inside each country?**  
Yes, but agents can be post-MVP or limited in MVP.

**14. Should there be an admin dashboard?**  
Yes.

**15. Should there be a support/admin team that manually approves transactions?**  
Yes, especially for risky, high-value, failed, or disputed transactions.

**16. Should users have profiles, ratings, or trust scores?**  
Yes.

**17. What user information is required during signup?**  
- Full name  
- Phone number  
- Email  
- Country  
- Address  
- ID/passport  
- Selfie verification  
- Bank/wallet information  
- User type: individual, business, or agent

---

## 3. Core Transfer Flow

**18. How exactly should a transfer request work?**  
A user creates a request saying they need someone in another country to receive money. FlowX waits for an opposite request. Once matched, the payers deposit money locally through payment gateways. After both payments are confirmed, FlowX releases/completes the local payouts to the intended receivers.

**19. What fields does the user enter when creating a request?**  
- Amount  
- Source country  
- Destination country  
- Currency  
- Receiver full name  
- Receiver phone number  
- Receiver payment method  
- Deadline  
- Purpose/reason  
- Optional notes  
- Preferred speed  
- Whether partial matching is accepted

**20. Does the user choose the exchange rate, or does FlowX calculate it?**  
FlowX calculates it.

**21. Does FlowX automatically match requests, or does the user choose from available matches?**  
Recommended answer: FlowX should automatically match requests by default. If the match has low trust, high amount, unusual country pair, or risk signals, the user/admin should review before confirming.

**22. What happens if no matching request exists?**  
The request stays in a matching queue. If urgent or expired, FlowX may use its own internal wallet/liquidity balance if available.

**23. Can a request be partially matched?**  
Yes.

**24. Can users cancel a request?**  
Yes, only before matching or before payment deposit is confirmed.

**25. When can they cancel?**  
Before match or before payment confirmation. After funds are deposited, cancellation requires admin review.

**26. What does “users are connected” mean?**  
Users communicate only through the platform. Direct phone/contact info should remain hidden unless approved by FlowX.

**27. Who confirms that payment was made?**  
The payment gateway confirms it automatically.

**28. Who confirms that money was received?**  
The payment gateway confirms payout/receipt where possible. If the payment method does not support automatic confirmation, admin verification is required.

**29. Does FlowX hold money in escrow, or only coordinate between users?**  
FlowX holds money in escrow through payment gateways or internal controlled balances.

**30. What happens if one side pays and the other side does not?**  
Recommended correction: Matching should happen first, then both payers are asked to deposit. The transaction only proceeds after both deposits are confirmed. If only one payer pays before the deadline, the paid amount is refunded or held for a new match, depending on user choice and policy.

**31. What is the transaction status flow?**  
Recommended status flow:

Pending Request → Match Found → Awaiting Deposits → Deposit Confirmed Partially → Both Deposits Confirmed → Processing Payouts → Completed

Alternative statuses:
- Cancelled
- Expired
- Failed
- Under Review
- Disputed
- Refunded

---

## 4. Matching Logic

**32. What is considered an opposite matching request?**  
An opposite request is a request where the needed payment directions balance each other. Example: Mohammed in Gaza needs to receive from Egypt, and Ahmad in Egypt needs to receive from Gaza.

**33. Should matching depend on what factors?**  
Yes. Matching should depend on:
- Country pair  
- Currency  
- Amount  
- Payment method  
- Deadline  
- User trust score  
- Verification level  
- Available liquidity  
- Risk level

**34. Should matching be automatic, manual, or both?**  
Both. Automatic for safe/normal cases; manual admin review for risky or high-value cases.

**35. Should users be matched 1-to-1 only?**  
No.

**36. Can one request be matched with multiple users?**  
Yes, for partial matching.

**37. Should the system prioritize fastest match or best exchange rate?**  
Since FlowX sets the exchange rate, the system should prioritize speed, trust, and successful completion.

**38. Should there be a matching queue?**  
Yes.

**39. Should users be notified when a match is found?**  
Yes, but full notification automation can be simple in MVP.

**40. Can users reject a match?**  
Yes, if:
- Trust score is low  
- Amount is high  
- Payment method is unsuitable  
- Timing is not acceptable  
- User manually selected “approval required”

**41. What happens when a match expires?**  
The match returns to the queue. If FlowX has enough balance/liquidity, FlowX may complete the transfer using its own wallet.

**42. How long should users have to complete payment after matching?**  
For MVP: 15–30 minutes for instant payment methods. Admin can configure this.

---

## 5. Payment Methods

**43. What local payment methods should be supported first?**  
- Bank transfer  
- Mobile wallet  
- Local payment gateway  
- Verified agents later

**44. Are payments made inside the app or outside the app?**  
Inside the app through integrated payment gateways.

**45. If payments are outside the app, how does the system verify them?**  
Not preferred for MVP. If used later, verification can be through transaction ID, receipt upload, or agent confirmation.

**46. Should users upload payment proof?**  
Not required if payment gateway verification works. Optional fallback only.

**47. What proof is accepted if manual proof is needed?**  
- Receipt image  
- Transaction ID  
- Screenshot  
- Agent confirmation

**48. Should the platform integrate with payment APIs later?**  
Yes. In MVP, payment gateway integration should be simulated or limited depending on hackathon constraints.

**49. Does FlowX collect fees directly?**  
Yes.

**50. When is the fee paid?**  
Recommended: deducted from the total paid amount or added clearly before payment confirmation.

**51. Who pays the fee?**  
Recommended: sender/request creator pays the fee by default. Later, the fee can vary by country or transaction type.

---

## 6. Currencies & Exchange Rates

**52. Which currencies should be supported first?**  
For MVP:
- USD  
- EGP  
- ILS  

Post-MVP:
- EUR  
- JOD  
- TRY  
- Other Arab-region currencies

**53. Who sets the exchange rate?**  
FlowX sets the exchange rate.

**54. Should exchange rates update automatically?**  
Post-MVP yes. For MVP, the admin can set rates manually.

**55. Should users see the final amount before confirming?**  
Yes.

**56. Should FlowX include a currency converter?**  
Post-MVP. In MVP, show simple calculated conversion only.

**57. Should users be allowed to negotiate exchange rates?**  
No. This should be controlled by FlowX to avoid confusion and abuse.

**58. Should the platform show fees separately from exchange rate?**  
Yes. Users should see:
- Original amount  
- Exchange rate  
- Fee  
- Final amount receiver gets

**59. What happens if exchange rates change after a match?**  
The rate should be locked once the user confirms the request or once a match is created.

**60. Should the rate be locked for a specific time?**  
Yes. Recommended: 15–30 minutes during the payment window.

---

## 7. Trust, Safety & Verification

**61. How important is identity verification in the MVP?**  
Very important because the product involves money and trust.

**62. Should users upload official ID?**  
Yes.

**63. Should phone verification be required?**  
Yes.

**64. Should email verification be required?**  
Yes.

**65. Should the platform use KYC?**  
Yes, at least basic KYC in MVP.

**66. Should users have verification levels?**  
Yes:
- Basic  
- Verified  
- Trusted  
- Agent

**67. Should high-value transfers require stronger verification?**  
Yes.

**68. What is the maximum transfer amount for new users?**  
Recommended MVP limit: $100–$300 for new users.

**69. Should there be daily/monthly limits?**  
Yes.

**70. Should suspicious transactions be flagged?**  
Yes.

**71. Should admins manually review risky transfers?**  
Yes.

**72. What makes a transaction risky?**  
- High amount  
- New account  
- Failed previous transactions  
- Repeated cancellations  
- Mismatched user data  
- Unusual country pair  
- Many requests in a short time  
- Low trust score  
- Different receiver name than expected

**73. Should users be able to report fraud?**  
Yes.

**74. Should there be a dispute system?**  
Yes.

**75. How should disputes be handled?**  
User opens dispute → transaction is frozen → admin reviews payment records, gateway confirmations, and chat → admin resolves as completed, refunded, or escalated.

**76. Should users be rated after each transaction?**  
Yes.

---

## 8. Legal & Compliance

**77. Is FlowX intended to operate legally as a licensed financial service?**  
For the hackathon MVP, it is a prototype/demo. For real launch, it must operate legally and may require financial licenses or licensed partners.

**78. Have you considered money transfer regulations?**  
For MVP, include compliance as a risk and future requirement.

**79. Should the MVP avoid real money movement and only simulate the flow?**  
Recommended for hackathon: yes, simulate payments or use sandbox payment gateways.

**80. Should the product include legal disclaimers?**  
Yes.

**81. Are there countries that should be excluded for legal reasons?**  
For real launch, yes, depending on regulations and restrictions. For MVP, keep it as configurable.

**82. Should the platform block sanctioned users or regions?**  
For real launch, yes.

**83. Should users accept terms and conditions before using the service?**  
Yes.

**84. Should transactions be logged for compliance?**  
Yes.

**85. How long should transaction records be stored?**  
Recommended: minimum 5 years for real launch. For MVP, store all demo transaction history.

**86. Should admins be able to export reports?**  
Yes, but this can be post-MVP or basic CSV in MVP.

---

## 9. Admin Dashboard

**87. What should the admin dashboard include?**  
- Users  
- Verification requests  
- Transfer requests  
- Matches  
- Transactions  
- Payment statuses  
- Disputes  
- Fees  
- Countries/currencies  
- Exchange rates  
- Analytics  
- Risk flags

**88. Should admins see all users?**  
Yes.

**89. Should admins approve or reject users?**  
Yes.

**90. Should admins verify documents?**  
Yes.

**91. Should admins see all transfer requests?**  
Yes.

**92. Should admins manually match users?**  
Yes, as a fallback.

**93. Should admins resolve disputes?**  
Yes.

**94. Should admins change transaction statuses?**  
Yes, with action logs.

**95. Should admins set fees?**  
Yes.

**96. Should admins manage supported countries and currencies?**  
Yes.

**97. Should admins manage exchange rates?**  
Yes, especially in MVP.

**98. Should admins see analytics?**  
Yes:
- Number of users  
- Transaction volume  
- Completed transfers  
- Failed transfers  
- Revenue  
- Disputes  
- Average matching time  
- Pending requests

**99. Should admins be able to suspend users?**  
Yes.

**100. Should admins be able to refund/cancel transactions?**  
Yes.

---

## 10. User Dashboard

**101. What should the user dashboard show?**  
- Active requests  
- Transaction history  
- Current transaction status  
- Verification status  
- Saved receivers  
- Wallet/escrow status  
- Trust score  
- Support/dispute access

**102. Should users see balance?**  
Yes, but as “available/escrow balance,” not necessarily a full wallet in MVP.

**103. Should users see active requests?**  
Yes.

**104. Should users see transaction history?**  
Yes.

**105. Should users see matched users?**  
Limited information only. No private contact info.

**106. Should users see notifications?**  
Basic in-app status alerts in MVP.

**107. Should users see verification status?**  
Yes.

**108. Should users be able to edit their profile?**  
Yes, but sensitive fields require admin review after verification.

**109. Should users be able to save receivers?**  
Yes.

**110. Should users see transaction tracking?**  
Yes.

**111. Should users download receipts?**  
Post-MVP. In MVP, they can view transaction summary.

**112. Should users receive confirmation messages?**  
Yes.

**113. Should users have a wallet, or no wallet?**  
Recommended: MVP should have a limited internal escrow balance, not a full user wallet.

---

## 11. Notifications & Communication

**114. Should users receive notifications by email, SMS, WhatsApp, or in-app?**  
MVP:
- In-app notifications  
- Email for important events  

Post-MVP:
- SMS  
- WhatsApp

**115. What events should trigger notifications?**  
- Account created  
- Verification approved/rejected  
- Request created  
- Match found  
- Payment required  
- Payment confirmed  
- Transaction completed  
- Transaction failed  
- Dispute opened/resolved

**116. Can matched users chat inside the app?**  
Yes, but MVP can include simple messaging or admin-mediated communication.

**117. Should chat be allowed before payment?**  
Recommended: limited chat after match, before deposit, with admin monitoring for risky behavior.

**118. Should admins be able to view chat for disputes?**  
Yes.

**119. Should contact information be hidden until match confirmation?**  
Yes. Ideally, contact information remains hidden completely.

---

## 12. Fees & Business Model

**120. What fee percentage should FlowX charge?**  
Recommended MVP assumption: 1%–3% per transaction.

**121. Is the fee fixed, percentage-based, or both?**  
Both. Example: 2% fee with a minimum fixed fee.

**122. Are fees different by country?**  
Post-MVP yes. MVP can use one global fee.

**123. Are fees different by payment method?**  
Post-MVP yes.

**124. Should there be premium services?**  
Yes, post-MVP.

**125. What future premium services?**  
- Faster matching  
- Lower fees  
- Verified agent access  
- Business accounts  
- Priority support  
- Higher transfer limits

**126. Should there be referral rewards?**  
Post-MVP yes.

**127. Should agents earn commission?**  
Yes, when agents are introduced.

**128. Should the admin be able to update fees from the dashboard?**  
Yes.

---

## 13. MVP Features

**129. What are the absolute must-have MVP features?**  
- Signup/login  
- Basic KYC  
- Create transfer request  
- Matching system  
- Payment gateway simulation/integration  
- Escrow status  
- Transaction status tracking  
- Admin dashboard  
- Manual review  
- Basic dispute system  
- Transaction history

**130. Which authentication method is enough for MVP?**  
Email/password + phone OTP.

**131. Should MVP include real payments or mock payments?**  
For hackathon: mock/sandbox payments are recommended.

**132. Should MVP include KYC or only basic verification?**  
Basic KYC.

**133. Should MVP include admin manual matching instead of automatic matching?**  
MVP should include automatic matching with admin manual override.

**134. Should MVP include dispute management?**  
Yes, basic dispute management.

**135. Should MVP include notifications?**  
Basic in-app notifications only.

**136. Should MVP include transaction history?**  
Yes.

**137. Should MVP include analytics?**  
Basic admin analytics.

**138. Should MVP be mobile-first?**  
Yes.

**139. Should MVP be a web app only, or mobile app too?**  
Web app only, mobile-responsive.

---

## 14. Design & UX

**140. What style do you want for the platform?**  
Professional fintech, modern minimal, with Arabic regional identity.

**141. Dark theme or light theme?**  
Recommended: light theme for trust and clarity, with dark blue/green fintech accents.

**142. Should the interface be in English, Arabic, or both?**  
Both.

**143. Should Arabic support RTL layout?**  
Yes.

**144. Do you have brand colors for FlowX?**  
Recommended:
- Deep blue/navy for trust  
- Green for successful money movement  
- White/light gray background  
- Accent cyan or teal

**145. Do you have a logo?**  
Assume no logo yet. PRD should mention logo needed.

**146. What pages are needed?**  
- Landing page  
- Signup/login  
- Verification/KYC page  
- User dashboard  
- Create transfer request  
- Match details  
- Payment/deposit page  
- Transaction details  
- Transaction history  
- Support/dispute page  
- Admin dashboard  
- FAQ

**147. Should the landing page explain the concept with visuals?**  
Yes.

**148. Should users see a step-by-step transfer guide?**  
Yes.

**149. Should the product look more like Wise/PayPal, or more like a marketplace?**  
More like Wise/PayPal, with hidden marketplace/matching logic in the background.

---

## 15. Data & Database

**150. What data should be stored for each user?**  
- User ID  
- Full name  
- Email  
- Phone  
- Country  
- Address  
- Role/type  
- Verification status  
- Trust score  
- ID/passport document reference  
- Selfie reference  
- Bank/wallet details  
- Created date  
- Account status

**151. What data should be stored for each transaction?**  
- Transaction ID  
- Request creator  
- Receiver  
- Payer  
- Amount  
- Currency  
- Source country  
- Destination country  
- Payment method  
- Fee  
- Exchange rate  
- Final amount  
- Status  
- Timestamps  
- Gateway reference  
- Risk score

**152. What data should be stored for each match?**  
- Match ID  
- Linked request IDs  
- Matched amount  
- Match type: full/partial  
- Match status  
- Expiry time  
- Risk score  
- Admin override flag

**153. What data should be stored for each payment proof?**  
- Gateway transaction ID  
- Payment status  
- Amount paid  
- Payment method  
- Timestamp  
- Receipt/proof file if manual  
- Verified by gateway/admin

**154. What data should be stored for disputes?**  
- Dispute ID  
- Transaction ID  
- User who opened dispute  
- Reason  
- Description  
- Evidence  
- Admin notes  
- Status  
- Resolution

**155. Should files/images be stored?**  
Yes, for KYC and manual proofs.

**156. Should admins be able to search/filter all data?**  
Yes.

**157. What filters are needed?**  
- Country  
- Status  
- Amount  
- Date  
- User  
- Risk level  
- Payment method  
- Verification status  
- Currency

**158. Should data be exportable as CSV/PDF?**  
CSV in MVP, PDF post-MVP.

---

## 16. Security

**159. Should the app use two-factor authentication?**  
For MVP: phone OTP. Post-MVP: full 2FA.

**160. Should sensitive user data be encrypted?**  
Yes.

**161. Should admins have different permission levels?**  
Yes.

**162. Should every admin action be logged?**  
Yes.

**163. Should users be logged out after inactivity?**  
Yes.

**164. Should there be protection against fake accounts?**  
Yes.

**165. Should there be transaction limits to reduce fraud?**  
Yes.

**166. Should uploaded documents be private and admin-only?**  
Yes.

---

## 17. Technical Requirements

**167. Do you already have a preferred tech stack?**  
Recommended for hackathon MVP:
- Frontend: React or Next.js  
- Backend: Node.js or Laravel  
- Database: PostgreSQL or Supabase  
- Auth: Supabase/Auth0/Firebase Auth  
- Payments: sandbox payment gateway  
- File storage: Supabase Storage or Firebase Storage

**168. Should the project include frontend only or full-stack?**  
Full-stack.

**169. Do you need API documentation?**  
Yes.

**170. Do you need database schema included in the PRD?**  
Yes.

**171. Do you need user stories?**  
Yes.

**172. Do you need acceptance criteria?**  
Yes.

**173. Do you need wireframe descriptions?**  
Yes.

**174. Do you need a roadmap?**  
Yes.

**175. Do you need roles and permissions matrix?**  
Yes.

**176. Do you need non-functional requirements?**  
Yes.

---

## 18. Success Metrics

**177. How will we know FlowX is successful?**  
FlowX is successful if users can create requests, get matched, deposit money, and complete local payouts safely and quickly.

**178. Which metrics matter most?**  
- Number of users  
- Number of transfer requests  
- Successful matches  
- Completed transactions  
- Average matching time  
- Revenue  
- Fraud/dispute rate

**179. What is the target transaction completion time?**  
MVP target: under 30 minutes after both deposits are confirmed.

**180. What is the target fee compared to traditional services?**  
Lower than traditional transfer methods; target 30%–50% cheaper.

**181. What is the acceptable failed transaction rate?**  
For MVP demo: below 5%.

**182. What is the acceptable dispute rate?**  
For MVP demo: below 3%.

---

## 19. Future Features

**183. What future features do you want after MVP?**  
- Chatbot  
- Advanced notifications  
- Receipt download  
- Automated exchange rates  
- Mobile apps  
- Agents/branches  
- Business accounts  
- Premium plans  
- AI fraud detection  
- Partner API  
- Loyalty/referral system

**184. Should FlowX include agents/branches later?**  
Yes.

**185. Should FlowX include business accounts?**  
Yes.

**186. Should FlowX include mobile apps?**  
Yes, post-MVP.

**187. Should FlowX include API access for partners?**  
Yes, post-MVP.

**188. Should FlowX include automated exchange rates?**  
Yes, post-MVP.

**189. Should FlowX include AI fraud detection?**  
Yes, post-MVP.

**190. Should FlowX include loyalty/rewards?**  
Yes, post-MVP.

**191. Should FlowX expand outside the Arab region later?**  
Yes.

**192. Which global regions should come next?**  
Recommended:
- Middle East  
- North Africa  
- Europe-to-Arab corridors  
- Later: Africa and Asia corridors with high remittance demand

---

## 20. Final Clarifying Questions

**193. What is the most important screen in the product?**  
Create Transfer Request screen and Transaction Status screen.

**194. What is the most dangerous risk in the product?**  
Fraud, failed payouts, regulatory risk, and users bypassing FlowX after being matched.

**195. What should the product never allow?**  
- Direct unverified money exchange outside the platform  
- Unverified high-value transfers  
- Users seeing sensitive contact/payment data unnecessarily  
- Completing a transfer before both deposits are confirmed  
- Admin changes without logs

**196. What should admins control manually?**  
- Verification approval  
- Risky transactions  
- Disputes  
- Refunds  
- Suspensions  
- Fees  
- Supported countries/currencies  
- Exchange rates in MVP  
- Manual matching override

**197. What should be automated?**  
- Request creation  
- Matching  
- Payment gateway confirmation  
- Status updates  
- Basic risk scoring  
- Fee calculation  
- Exchange calculation  
- Queue management

**198. What should happen when a transaction fails?**  
The transaction becomes “Failed” or “Under Review.” Funds are frozen temporarily, then refunded, rematched, or manually resolved by admin.

**199. What should happen when users disagree?**  
Open dispute → freeze transaction → admin reviews data → decision: complete, refund, partial refund, or escalate.

**200. What is the maximum amount allowed per transaction?**  
Recommended MVP:
- New users: $100–$300  
- Verified users: $1,000  
- Trusted/business users: higher limits with admin approval

**201. What is the minimum amount allowed per transaction?**  
Recommended: $10.

**202. Do you want the PRD to be written for developers, investors, or hackathon judges?**  
Recommended: write it mainly for **hackathon judges**, but detailed enough for developers.

**203. Should the PRD include diagrams/user flows?**  
Yes.

**204. Should the PRD include a timeline and development phases?**  
Yes.

**205. Should the PRD include pricing estimate sections?**  
Optional. For hackathon PRD, include business model but not a detailed development price.

**206. Should the final PRD be in English only, Arabic only, or both?**  
Recommended: English only for hackathon/investor clarity, with Arabic support mentioned as a product requirement.

---

# Important Decisions Recommended for Approval

1. **MVP should use sandbox/mock payments**, not real money, because this is for a hackathon.  
2. **FlowX should act as escrow**, not only a connector.  
3. **Matching should be automatic**, with admin override for risky cases.  
4. **Users should not directly contact each other outside the platform.**  
5. **Gaza ↔ Egypt should be the first use case.**  
6. **FlowX should look like a fintech app, not a public marketplace.**  
7. **Admin dashboard is required in MVP.**  
8. **Basic KYC is required in MVP.**  
9. **Rates and fees should be controlled by FlowX.**  
10. **The final PRD should be written for hackathon judges + developers.**
