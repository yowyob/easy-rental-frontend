# Easy Rental — Remarques d'optimisation UX / produit

Document vivant : chaque remarque terrain est ajoutée ici, puis traitée par priorité.  
**Dernière mise à jour :** 2026-06-30

---

## Campagne tests vues (en cours)

**Objectif :** parcourir **toutes les vues** des 3 MFE et remonter chaque défaut ; correction itérative (un retour = une ou plusieurs entrées `UX-XXX`).

### Checklist par console

| MFE | URL dev | Vues à tester |
|-----|---------|----------------|
| **mfe-client** | http://localhost:3001/client | Accueil, catalogue, détail véhicule, réservation, mes réservations, profil, auth |
| **mfe-agency** | http://localhost:3002/agency | Login, dashboard, véhicules, chauffeurs, réservations, locations, transactions, notifications, profil |
| **mfe-organisation** | http://localhost:3003/organisation | Login, onboarding, dashboard, agences, postes, staff, véhicules, catégories, abonnement, réservations, locations, transactions, notifications, profil |

### Comment remonter un problème

1. Décrire : **MFE + écran + action** + comportement observé vs attendu.
2. Ajouter une ligne **UX-XXX** dans le backlog ci-dessous (priorité P0/P1/P2).
3. L’agent corrige et met le statut à `Corrigé` avec une ligne « piste résolue ».

**Prérequis local :** backend `:8081` (`scripts/start-local-kernel.sh`), Docker postgres/redis, front `npm run dev` (ou turbo).

**Kernel (hors ce fichier) :** voir `KERNEL-RESTE-A-FAIRE.md` à la racine du dépôt.

---

## Comment utiliser ce fichier

1. Décrire le problème (MFE, page, comportement attendu vs observé).
2. Ajouter une entrée dans la section **Backlog** avec un identifiant `UX-XXX`.
3. Cocher / mettre à jour le statut : `À faire` → `En cours` → `Corrigé` → `Validé`.
4. L'agent Cursor doit consulter ce fichier avant toute session d'optimisation frontend (voir règle `.cursor/rules/easy-rental-optimisation-ux.mdc`).

### Priorités

| Priorité | Signification |
|----------|----------------|
| **P0** | Bloquant — fonctionnalité inutilisable |
| **P1** | Important — UX dégradée ou données incorrectes |
| **P2** | Confort — polish, cohérence visuelle |
| **P3** | Futur — hors scope immédiat (ex. paiement complet) |

### Statuts

`À faire` · `En cours` · `Corrigé` · `Validé` · `Reporté`

---

## Synthèse par MFE

| MFE | Port | Remarques ouvertes |
|-----|------|-------------------|
| **mfe-client** | 3001 | 2 |
| **mfe-agency** | 3002 | 1 |
| **mfe-organisation** | 3003 | 2 |
| **Transversal** | — | 1 |

**Captures rapport :** `rapport/captures-ecran-optimisation/` (73 PNG, juin 2026).

---

## Backlog

### mfe-client (`/client`)

#### UX-001 — Modification de profil ne fonctionne pas
- **Priorité :** P0
- **Statut :** Corrigé
- **Page :** `ProfileView` (`apps/mfe-client/src/views/ProfileView.tsx`)
- **Remarque :** La sauvegarde du profil ne donne pas de retour ; le formulaire semble ne pas persister les changements.
- **Piste résolue :** UI profil refondue ; `res.ok` + feedback ; MDP envoie `old_password`/`new_password` ; `onProfileUpdated` rafraîchit le header.

