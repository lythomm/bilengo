# Spec: Covoiturage Événementiel

## Problem Statement

Les organisateurs de petits, moyens ou grands événements (mariages, festivals, anniversaires, rassemblements) éprouvent des difficultés à structurer le covoiturage de leurs participants. Actuellement, ils s'appuient sur des feuilles de calcul Excel ou des publications désordonnées dans des groupes Facebook. Les passagers et conducteurs peinent à trouver des trajets convergents vers le lieu de l'événement, ce qui génère de la frustration, de l'abandon et une hausse de l'empreinte carbone/embouteillages sur le lieu de destination. De plus, forcer les participants à télécharger une application native ou à créer un compte avec email/mot de passe ajoute une friction majeure entraînant un faible taux d'adoption.

## Solution

Une Web App / PWA responsive et fluide dédiée au covoiturage événementiel.
- Les organisateurs créent un compte et publient un événement avec son adresse exacte de destination et sa date. Ils obtiennent un lien public unique.
- Les participants (conducteurs et passagers) accèdent à la page de l'événement via ce lien partagé **sans création de compte ni mot de passe**.
- Les conducteurs proposent un trajet en indiquant leur ville/adresse de départ (avec autocomplétion), la date/heure et le nombre de places.
- Les passagers recherchent un trajet par ville de départ et demandent une place.
- La mise en relation et la notification s'effectuent à 0 € sans API SMS payante : l'application génère un lien WhatsApp pré-rempli (ou SMS natif / Web Share API en secours) contenant un lien de validation 1-clic pour le conducteur. Le paiement des frais s'effectue directement de gré à gré entre participants.

## User Stories

1. As an event organizer, I want to create an account with email, password, name, and phone number, so that I can securely manage my events.
2. As an event organizer, I want to create a new event specifying the event name, exact destination address (with autocompletion), date, and time, so that participants know where and when to arrive.
3. As an event organizer, I want to view my event management dashboard, so that I can edit event details or cancel inappropriate carpool listings.
4. As an event organizer, I want to copy a public shareable link for my event, so that I can easily post it in Facebook groups, WhatsApp chats, or event invitations.
5. As an event organizer, I want free event management up to 50 participants, with paid tier upgrades for larger participant counts, so that I only pay when scaling up.
6. As a participant, I want to open the shared event link in any mobile or desktop web browser without downloading an app or creating a password, so that I can immediately view available carpools.
7. As a participant, I want my identity (first name and phone number) to be stored in my browser session/cookie for 30 days, so that I stay recognized when reopening the event link.
8. As a driver, I want to offer a carpool for an event by selecting my departure address via autocompletion, departure date/time, and available seats, so that passengers coming from the same direction can join me.
9. As a passenger, I want to search and filter carpools for an event by departure city or address, so that I can find a driver near me going to the same destination.
10. As a passenger, I want to request a seat on a carpool by entering my first name and phone number, so that the driver knows who is requesting the seat.
11. As a passenger requesting a seat, I want the web app to automatically open WhatsApp (or my phone's native SMS app as fallback) with a pre-filled request message to the driver, so that I can notify the driver for free.
12. As a driver receiving a WhatsApp or SMS request message, I want to click a single confirmation link inside the message, so that the passenger's seat is instantly confirmed on the web app.
13. As a driver or passenger, I want to see real-time updates when seats are booked or freed, so that I always see accurate availability without refreshing the page.
14. As a driver, I want to cancel my proposed carpool if my plans change, so that booked passengers are notified and can look for another ride.
15. As a passenger, I want to cancel my seat reservation, so that the seat is automatically freed for another participant.

## Implementation Decisions

- **Architecture Stack:** Next.js (App Router), Convex (reactive backend, real-time subscriptions, database), Tailwind CSS, Vercel deployment.
- **Authentication & User Data:**
  - **Organizers:** Authenticated users managed via Convex Auth / User schema.
  - **Participants:** Anonymous session tracking stored in local cookies (`participant_token`, `first_name`, `phone_number`) with a 30-day expiration.
- **Data Schema (Convex):**
  - `users`: `email`, `hashedPassword`, `name`, `phone`, `createdAt`
  - `events`: `organizerId`, `title`, `destinationAddress`, `destinationLat`, `destinationLng`, `eventDate`, `maxParticipants`, `slug`
  - `carpools`: `eventId`, `driverName`, `driverPhone`, `departureAddress`, `departureLat`, `departureLng`, `departureTime`, `totalSeats`, `availableSeats`, `status` ("active" | "cancelled" | "full")
  - `bookings`: `carpoolId`, `passengerName`, `passengerPhone`, `status` ("pending" | "confirmed" | "cancelled"), `validationToken`
- **Zero-Cost Notification System:**
  - When a booking is initiated, a unique `validationToken` is generated.
  - Passenger UI generates `https://wa.me/<driverPhone>?text=<encoded_message>` containing the 1-click validation URL (`/booking/confirm?token=<validationToken>`).
  - Fallback mechanism uses `sms:<driverPhone>?body=...` and `navigator.share` (Web Share API) if WhatsApp is unavailable.
- **Address Autocompletion:** Interfaced with BAN (Base Adresse Nationale) or OpenStreetMap Nominatim API for instant geocoding and address selection.
- **Payment Handling:** 100% out-of-scope for platform. Direct peer-to-peer settlement between participants.

## Testing Decisions

- **Testing Seam 1 (Convex Backend API - Primary):**
  - Unit and integration tests on Convex query/mutation functions.
  - Verifies event creation quotas, atomic seat reservation decrements, single-use 1-click token validation, and status transitions.
- **Testing Seam 2 (Next.js UI & Integration):**
  - Integration testing on key user journeys: Event creation, Driver offer form with address autocompletion, Passenger reservation flow, and WhatsApp/SMS URL payload generation.

## Out of Scope

- Native iOS / Android apps (App Store / Play Store).
- In-app payment processing, credit card storage, or Stripe Connect integrations.
- In-app chat / messaging system between drivers and passengers.
- Paid SMS gateways (Twilio, Vonage) or transactional email services.
- Complex route mapping / navigation / GPS turn-by-turn tracking.

## Further Notes

- The project is designed to operate at 0 € infrastructural cost for notifications and low backend overhead thanks to Convex real-time subscriptions and Vercel hosting.
- The freemium tier logic for event capacity (< 50 participants free) will be enforced at event creation and update time within Convex mutations.
