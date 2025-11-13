
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

## Deploying to Google Cloud Platform (GCP)

This guide details how to deploy the Gemini Flashcards app as a secure, scalable, and performant static website on GCP. We will use **Google Cloud Storage (GCS)** to host the files and a **global external HTTP(S) Load Balancer** with **Cloud CDN** to serve them.

### Overview of the Architecture

1.  **Cloud Storage:** A GCS bucket will store all the static application files (`index.html`, `.tsx`, `.css`, etc.).
2.  **External Load Balancer:** This will provide a single, global IP address for your application.
3.  **Cloud CDN:** Enabled on the load balancer's backend, this will cache your application's assets at Google's edge locations worldwide, ensuring low latency for all users.
4.  **Google-managed SSL:** The load balancer will handle SSL termination, providing free, auto-renewing SSL certificates for your custom domain.

### Prerequisites

1.  **GCP Account:** A Google Cloud Platform account with billing enabled.
2.  **gcloud CLI:** The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated on your local machine.
3.  **Domain Name:** A registered domain name (e.g., `your-flashcards.com`). This is required to use HTTPS and a Google-managed SSL certificate.

---

### Step 1: GCP Project Setup

First, set up a GCP project and configure your local `gcloud` CLI.

1.  **Create a GCP Project:**
    If you don't have one already, create a new project in the [GCP Console](https://console.cloud.google.com/). Note your **Project ID**.

2.  **Configure gcloud CLI:**
    Set your project and authenticate the CLI.
    ```bash
    # Set your project ID
    gcloud config set project YOUR_PROJECT_ID

    # Authenticate with your GCP account
    gcloud auth login
    ```

3.  **Enable Necessary APIs:**
    Enable the APIs for Compute Engine (for the load balancer) and Cloud Storage.
    ```bash
    gcloud services enable compute.googleapis.com storage-component.googleapis.com
    ```

### Step 2: Create and Upload to Cloud Storage Bucket

Next, create a GCS bucket and upload your application files.

1.  **Create a GCS Bucket:**
    The bucket name must be globally unique. It's a good practice to use a name related to your domain.
    ```bash
    # Replace BUCKET_NAME with a unique name (e.g., gemini-flashcards-assets)
    gcloud storage buckets create gs://BUCKET_NAME --location=US-CENTRAL1
    ```

2.  **Upload Application Files:**
    From the root directory of the project, copy all files to your new bucket.
    ```bash
    # The -m flag enables parallel uploads for speed
    gcloud storage cp --recursive . gs://BUCKET_NAME
    ```

3.  **Set Public Permissions:**
    Make the objects in the bucket publicly readable so the load balancer can access them.
    ```bash
    gcloud storage buckets add-iam-policy-binding gs://BUCKET_NAME \
        --member=allUsers \
        --role=roles/storage.objectViewer
    ```

### Step 3: Set Up the Load Balancer and CDN

This is the core of the serving infrastructure.

1.  **Reserve a Static IP Address:**
    Create a global static IP address that will point to your application.
    ```bash
    gcloud compute addresses create flashcards-ip --global
    ```
    Note the IP address that is returned. You will need it for your DNS settings.
    ```bash
    gcloud compute addresses describe flashcards-ip --global
    ```

2.  **Create a Backend Bucket:**
    This connects your GCS bucket to the load balancer and enables Cloud CDN.
    ```bash
    gcloud compute backend-buckets create flashcards-backend-bucket \
        --gcs-bucket-name=BUCKET_NAME \
        --enable-cdn
    ```

3.  **Create URL Map and HTTP Proxy:**
    This defines how requests are routed. For a single-page app, all paths route to the same backend.
    ```bash
    # Create the URL map
    gcloud compute url-maps create flashcards-url-map \
        --default-backend-bucket=flashcards-backend-bucket

    # Create the target proxy
    gcloud compute target-http-proxies create flashcards-http-proxy \
        --url-map=flashcards-url-map
    ```

4.  **Create a Forwarding Rule:**
    This rule ties your static IP address to the load balancer configuration, directing traffic.
    ```bash
    gcloud compute forwarding-rules create flashcards-forwarding-rule \
        --address=flashcards-ip \
        --global \
        --target-http-proxy=flashcards-http-proxy \
        --ports=80
    ```
    At this point, your app should be accessible via HTTP at the static IP address you reserved.

### Step 4: Configure DNS and SSL (Custom Domain)

To enable HTTPS, you need to point your domain to the load balancer and create an SSL certificate.

1.  **Create a Google-managed SSL Certificate:**
    Replace `your-flashcards.com` with your actual domain name.
    ```bash
    gcloud compute ssl-certificates create flashcards-ssl-cert \
        --domains=your-flashcards.com
    ```

2.  **Create an HTTPS Target Proxy:**
    ```bash
    gcloud compute target-https-proxies create flashcards-https-proxy \
        --url-map=flashcards-url-map \
        --ssl-certificates=flashcards-ssl-cert
    ```

3.  **Create an HTTPS Forwarding Rule:**
    This rule directs HTTPS traffic (port 443) to your new HTTPS proxy.
    ```bash
    gcloud compute forwarding-rules create flashcards-https-rule \
        --address=flashcards-ip \
        --global \
        --target-https-proxy=flashcards-https-proxy \
        --ports=443
    ```

4.  **Update Your DNS Records:**
    Go to your domain registrar's DNS management panel and create an **A record** that points your domain (e.g., `your-flashcards.com`) to the static IP address you reserved in Step 3.

    - **Record Type:** `A`
    - **Host/Name:** `@` (or your domain name)
    - **Value/Points to:** The static IP address.

    It may take some time for DNS changes to propagate. Once they do, and the SSL certificate is provisioned (this can take up to an hour), your application will be live and secure at `https://your-flashcards.com`.

### Step 5: Access Your Application

You can now access your fully deployed, globally distributed, and secure Gemini Flashcards application via your custom domain.

---

## Local Development

Since this project uses import maps and does not have a build step, you can run it locally with any simple web server.

1.  **Install a local server:**
    If you have Node.js, you can use the `serve` package.
    ```bash
    npm install -g serve
    ```

2.  **Run the server:**
    From the project's root directory, run:
    ```bash
    serve .
    ```
    The application will be available at the local address provided (e.g., `http://localhost:3000`).
    
## Application Structure

-   `index.html`: The main entry point with Tailwind CSS CDN and import maps.
-   `index.tsx`: The root of the React application.
-   `App.tsx`: The main component, handling routing and layout.
-   `context/AppContext.tsx`: Global state management for user sessions, API keys, and learning progress.
-   `hooks/`: Contains custom hooks for interacting with `localStorage`, the Gemini API, and the Web Speech API.
-   `components/`: Contains all React components, organized by function.
-   `types.ts`: Global TypeScript type definitions.
-   `constants.ts`: Shared application constants, such as SRS intervals.
