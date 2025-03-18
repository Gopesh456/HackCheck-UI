# Bhavans Hackathon 2.0

A web application for participating in and managing hackathon challenges.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation by running `node -v` in your terminal/command prompt

2. **npm** (comes with Node.js) or **yarn**
   - Verify npm installation: `npm -v`
   - If you prefer yarn: Install with `npm install -g yarn` and verify with `yarn -v`

3. **Git** (for cloning the repository)
   - Download and install from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Code Editor** (recommended: Visual Studio Code)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Getting Started

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/your-username/hackathon2.0.git
cd hackathon2.0
```

If you received the project as a ZIP file, extract it to your desired location and navigate to it using your terminal.

### Step 2: Install Dependencies

Inside the project folder, run:

```bash
npm install
```

OR if you're using yarn:

```bash
yarn install
```

This will install all the required packages defined in the `package.json` file.

### Step 3: Set up Environment Variables (if applicable)

If the project requires environment variables:

1. Copy the `.env.example` file to a new file called `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
2. Open `.env.local` in your code editor and fill in the required values.

## Project Structure

Next.js follows a file-based routing system. Here's a quick overview:

- `app/` - Contains all pages and layouts using the App Router
  - `(student)/` - Student-related routes in a route group
    - `dashboard/` - Dashboard page
    - `question/` - Question pages
- `components/` - Reusable UI components
- `utils/` - Utility functions and helpers
- `public/` - Static files like images
- `next.config.js` - Next.js configuration file
- `package.json` - Project dependencies and scripts

## Running the Application

### Development Mode

To start the development server with hot-reloading:

```bash
npm run dev
```

OR with yarn:

```bash
yarn dev
```

This will start the application on [http://localhost:3000](http://localhost:3000).

Open this URL in your browser to see the application.

### Understanding Development Mode

- The page will automatically refresh when you make changes to the code
- Any errors will be shown in the browser and terminal
- This mode is optimized for development, not production performance

## Building for Production

When you're ready to deploy your application:

1. Build the production version:
   ```bash
   npm run build
   ```
   OR
   ```bash
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```
   OR
   ```bash
   yarn start
   ```

The production version will be optimized for better performance.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Error: `Error: listen EADDRINUSE: address already in use :::3000`
   - Solution: Either close the application using port 3000 or change the port:
     ```bash
     npm run dev -- -p 3001
     ```

2. **Missing dependencies**
   - Error: Cannot find module 'module-name'
   - Solution: Install the missing dependency:
     ```bash
     npm install module-name
     ```

3. **Node.js version issues**
   - Make sure you're using Node.js version 18 or higher
   - You can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node versions

### Still Having Problems?

1. Try deleting the `.next` folder and `node_modules` folder, then reinstall dependencies:
   ```bash
   rm -rf .next node_modules
   npm install
   ```

2. Make sure all environment variables are correctly set

3. Check for typos in your code or configuration files

4. Look for error messages in your terminal/console for more specific information

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
