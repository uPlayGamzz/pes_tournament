# uPlay — PES Tournament

Simple static website for running a small PES (Pro Evolution Soccer) tournament.

What it contains
- Front-end pages: registration, login, leaderboard, bracket, and info pages (see `pages/`).
- Bracket UI with admin scoring and auto-advance (`pages/bracket.html`, `javar/bracket.js`).
- Live-score UI and timer (`javar/live_score.js`, parts in `index.html`).
- Firebase Authentication + Firestore for user management (client-side code in `pages/signup.html`).
- Google Sheets integration via Apps Script endpoints (used by bracket and signup flows).

Prerequisites
- A modern browser for testing.
- Optional: Python or Node to serve files locally.
- A Firebase project (Auth + Firestore) for full signup/login flow.

Quick local test (static)
1. From the project root, run a simple static server. For Python 3:

```bash
python -m http.server 8000
```

2. Open the app in your browser:

http://localhost:8000/index.html

3. Test the signup page directly:

http://localhost:8000/pages/signup.html

Firebase setup (required for signup/login)
1. Create or use an existing Firebase project in the Firebase Console.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a Firestore database (test mode for initial testing).
4. Update Firestore rules to restrict writes to authenticated users creating their own doc. Example (recommended):

```
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /users/{userId} {
			allow create: if request.auth != null && request.auth.uid == userId;
			allow read: if true;
			allow update, delete: if request.auth != null && request.auth.uid == userId;
		}
	}
}
```

5. Replace the Firebase config values in the client code:
- `pages/signup.html` contains a modular v11 config block near the top of its inline module script.
- `javar/firebaseConfig.js` contains a legacy (namespaced) config — make sure the `projectId`, `apiKey`, and `appId` match your project.

Google Sheets / Apps Script
- The project posts bracket and signup data to Google Apps Script endpoints. Those URLs are hard-coded in `javar/bracket.js` and `pages/signup.html`.
- If you want to capture data in your own Sheet, deploy a new Apps Script web app and update those URLs.

Testing flow
1. Serve files and open `pages/signup.html`.
2. Register a new user (email/password). Verify:
	 - Authentication: Firebase Console → Authentication → Users (new user appears).
	 - Firestore: Firebase Console → Firestore → `users` collection (document id = UID).
	 - Google Sheet: if Apps Script is configured to accept writes, verify entries appear there.

Notes & recommendations
- The repo mixes Firebase SDK styles (modular imports vs namespaced). Consider unifying to the modern modular SDK across all scripts.
- Avoid committing server-side secrets anywhere — Firebase client config is public by design, but secure your Firestore rules.
- Consider removing `mode: "no-cors"` from fetch calls and configuring CORS on the server side so fetch responses/errors are visible during debugging.
- Add a PROJECT README section with deployment notes if you plan to host (GitHub Pages, Firebase Hosting, etc.).

If you want, I can:
- Unify Firebase usage to the modular SDK across the repo.
- Add a development section showing how to deploy to Firebase Hosting.
- Add a short CONTRIBUTING or local development checklist.