#### UX-002 — Photo de profil non modifiable (client)
- **Priorité :** P0
- **Statut :** À faire
- **Page :** `ProfileView`
- **Remarque :** Impossible de changer la photo de profil ; affichage initiales uniquement (pas d'upload).
- **Piste technique :** Brancher upload média (`MediaUseCase` / API existante) + affichage `avatarUrl` sur `UserEntity`.

#### UX-003 — Validation téléphone trop permissive
- **Priorité :** P1
- **Statut :** À faire
- **Page :** Profil / formulaires avec numéro (client)
- **Remarque :** Le champ numéro accepte trop de caractères ; un numéro de téléphone devrait imposer un format fixe (ex. **9 chiffres** Cameroun `6XXXXXXXX` ou **10** avec indicatif).
- **Piste technique :** Validation Zod côté frontend + `@Pattern` / validation backend ; masque saisie `maxLength`, `inputMode="numeric"`.

#### UX-004 — Revue globale de certaines pages client
- **Priorité :** P1
- **Statut :** À faire
- **Remarque :** Plusieurs pages mfe-client nécessitent une repasse UX/UI (layout, états vides, erreurs API, cohérence).
- **Pages à inventorier :** catalogue, détails véhicule, réservations, notifications, profil.

---

### Transversal (client + organisation + agence)

#### UX-005 — Icône afficher / masquer mot de passe
- **Priorité :** P1
- **Statut :** Corrigé (mfe-organisation, mfe-agency, mfe-client auth)
- **Scope :** Tous les champs `type="password"` — Auth, profil, changement MDP.
- **Remarque :** Ajouter un bouton œil (show/hide) sur les mots de passe partout : **mfe-client**, **mfe-organisation**, **mfe-agency**.
- **Piste technique :** Composant partagé `PasswordInput` dans `@pwa-easy-rental/shared-ui` ; remplacer les `<input type="password">` existants.
- **Résolu (2026-06-26) :** `AuthInput` mfe-organisation — toggle œil sur le formulaire de connexion/inscription.
- **Résolu (2026-07-05) :** `AuthInput` mfe-agency + mfe-client.
- **Résolu (2026-07-07) :** `AuthView` mfe-admin — toggle œil ; suppression texte d’aide exposant identifiants.

#### UX-006 — API de paiement non intégrée
- **Priorité :** P3
- **Statut :** Reporté
- **Remarque :** Le flux paiement (acompte 60 %, solde, etc.) n'est pas branché sur un prestataire réel (Mobile Money / carte).
- **Piste technique :** Backend `RentalPaymentUseCase` + webhook ; frontend boutons paiement + retour statut ; hors scope polish immédiat.

---

### mfe-agency (`/agency`)

#### UX-007 — Profil + photo de profil non fonctionnels
- **Priorité :** P0
- **Statut :** À faire
- **Remarque :** Modification du profil et de la photo ne fonctionnent pas (même famille de bugs que client).
- **Piste technique :** Auditer vue profil agence, appels API, upload avatar staff.

---

---

### mfe-organisation (`/organisation`)

#### UX-008 — Profil + photo de profil non fonctionnels
- **Priorité :** P0
- **Statut :** À faire
- **Remarque :** Idem organisation — profil et photo non modifiables.
- **Piste technique :** `OrganizationUseCase.updateOrganizationWithMedia`, formulaire org, proxy `/organisation/api-rental`.

#### UX-011 — Recrutement staff kernel (compte + email identifiants)
- **Priorité :** P1
- **Statut :** Corrigé
- **Page :** `StaffView` / `StaffFormModal`
- **Remarque :** En mode kernel, recrutement crée le compte automatiquement (pas d'inscription côté agence) ; email avec identifiants console agence (`localhost:3002/agency`).

#### UX-013 — Staff : afficher les postes locaux, pas les rôles kernel
- **Priorité :** P0
- **Statut :** Corrigé
- **Page :** `StaffView` / `StaffFormModal` — compteur « Postes configurés » + dropdown recrutement
- **Remarque :** Gestion Staff affichait ~10 rôles kernel (Accountant, Agency Admin…) au lieu des 2 postes créés dans Postes & Permissions.
- **Piste résolue :** dropdown et KPI utilisent uniquement `getPostes` (même source que Postes & Rôles) ; le backend résout le poste local vers un rôle kernel à l'invite.

#### UX-012 — Onboarding réaffiché après login (autre navigateur / org kernel)
- **Priorité :** P1
- **Statut :** Corrigé
- **Page :** `page.tsx` (console organisation)
- **Remarque :** Chrome affichait « Configuration initiale » alors que Firefox montrait le dashboard (même compte Sahel) ; critère `city !== "string"` fragile, champs API en snake_case non normalisés.
- **Piste résolue :** `org.mapper.ts` + `isOrganizationOnboarded` (`is_verified`, `kernel_organization_id`, fallback ville) ; `getOrgUserMe` normalise l'org ; `OnboardingStepper` prérempli si org existante ; backend `KernelLocalOrganizationLinkService` reconstitue l'org locale depuis le JWT kernel (`oid`) si la ligne PostgreSQL manque.

#### UX-010 — Création d'agence silencieuse (échec sans message)
- **Priorité :** P0
- **Statut :** Corrigé
- **Page :** `AgenciesView` / modal « Nouveau point » (`AgencyForm.tsx`)
- **Remarque :** Clic sur « Confirmer l'agence » ne créait rien et n'affichait aucun message (org `PENDING_APPROVAL` ou erreur kernel).
- **Piste technique :** `handleFormSubmit` ignorait `res.ok === false` ; afficher `res.data.message` + message explicite si approbation en attente.
- **Résolu (2026-06-26) :** bandeau d'erreur rouge dans le modal ; message API kernel ou fallback gouvernance.

---

### mfe-organisation / flotte

#### UX-009 — Photo véhicule disparaît après ajout
- **Priorité :** P0
- **Statut :** À faire
- **Page :** Ajout / édition véhicule (organisation)
- **Remarque :** Après upload de la photo d'un véhicule, l'image n'apparaît plus (liste ou fiche).
- **Piste technique :** Vérifier persistance URL image (`MediaUseCase`, `VehicleEntity.images`), refresh liste après save, URL absolue vs chemin relatif `/uploads/...`, proxy images Next.js.

---

### mfe-organisation — campagne juillet 2026

#### UX-014 — Header : boutons langue / thème incohérents
- **Priorité :** P1
- **Statut :** Corrigé
- **Page :** `Header.tsx`, `AuthView.tsx`
- **Remarque :** Styles différents entre toggle langue et thème (taille, hover, ombre).
- **Piste résolue :** composant `HeaderIconButton` partagé, groupe utilitaires, `aria-label`, persistance `lang` en localStorage.

#### UX-015 — Emails affichés en majuscules (agences, staff)
- **Priorité :** P1
- **Statut :** Corrigé
- **Page :** `StaffFormModal`, `AgencyForm`
- **Remarque :** Classe CSS `uppercase` sur les champs email.
- **Piste résolue :** `normal-case` sur `type="email"` + `trim().toLowerCase()` à la soumission.

#### UX-016 — Catégories : save/delete silencieux
- **Priorité :** P0
- **Statut :** Corrigé
- **Page :** `VehicleCategoriesView`, `CategoryFormModal`
- **Remarque :** Modification et suppression sans feedback ; PUT bloqué en mode kernel (RBAC JWT local).
- **Piste résolue :** `formError` + messages delete ; `AccessControlService.canAccessCategory` pour `ROLE_ORGANIZATION` ; garde `CATEGORY_IN_USE` backend.

#### UX-017 — Staff kernel : email inattendu + erreur vérification
- **Priorité :** P1
- **Statut :** Corrigé
- **Page :** `StaffView`, `StaffFormModal`
- **Remarque :** Mail reçu de kernel-core (vérif IAM) confondu avec onboarding Easy Rental ; erreur « Email not verified ».
- **Piste résolue :** bandeau explicatif local ; message d'erreur FR ; fallback provisioning local si invite kernel échoue (email non vérifié).

#### UX-018 — Ajout véhicule HTTP_401 (session kernel expirée)
- **Priorité :** P0
- **Statut :** Corrigé
- **Page :** `VehiclesView`
- **Remarque :** `HTTP_401: Unauthorized` à l'enregistrement après ~15 min.
- **Piste résolue :** fallback local sur `HTTP_401` dans `VehicleUseCaseImpl` ; message « Reconnectez-vous » côté UI.

---

## Ordre de traitement suggéré (phase 1 — utilisabilité)

1. UX-001, UX-007, UX-008 — profils qui ne sauvegardent pas
2. UX-002 — photo profil client (puis agency/org)
3. UX-009 — photo véhicule
4. UX-003 — validation téléphone
5. UX-005 — toggle mot de passe (quick win transversal)
6. UX-004 — revue pages client
7. UX-006 — paiement (phase produit séparée)

---

## Journal des ajouts

| Date | Auteur | Action |
|------|--------|--------|
| 2026-06-26 | Agent | UX-014..018 : header IHM, emails minuscules, catégories RBAC+feedback, staff kernel, véhicule 401 |

---

### mfe-agency — campagne juillet 2026

#### UX-019 — Header agence uniforme
- **Priorité :** P1 | **Statut :** Corrigé
- **Piste résolue :** `HeaderIconButton`, groupe langue/thème, persistance `lang`, `AuthView` aligné.

#### UX-020 — Dashboard agence (graphique, activité, bouton flux)
- **Priorité :** P1 | **Statut :** Corrigé
- **Piste résolue :** empty state revenus, carte « Activité agence », bouton → `TRANSACTIONS`.

#### UX-021 — Prérequis réservation + téléphone + time picker
- **Priorité :** P0 | **Statut :** Corrigé
- **Piste résolue :** bandeau prérequis, `normalizeCmPhone`, `DateTimePicker` shared-ui, chauffeur obligatoire.

#### UX-022 — Tarification jour/heure/mois + grâce 12h/15j
- **Priorité :** P1 | **Statut :** Corrigé
- **Piste résolue :** `RentalDurationCalculator`, `rental-pricing.ts`, `MONTHLY`, `price_per_month`, badges économie.

#### UX-023 — Location walk-in (create → pay CASH → start)
- **Priorité :** P0 | **Statut :** Corrigé
- **Piste résolue :** `RentalsView` enchaîne paiement 100 % puis `startRental`.

#### UX-024 — Flotte agence alignée org + images
- **Priorité :** P1 | **Statut :** Corrigé
- **Piste résolue :** `VehicleCard` bannière photo, `userData` passé, `resolveMediaDisplayUrl`, `backendError` modal.

#### UX-025 — Recrutement chauffeur + dossier complet
- **Priorité :** P0 | **Statut :** Corrigé
- **Piste résolue :** `agencyId` FormData, RBAC STAFF, champs CNI/permis/expérience, migration BDD, grille tarifaire à la création, bouton « Voir détails », saisie prix sans zéro bloquant, sauvegarde statut/planning, chauffeurs filtrés par disponibilité à la réservation.

#### UX-026 — Avis client véhicule/chauffeur
- **Priorité :** P2 | **Statut :** Corrigé
- **Piste résolue :** `review.service.ts`, `ReviewModal` mfe-client, bouton sur locations `COMPLETED`.

#### UX-027 — Import images preview (chauffeur)
- **Priorité :** P1 | **Statut :** Corrigé
- **Piste résolue :** `DocumentUploadZone` shared-ui avec miniature au lieu du simple checkmark.

#### UX-028 — Formulaires édition vides + tarifs véhicule non modifiables
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-organisation, mfe-agency
- **Symptômes :** modales d'édition (véhicule, staff, agence, rôle) sans données existantes ; tarif véhicule requis pour réservation mais impossible à saisir.
- **Piste résolue :** `buildVehicleFormInitialData` + `useEffect`/`key` sur modales ; `PUT /api/vehicles/{id}/pricing` + `QuickStatusModal` agence ; `@rbac.canAccessVehicle` sur pricing/statut ; maintenance = planification obligatoire.

#### UX-029 — Confirmation réservation agence silencieuse
- **Priorité :** P0 | **Statut :** Corrigé
- **App :** mfe-agency — `ReservationsView` / `BookingFormModal`
- **Symptômes :** clic « Confirmer » sans feedback ; réservation non créée ou sans acompte 60 %.
- **Piste résolue :** `rental.mapper.ts` (snake_case API) ; bandeau erreur + loading ; flux create → pay 60 % CASH ; `@rbac.canAccessAgency` sur `POST /rentals/agency/{id}/create`.

#### UX-030 — Fiche détail véhicule incomplète (tarifs, specs, avis)
- **Priorité :** P1 | **Statut :** Corrigé
- **Apps :** mfe-agency, mfe-organisation
- **Piste résolue :** `normalizeVehicleDetails` + composant partagé `VehicleDetailsBody` (tarifs heure/jour/mois, moteur, équipements, assurance, planning, avis).

#### UX-031 — Notifications : dates invalides, « client null », badge non rafraîchi
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-agency, mfe-organisation
- **Symptômes :** `Invalid Date` ; libellé « client null » ; compteur cloche inchangé après marquer lu.
- **Piste résolue :** `notif.mapper.ts`, `formatNotificationDate`, `RentalClientLabelResolver` (backend), `notification-events.ts` + refresh Header.

#### UX-032 — Lecture notifications indépendante agence / organisation
- **Priorité :** P1 | **Statut :** Corrigé
- **Apps :** mfe-agency, mfe-organisation
- **Symptômes :** marquer lu en agence marquait aussi en organisation (même enregistrement BDD).
- **Piste résolue :** colonnes `is_read` / `is_read_org` ; endpoints `/read/agency` et `/read/organization` ; historique conservé en PostgreSQL après déconnexion.

#### UX-033 — Agences organisation : coordonnées vides, revenus, téléphone
- **Priorité :** P1 | **Statut :** Corrigé
- **App :** mfe-organisation — `AgenciesView`, `AgencyForm`, `AgencyDetailsModal`, `AgencyCard`
- **Symptômes :** section légale/coordonnées vides ; pas de revenu mensuel ; téléphone acceptait trop de chiffres (`6977777777777`).
- **Piste résolue :** `agency.mapper.ts`, `resolveAgencyContact`, `monthlyRevenue` API, `normalizeCmPhone` (9 chiffres CM), fix URL stats `year=undefined`.

#### UX-034 — Réservations agence : historique après démarrage location
- **Priorité :** P1 | **Statut :** Corrigé
- **App :** mfe-agency — `ReservationsView`
- **Symptômes :** dossiers disparaissaient de la liste quand la location passait `ONGOING`.
- **Piste résolue :** onglets **En cours** / **Historique** ; `getAgencyReservationHistory()` ; `BookingCard` variant `active` | `history`.

#### UX-035 — Walk-in : paiement acompte 60 % à la création
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-agency, backend `RentalUseCaseImpl`
- **Symptômes :** réservation walk-in restait `PENDING` sans encaissement ; flux create + pay séparé fragile.
- **Piste résolue :** `initial_payment_amount` + `payment_method` dans `AgencyRentalRequest` ; paiement CASH 60 % intégré à `createAgencyRental` ; bouton « Encaisser acompte 60 % » pour dossiers restants.

#### UX-036 — Conflit dates réservation + planning véhicule
- **Priorité :** P1 | **Statut :** Corrigé
- **Apps :** backend rental, `VehicleDetailsBody`
- **Symptômes :** double réservation sur même période ; planning peu visible.
- **Piste résolue :** `countConflictingRentals` à la création ; section « Planning & réservations » sur fiche véhicule.

#### UX-037 — Maintenance véhicule : tarifs non requis
- **Priorité :** P2 | **Statut :** Corrigé
- **Apps :** mfe-agency, mfe-organisation — `QuickStatusModal`
- **Symptômes :** passage en maintenance exigeait prix/heure et prix/jour alors que le véhicule n'est pas louable.
- **Piste résolue :** masquage champs tarifs en mode MAINTENANCE ; seuls durée + motif obligatoires ; `skipPricing` à la soumission.

#### UX-038 — Clarification montants (total dossier vs acompte 60 %)
- **Priorité :** P2 | **Statut :** Corrigé
- **App :** mfe-agency — `BookingCard`, formulaires réservation
- **Remarque :** confusion entre total (~13,6 M) et montant perçu (~8 M acompte).
- **Piste résolue :** libellés UI (acompte / solde / caution / commission) ; explication métier dans les cartes dossier.

#### UX-039 — Erreur SQL notifications (`resource_id` NULL)
- **Priorité :** P0 | **Statut :** Corrigé
- **Scope :** backend — création notifications location
- **Piste résolue :** `resource_id` renseigné (agence) à la création des notifications liées aux rentals.

#### UX-041 — Création véhicule agence : erreur SpEL RBAC
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-agency, backend `VehicleController`
- **Symptômes :** `Failed to evaluate expression ... hasPermission(#orgId, 'vehicle:create')` à l'enregistrement depuis l'agence.
- **Piste résolue :** méthodes synchrones `checkPermission` / `checkAgencyAccess` pour SpEL ; création autorise org ou staff via orgId + agencyId du payload ; véhicule visible côté org via `getVehiclesByOrg`.

#### UX-042 — DuckDB worker erreurs console (mfe-client)
- **Priorité :** P2 | **Statut :** Corrigé
- **App :** mfe-client — `CatalogView` / `useLocalFirst`
- **Piste résolue :** init DuckDB silencieuse si worker indisponible ; sync offline non bloquante (catalogue via API).

#### UX-043 — Photos véhicule différentes org vs agence (Mitsubishi)
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-organisation, mfe-agency, `media.mapper`, `vehicle.mapper`
- **Symptômes :** modification/upload depuis l'org → image cassée ou différente côté agence ; URLs stockées avec préfixe `/organisation/api-rental/uploads/...`.
- **Piste résolue :** `canonicalMediaStoragePath` + persistance `/uploads/...` uniquement ; `resolveMediaDisplayUrl` sur les cartes org ; correction SQL des images existantes.

#### UX-044 — Login agence : icône œil mot de passe
- **Priorité :** P1 | **Statut :** Corrigé
- **App :** mfe-agency `AuthInput.tsx`
- **Piste résolue :** toggle visibilité (Eye/EyeOff) aligné sur mfe-organisation.

#### UX-045 — Inscription client échoue (kernel + login auto)
- **Priorité :** P0 | **Statut :** Corrigé
- **App :** mfe-client — `AuthView`, `page.tsx`, `auth.service.ts` ; backend `AuthUseCaseImpl`
- **Symptômes :** message générique « Identifiants incorrects ou erreur lors de l'inscription » ; API 400 `Kernel sign-up did not return accessToken`.
- **Cause :** kernel renvoie `EMAIL_VERIFICATION_REQUIRED` sans token ; frontend lisait `logRes.data.token` au lieu de `loginRes.token`.
- **Piste résolue :** backend crée le client local + `kernel_user_id` et retourne `emailVerificationRequired` ; frontend affiche succès email (pas d'auto-login) ; login/MFA corrigés ; `easy-rental.client.skip-kernel-auth=true` pour tests locaux.

#### UX-046 — Catalogue client : véhicules fantômes, images, réservation
- **Priorité :** P0 | **Statut :** Validé
- **App :** mfe-client — `CatalogView`, `VehicleCard`, `HomeView`, `BookingWizardModal` ; `catalog.filters.ts`, `vehicle.mapper`
- **Symptômes :** véhicules/agences inexistants ou sans prix ; images uploadées non affichées ; catalogue trop espacé ; téléphone >9 chiffres ; erreur téléphone persistante ; réservation ignore indisponibilités ; bouton FR sans effet sur le header.
- **Piste résolue :** filtre catalogue (AVAILABLE + prix valides + agence en ligne) ; `resolveMediaDisplayUrl` sur images ; refactor cartes/espacements ; validation téléphone CM 9 chiffres ; contrôle planning avant devis ; i18n header (FR/EN) persisté.

#### UX-047 — Catalogue client : données démo + images + détail véhicule
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-client, backend `VehicleUseCaseImpl`, `AgencyUseCaseImpl`, `DataSeeder`
- **Symptômes :** véhicules Prestige/Logistics (seeder) visibles alors qu'une seule org (Sahel) ; entrées test `dd qsds` ; images `/uploads/...` cassées ; erreurs DuckDB console ; 6 agences au lieu de 2.
- **Piste résolue :** purge BDD démo + junk ; requêtes `findCatalogAvailableVehicles` / `findCatalogAgencies` (abonnement ACTIVE) ; `easy-rental.seed.enabled=false` en local ; placeholder SVG ; rewrite `/uploads` ; DuckDB désactivé en dev ; refonte `VehicleDetailsView`.

#### UX-048 — Réservation client : validation init (champs null)
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-client `BookingWizardModal`, `rental.mapper`, backend `RentalInitRequest`, `RentalUseCaseImpl`
- **Symptômes :** POST `/api/rentals/init` — champs rejetés `null` (snake_case).
- **Piste résolue :** `toApiRentalInitPayload` ; `driverId` optionnel ; devis sans chauffeur si non exigé.

#### UX-049 — Réservation client : Réserver + contact agence (sans paiement en ligne)
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** mfe-client `BookingWizardModal`, `ReservationDetail`, `ReservationsView`, `rental.mapper`
- **Symptômes :** flux paiement MOMO/OM prématuré ; liste réservations sans photo ni agence ; détail « SANS IMMAT ».
- **Piste résolue :** bouton **Réserver** → succès avec appel/email agence ; `normalizeRentalDetails` ; photo + agence sur cartes et détail ; acompte « à régler en agence ».


## Journal des ajouts (suite)

| Date | Auteur | Action |
|------|--------|--------|
| 2026-06-30 | Agent | UX-031..040 : notifications, agences, réservations walk-in, maintenance, montants, planning |
| 2026-06-30 | Agent | Export 73 captures → `rapport/captures-ecran-optimisation/` |
| 2026-07-05 | Agent | UX-043/044 : sync images véhicules org↔agence, œil mot de passe login agence |
| 2026-07-07 | Agent | UX-050..053 : messagerie support, admin console, i18n landing, auto-renew abonnement |

### Transversal — Admin & Support

#### UX-050 — Messagerie support Campus France
- **Priorité :** P1
- **Statut :** Corrigé
- **Piste résolue :** Module `support` backend (threads/messages), widget branché API, inbox admin `mfe-admin`, emails log/SMTP.

#### UX-051 — Lien console admin + i18n CTA landing
- **Priorité :** P2
- **Statut :** Corrigé
- **Piste résolue :** `MFE_URLS.admin` dans Navbar, `LangContext` + CTA final traduit FR/EN.

#### UX-052 — Externalisation email admin support
- **Priorité :** P1
- **Statut :** Corrigé
- **Piste résolue :** `easy-rental.support.admin-email` + `GET /api/support/config`.

#### UX-053 — Auto-renew abonnement (UI org)
- **Priorité :** P1
- **Statut :** Corrigé
- **Piste résolue :** Toggle auto-renew dans `SubscriptionView` + champ `autoRenew` dans `SubscriptionResponseDTO`.

#### UX-054 — Envoi avis landing `/feedback` (validation 400)
- **Priorité :** P0
- **Statut :** Corrigé
- **Piste résolue :** `review.service.ts` envoie `author_name` / `author_role` (snake_case API) ; message d'erreur UI moins verbeux.

#### UX-055 — Organisation : install PWA + boutons noirs + graphiques
- **Priorité :** P1
- **Statut :** Corrigé
- **Piste résolue :** SW + `handleInstallApp` (prompt ou instructions) ; bouton Noter / CTA cards en `#F76513` ; dashboard en courbes area style trading (`SparklineChart`).

#### UX-056 — Admin : quota véhicules désynchronisé (6/50 vs 3 réels)
- **Priorité :** P0
- **Statut :** Corrigé
- **Piste résolue :** `getAllOrganizations` / `getOrganization` recalculent `currentVehicles` via `COUNT(vehicles)` et resynchronisent la colonne dénormalisée.

#### UX-057 — Agence : « Assigné le Invalid Date » sur le profil
- **Priorité :** P1
- **Statut :** Corrigé
- **Piste résolue :** mapping `hired_at` → `hiredAt` + fallback date valide / tiret.

#### UX-058 — Notifications : bordure trop lourde + accent bleu gauche inutile
- **Priorité :** P1 | **Statut :** Corrigé
- **Apps :** client, agence, organisation (`easy-rental-web` + MFE legacy)
- **Symptômes :** cartes avec `border-l-4` bleu et bordures épaisses ; barre recherche/filtres trop chargée.
- **Piste résolue :** composants partagés `NotificationCard`, `NotificationsFilterBar`, `NotificationsEmptyState` — bordure fine uniforme type barre Google, pastille bleue discrète pour non-lu, sans bandeau latéral.

#### UX-059 — Catalogue client : siège sans ville/adresse invisible
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** client (`/client` → Agences)
- **Symptômes :** `azerty - Siège` absent du catalogue alors qu’il existe en BDD (ville/adresse vides).
- **Piste résolue :** `findCatalogAgencies` n’exige plus city/address ; filtre FE `isPublishableCatalogAgency` assoupli ; backfill adresse siège azerty.

#### UX-060 — Réservation sur date passée encore facturée
- **Priorité :** P0 | **Statut :** Corrigé
- **Apps :** client (wizard réservation) + backend rental
- **Symptômes :** devis et `initiateRental` acceptaient un départ dans le passé.
- **Piste résolue :** `validateRentalWindow` (BE) ; `DateTimePicker` `min=today` ; blocage + pas de devis si départ passé (`BookingWizardModal`).

