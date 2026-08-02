# Spécification Technique : Protection des numéros de téléphone des comptes organisateurs

## 1. Résumé de la compréhension
- **Objectif** : Empêcher un invité/participant non connecté d'utiliser le numéro de téléphone d'un compte organisateur enregistré (`users`).
- **Raison** : Protection contre l'usurpation d'identité ou la prise de rôle non autorisée sur un événement.
- **Action retenue** : Bloquer l'action côté serveur avec `ConvexError` et proposer à l'utilisateur de se connecter à son compte.
- **Périmètre d'application** :
  - `registerParticipant` (`convex/participants.ts`)
  - `createCarpool` (`convex/carpools.ts`)
  - `requestBooking` (`convex/bookings.ts`)

## 2. Hypothèses
1. Les numéros de téléphone des utilisateurs et participants sont comparés sous forme nettoyée (chiffres uniquement).
2. Un utilisateur authentifié (`ctx.auth.getUserIdentity()`) peut valider son propre numéro sans blocage.

## 3. Journal des Décisions (Decision Log)
| Décision | Alternatives envisagées | Raison du choix |
| --- | --- | --- |
| Bloquer et inviter à se connecter | Vérification par code OTP SMS / Blocage silencieux | Meilleure UX, évite les coûts SMS inutiles et empêche l'usurpation |
| Helper centralisé backend | Index dédié ou validation frontend uniquement | Assure une sécurité 100% côté serveur et DRY pour toutes les mutations |

## 4. Conception Technique Finale

### Helper Centralisé (`convex/authUtils.ts` ou `convex/users.ts`)
```ts
export async function assertPhoneNotRegistered(ctx: QueryCtx | MutationCtx, phone: string) {
  const cleanStr = phone.replace(/[^0-9]/g, "");
  if (!cleanStr) return;

  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), identity.subject as any))
      .first();
    // Si l'utilisateur connecté possède ce numéro, on valide
    if (currentUser && currentUser.phone && currentUser.phone.replace(/[^0-9]/g, "") === cleanStr) {
      return;
    }
  }

  // Vérification si le numéro appartient à un utilisateur existant
  const allUsers = await ctx.db.query("users").collect();
  const match = allUsers.find(
    (u) => u.phone && u.phone.replace(/[^0-9]/g, "") === cleanStr
  );

  if (match) {
    throw new ConvexError(
      "Ce numéro de téléphone est déjà associé à un compte organisateur. Veuillez vous connecter."
    );
  }
}
```

### Intégration Backend
- Appeler `await assertPhoneNotRegistered(ctx, phone)` au début de `registerParticipant`, `createCarpool`, et `requestBooking`.

### Intégration Frontend
- Dans `BookingModal`, `CarpoolModal` et `JoinModal`, capturer le message d'erreur.
- Si le message contient l'invitation à se connecter, proposer un lien/bouton ouvrant la modale de connexion `AuthModal`.
