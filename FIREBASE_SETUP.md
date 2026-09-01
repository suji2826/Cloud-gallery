# Firebase Authentication Setup Guide for CloudGallery

CloudGallery uses **Firebase Authentication** with **Google Sign-In** (`GoogleAuthProvider` and `signInWithPopup`).

---

## Active Firebase Web App Configuration

The application is configured to read the following environment variables:

| Environment Variable | Description | Current Value (`gallery-881c6`) |
|----------------------|-------------|---------------------------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyAJx4D-a589EoM9yhi-COIEuXhTVgOOSe0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `gallery-881c6.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project Identifier | `gallery-881c6` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket | `gallery-881c6.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `313209083062` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:313209083062:web:67e78be129612f62240217` |

---

## Google Sign-In Setup in Firebase Console

1. In the [Firebase Console](https://console.firebase.google.com/project/gallery-881c6/authentication/providers), navigate to **Authentication** > **Sign-in method**.
2. Click **Add new provider** > **Google** (or edit **Google** if already added).
3. Toggle **Enable** to ON.
4. Select your **Project support email**.
5. Click **Save**.

---

## Authorized Domains

In Firebase Console under **Authentication** > **Settings** > **Authorized domains**, ensure the following domains are listed:
- `localhost`
- `ais-dev-it4upjz6jg6hd52s4q2llq-903205868275.asia-southeast1.run.app`
- `ais-pre-it4upjz6jg6hd52s4q2llq-903205868275.asia-southeast1.run.app`

---

## Architecture Flow

- **Frontend Authentication**: User clicks **"Continue with Google"** and signs in via Firebase `signInWithPopup(auth, googleProvider)`.
- **JWT ID Token**: Firebase provides a cryptographically verified token obtained via `user.getIdToken()`.
- **AWS API Calls**: Requests sent to the backend include `Authorization: Bearer <firebase_id_token>`.
- **Zero AWS Frontend Credentials**: No IAM access keys, secret keys, or Cognito user pool secrets are ever required or stored on the frontend.
