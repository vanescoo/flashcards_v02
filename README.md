
# Gemini Flashcards

An intelligent flashcard application powered by Gemini for language learning. It personalizes your learning path based on your feedback, provides audio pronunciation, and tracks your progress.

## Features

- **AI-Powered Word Generation:** Uses the Gemini API to generate vocabulary tailored to your CEFR level.
- **Spaced Repetition System (SRS):** Words are scheduled for review at optimal intervals to enhance long-term memory.
- **Persistent User Sessions:** Login with a User ID to save and retrieve your word bank and learning statistics across sessions.
- **Language-Specific Progress:** Your learning progress, word bank, and stats are tracked separately for each language.
- **Interactive UI:** Flippable cards with audio pronunciation for both the word and example sentences.
- **Configurable Settings:** A dedicated settings page to manage your Gemini API key and user session.

## Tech Stack

- **Frontend:** React 18 (with Hooks), TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)
- **Speech Synthesis:** Web Speech API
- **Module System:** ESM with Import Maps (no build step required)

---

## Deploying to Firebase Hosting via Google Cloud Shell

This guide details how to deploy the Gemini Flashcards app as a secure, scalable, and performant static web app using **Firebase Hosting**. The entire process can be completed within the Google Cloud Shell.

### Overview of the Architecture

-   **Firebase Hosting:** Provides fast and secure hosting for your web app, automatically provisioning a global CDN and SSL certificates.
-   **Google Cloud Shell:** A browser-based shell environment with `gcloud`, `firebase-tools`, and `git` pre-installed, allowing you to manage and deploy your resources without any local setup.

### Prerequisites

1.  **GCP Project:** A Google Cloud Platform account with a project created and billing enabled.
2.  **Git Repository:** Your application code must be available in a Git repository (e.g., on GitHub, GitLab, or Cloud Source Repositories).

---

### Step 1: Launch Cloud Shell & Clone Repository

1.  **Open Google Cloud Shell:**
    In the GCP Console, click the **Activate Cloud Shell** button (">_") in the top-right corner.

2.  **Set Your Project:**
    Ensure your Cloud Shell session is configured to use your target project.
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

3.  **Clone Your Git Repository:**
    Clone the repository containing your application files into your Cloud Shell environment.
    ```bash
    # Replace with your repository's URL
    git clone https://github.com/your-username/your-repo-name.git
    
    # Navigate into the project directory
    cd your-repo-name
    ```

### Step 2: Prepare Files for Deployment

Firebase Hosting serves files from a designated "public" directory. You need to create this directory and move your application source files into it.

1.  **Create the `public` Directory:**
    ```bash
    mkdir public
    ```

2.  **Move Application Files:**
    Move all the necessary files and directories into the `public` folder.
    ```bash
    mv App.tsx components/ constants.ts context/ hooks/ index.html index.tsx types.ts public/
    ```
    *Note: This command moves all essential app files. Files like `README.md` and `metadata.json` can remain in the root directory as they are not part of the running application.*

### Step 3: Initialize Firebase Hosting

Now, you will configure your project directory for Firebase.

1.  **Log in to Firebase:**
    The Firebase CLI is pre-installed in Cloud Shell. You just need to log in.
    ```bash
    firebase login
    ```
    Follow the on-screen instructions to authorize the CLI.

2.  **Add Firebase to Your GCP Project:**
    If you haven't already, associate Firebase with your existing GCP project.
    ```bash
    firebase projects:addfirebase YOUR_PROJECT_ID
    ```

3.  **Initialize Firebase Hosting:**
    Run the `init` command from the root of your project directory (the one containing the new `public` folder).
    ```bash
    firebase init hosting
    ```

4.  **Follow the Prompts:**
    Answer the configuration questions as follows:
    -   `? Please select an option:` **Use an existing project** (and select your project from the list).
    -   `? What do you want to use as your public directory?` **public** (This must match the directory you created).
    -   `? Configure as a single-page app (rewrite all urls to /index.html)?` **Yes** (This is critical for React routing).
    -   `? Set up automatic builds and deploys with GitHub?` **No** (We are deploying manually from Cloud Shell).
    -   `? File public/index.html already exists. Overwrite?` **No** (You want to keep your existing `index.html`).

    This process creates two new files in your root directory: `.firebaserc` and `firebase.json`.

### Step 4: Deploy the Application

With the configuration complete, you can now deploy the app.

1.  **Run the Deploy Command:**
    ```bash
    firebase deploy --only hosting
    ```

2.  **Access Your App:**
    After the deployment finishes, the CLI will output a **Hosting URL** (e.g., `https://your-project-id.web.app`). You can open this URL in your browser to see your live application.

### Step 5: (Optional) Connect a Custom Domain

Firebase makes it easy to use your own domain name.

1.  **Navigate to the Firebase Console:**
    Go to the [Firebase Console](https://console.firebase.google.com/), select your project, and go to the **Hosting** section in the left-hand menu.

2.  **Add Custom Domain:**
    Click the **"Add custom domain"** button and follow the wizard. Firebase will provide you with DNS records (usually a `TXT` record for verification and two `A` records) to add at your domain registrar.

3.  **Wait for Provisioning:**
    Once you've added the DNS records, Firebase will automatically provision an SSL certificate for your domain. This can take up to an hour.

---

## Local Development

Since this project uses import maps and does not have a build step, you can run it locally with any simple web server.

1.  **Install a local server:**
    If you have Node.js, you can use the `serve` package.
    ```bash
    npm install -g serve
    ```

2.  **Run the server:**
    From the project's root directory, run the server on the `public` folder:
    ```bash
    serve public
    ```
    The application will be available at the local address provided (e.g., `http://localhost:3000`).
    
## Application Structure

-   `public/`: The public root directory for Firebase Hosting.
    -   `index.html`: The main entry point with Tailwind CSS CDN and import maps.
    -   `index.tsx`: The root of the React application.
    -   `App.tsx`: The main component, handling routing and layout.
    -   `context/AppContext.tsx`: Global state management for user sessions, API keys, and learning progress.
    -   `hooks/`: Contains custom hooks for interacting with `localStorage`, the Gemini API, and the Web Speech API.
    -   `components/`: Contains all React components, organized by function.
    -   `types.ts`: Global TypeScript type definitions.
    -   `constants.ts`: Shared application constants, such as SRS intervals.
-   `firebase.json`: Firebase configuration file.
-   `.firebaserc`: Firebase project association file.
-   `README.md`: This file.
