# Bhavans Hackathon 2.0

A web application for participating in and managing hackathon challenges.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Quick Start (Recommended for Beginners)](#quick-start-recommended-for-beginners)
- [Manual Setup](#manual-setup)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Pages and Functionality](#pages-and-functionality)
- [Learn More](#learn-more)

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1. **Node.js** (version 18 or higher)

   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation by running `node -v` in your terminal/command prompt

2. **npm** (comes with Node.js)

   - Verify npm installation: `npm -v`

3. **Git** (for cloning the repository)

   - Download and install from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Code Editor** (recommended: Visual Studio Code)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Getting Started

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/Gopesh456/HackCheck-UI
cd HackCheck-UI
```

If you received the project as a ZIP file, extract it to your desired location and navigate to it using your terminal.

### Step 2: Install Dependencies

Inside the project folder, run:

```bash
npm install
```

This will install all the required packages defined in the `package.json` file.

## Quick Start (Recommended for Beginners)
Requires **Node.js** (version 18 or higher).

   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation by running `node -v` in your terminal/command prompt

If you are on Windows, simply double-click the `start.bat` file in the project folder. 
For Linux/macOS users, simply double-click the `start.sh` script .
This script will:

- Check if Node.js is installed
- Install all required dependencies
- Build the application for production
- Start the server automatically

### Windows

1. Double-click `start.bat` or run it from Command Prompt:
   ```
   start.bat
   ```

### Linux / macOS

1. Make the file executable if needed:
   ```
   chmod +x start.sh
   ```
2. Then run:
   ```
   ./start.sh
   ```

**If Node.js is not installed:**  
The script will show a clear error message and provide a link to download Node.js:  
https://nodejs.org/

**After everything is set up successfully:**  
You will see a message with the URL to open the app (usually http://localhost:3000).

---

## Manual Setup

If you prefer to use the terminal or are on Mac/Linux, follow these steps:

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/Gopesh456/HackCheck-UI
cd HackCheck-UI
```

If you received the project as a ZIP file, extract it to your desired location and navigate to it using your terminal.

### Step 2: Install Dependencies

Inside the project folder, run:

```bash
npm install
```

This will install all the required packages defined in the `package.json` file.

## Project Structure

Next.js follows a file-based routing system. Here's a quick overview:

- `app/` - Contains all pages and layouts using the App Router
  - `(student)/` - Student-related routes in a route group
    - `dashboard/` - Dashboard page
    - `question/` - Question pages
    - `login/` - Login page
    - `rules/` - Rules page
  - `admin/` - Admin-related routes
    - `dashboard/` - Admin dashboard page
    - `questions/` - Manage questions page
    - `teams/` - Manage teams page
    - `leaderboard/` - View leaderboard page
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

2. Start the production server:
   ```bash
   npm run start
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

## Pages and Functionality

### Student Pages

- **Dashboard (`/dashboard`)**

  - Displays a list of hackathon questions.
  - Each question shows its title, difficulty, score, and status.
  - Clicking "Solve Challenge" navigates to the question page with a loading indicator.

- **Question (`/question/[qid]`)**

  - Displays the details of a specific question.
  - Allows students to write and run code against test cases.
  - Provides functionality to save, reset, and submit code.

- **Login (`/login`)**

  - Allows students to log in to their accounts.
  - Requires team name, participant name, and password.

- **Rules (`/rules`)**
  - Displays the rules of the hackathon.
  - Provides a button to start coding.

### Admin Pages

- **Login (`/admin/login`)**

  - Allows admins to log in to their accounts.
  - Requires admin id and password.

- **Dashboard (`/admin/dashboard`)**

  - Provides an overview of the hackathon platform.
  - Includes sections for managing teams, viewing logs, and system settings.

- **Questions Management (`/admin/questions`)**

  - Allows admins to add, edit, and delete questions.
  - Provides fields for question title, description, difficulty, and test cases.

- **Teams Management (`/admin/teams`)**

  - Allows admins to manage participating teams.
  - Includes functionality to add, edit, and delete teams.

- **Leaderboard (`/admin/leaderboard`)**
  - Displays the leaderboard with team rankings based on points.
  - Shows team names, points, and members.

### Make an Admin Account

1. **Create a Superuser in Django DB**

- Run the following command in your terminal:
  ```bash
  python manage.py createsuperuser
  ```
- Follow the prompts to set up the superuser account.

2. **Access the Django Admin Portal**

- Navigate to the Django admin portal in your browser.

3. **Enable Admin Privileges**

- Open the **Users** section.
- Select the user you want to make an admin.
- Enable the "is_admin" checkbox.
- Save the changes.

4. **Login to Admin Portal**

- Go to `/admin/login` and log in with your admin credentials.

### Common Components

- **Navbar**

  - A navigation bar that appears on all pages.
  - Includes links to different sections of the application.

- **Loader**
  - A loading indicator component used to show loading states.




## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
