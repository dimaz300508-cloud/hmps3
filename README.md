
<div align="center">

</div>

## Run Locally

**Prerequisites:** Node.js 22 or later.

1. Install web dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the Firebase web app configuration.
3. Run the website using `npm run dev`.

Poll and suggestion submissions are validated by Firestore rules and stored directly in `communitySubmissions`. Member applications from **Gabung Sekarang** are stored in `memberRegistrations`; they include the selected TPB 1A/1B/1C class and are readable only by admins. The admin panel shows both data sets in real time. Member applications can be downloaded from **Pendaftar Gabung** as a UTF-8 CSV file that opens in Excel. This form path does not send email; automatic Gmail delivery requires a deployed Cloud Function.

## Firebase setup and deployment

Create a Cloud Firestore database in the Firebase project. Cloud Functions require the project to use the Blaze billing plan. Install Firebase CLI, sign in, and select the project:

```sh
npm install -g firebase-tools
firebase login
```

The repository's `.firebaserc` selects the configured project by default; verify the target before deploying with `firebase projects:list`.

Set the sender Gmail account and its Google App Password as Firebase secrets. Do not put the App Password in source code, `.env`, GitHub, or chat:

```sh
firebase functions:secrets:set SMTP_GMAIL_USER
firebase functions:secrets:set SMTP_GMAIL_APP_PASSWORD
```

Install/build the function and deploy the Firestore rules and backend:

```sh
cd functions
npm install
npm run build
cd ..
firebase deploy --only firestore:rules,functions
```

The Firestore rules allow only validated public submissions; only a Firebase Auth user with the trusted `admin: true` custom claim can read or delete submissions. The existing local admin panel login does not grant this Firebase claim. Publish rule changes with `firebase deploy --only firestore:rules`.

After signing in with an admin account, open **Pendaftar Gabung** to view and download member applications. The **Unduh Excel (.csv)** button exports the registration number, name, NIM, class, contact information, university, study program, division choices, motivation, registration code, and submission time. Open **Saran & Hasil Suara** to view saved submissions, suggestion text, poll counts, and average satisfaction score. Use **Hapus Semua Data** on that tab to clear the submission history.

Use **Visi, Misi & Periode** in the admin panel to edit the study program's objectives shown below the missions on the site. Objectives can be added, edited, and removed before saving.

### Grant admin access

1. In Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**. Then open **Users** and add the admin's email and password. The account must exist before granting access.
2. Install Google Cloud CLI, sign in with a Google account that has permission to manage users in project `himpunan-2bce7`, then authenticate Application Default Credentials:

   ```powershell
   gcloud auth application-default login
   ```

3. From the repository root, grant the admin claim to the account's email:

   ```powershell
   cd functions
   npm install
    
   npm run set-admin-claim -- admin@example.com
   ```

   Replace `admin@example.com` with the exact email added in Firebase Authentication. The script also accepts the user's Firebase Auth UID instead of an email.
4. Sign in to the website's admin panel using that email and password. If it was already signed in, sign out and sign in again so the refreshed ID token includes the new admin claim.

## GitHub Pages deployment

In GitHub repository settings, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. Add these repository Actions secrets using the Firebase Web App config values: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, and `VITE_FIREBASE_MEASUREMENT_ID`. Push `.github/workflows/deploy.yml` to `main` or `master` to build and publish the Vite app.

## Vercel deployment

In the Vercel project, open **Settings → Environment Variables** and add the same `VITE_FIREBASE_*` variables using the Firebase Web App configuration values listed above. Apply them to the environments being deployed, then redeploy so Vite can include them in the build. Without these values, the public site displays its bundled default content, but Firebase-backed content updates, submissions, and admin sign-in are unavailable.
