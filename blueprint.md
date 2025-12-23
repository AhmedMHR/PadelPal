# PadelPal Blueprint

## Overview

PadelPal is a modern and intuitive web application that allows users to find and book padel courts, join open matches, and track their progress. The application is built with Next.js and Firebase, and it features a clean and responsive design that is optimized for both desktop and mobile devices.

## Style, Design, and Features

### Framework and Libraries

- **Framework:** Next.js with TypeScript
- **Authentication:** Firebase Authentication
- **Database:** Firestore
- **Styling:** Tailwind CSS

### UI Components

- **AppWrapper:** A wrapper component that handles the loading state of the application.
- **HomePage:** The main page of the application. It has a modern design with a hero section and a call to action.
- **AuthLayout:** A layout for the authentication pages (login and signup).
- **Dashboard:** The user dashboard. It has a tabbed interface to switch between booking a court and finding a match.

### Features

- User authentication (signup and login)
- View and book padel courts
- Find and join open matches
- User profile page
- Logout functionality

### Design

- Modern and clean design
- Dark theme
- Custom color palette (`padel-dark`, `padel-lime`, `padel-court`)
- Custom font (`Inter`)
- Responsive design

## Current Request

- The user reported that the application was not running correctly.
- I have identified and fixed the following issues:
    - A double-wrapping issue with the `AppWrapper` component.
    - A missing `useAuth` export in the `AuthContext`.
    - Several linting errors in the codebase.
- I have also improved the code by replacing the `<img>` tag with the `next/image` component and by using the `unknown` type in the `catch` block of the `handleJoin` function.
