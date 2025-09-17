# Video to HTML Card Converter

This is a web application that allows users to generate HTML cards from video links (Google Drive, YouTube). It features a modern UI, dark/light themes, and a Supabase backend integration to automatically save and retrieve generation history.

## ✨ Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop.
- **Multiple Video Sources**: Supports Google Drive and YouTube links.
- **Automatic Thumbnail Generation**: Fetches YouTube thumbnails automatically.
- **Backend Integration**: Auto-saves every generation to a Supabase database.
- **History & Search**: Browse, load, and search previous generations.
- **Live Preview**: Instantly see the generated cards.
- **Copy to Clipboard**: Easily copy the generated HTML.
- **Theme Toggle**: Switch between light and dark modes.

## 🛠️ Local Development Setup

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    This project uses `yarn` as the package manager.
    ```bash
    yarn install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root of the project and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Start the development server**:
    ```bash
    yarn run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

##  Version Control with Git

To manage your project with Git and push it to a remote repository like GitHub:

1.  **Initialize a Git repository** (if you haven't already):
    ```bash
    git init
    ```

2.  **Add all files to staging**:
    ```bash
    git add .
    ```

3.  **Commit your changes**:
    ```bash
    git commit -m "Initial commit: Setup video card converter project"
    ```

4.  **Link to a remote repository** (e.g., on GitHub):
    Replace `<your-remote-repository-url>` with the URL from your Git provider.
    ```bash
    git remote add origin <your-remote-repository-url>
    git branch -M main
    ```

5.  **Push your code**:
    ```bash
    git push -u origin main
    ```

## 🚀 Deployment Instructions

This project is built with Vite and is configured for seamless deployment to Netlify and Cloudflare Pages.

### Deploying to Netlify

This repository includes a `netlify.toml` file, which automatically configures the build settings for you.

1.  **Prerequisites**:
    *   A Netlify account.
    *   Your project pushed to a GitHub, GitLab, or Bitbucket repository.

2.  **Steps**:
    *   Log in to your Netlify dashboard.
    *   Click **"Add new site"** -> **"Import an existing project"**.
    *   Connect to your Git provider and select your repository.
    *   Netlify will read the `netlify.toml` file and automatically set the **Build command** to `yarn build` and the **Publish directory** to `dist`. You don't need to change anything.
    *   **Crucially**, you must add your environment variables. Go to **"Site settings"** -> **"Build & deploy"** -> **"Environment"**. Add your Supabase credentials:
        *   `VITE_SUPABASE_URL`: `YOUR_SUPABASE_PROJECT_URL`
        *   `VITE_SUPABASE_ANON_KEY`: `YOUR_SUPABASE_ANON_KEY`
    *   Click **"Deploy site"**. Netlify will now build and deploy your project correctly.

### Deploying to Cloudflare Pages

1.  **Prerequisites**:
    *   A Cloudflare account.
    *   Your project pushed to a GitHub or GitLab repository.

2.  **Steps**:
    *   Log in to your Cloudflare dashboard and navigate to **"Workers & Pages"**.
    *   Click **"Create application"** -> **"Pages"** -> **"Connect to Git"**.
    *   Select your project repository.
    *   In the "Set up builds and deployments" section, use the following configuration:
        *   **Framework preset**: `Vite`
        *   **Build command**: `vite build`
        *   **Build output directory**: `dist`
    *   Click **"Save and Deploy"**.
    *   After the first deployment, go to your new site's settings -> **"Environment Variables"** and add your Supabase credentials for both "Production" and "Preview" environments:
        *   `VITE_SUPABASE_URL`: `YOUR_SUPABASE_PROJECT_URL`
        *   `VITE_SUPABASE_ANON_KEY`: `YOUR_SUPABASE_ANON_KEY`
    *   Trigger a new deployment for the environment variables to take effect.
