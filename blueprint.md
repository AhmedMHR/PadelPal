# PadelPal Blueprint

## Overview

PadelPal is a web application designed to help users find and book padel courts. It also includes a wallet feature that allows users to top up their accounts to pay for bookings.

## Implemented Features

### Authentication

*   User signup and login functionality.
*   Firebase Authentication is used for user management.
*   A `useAuth` hook is implemented to manage the user's authentication state.

### Dashboard

*   A personal dashboard for logged-in users.
*   A "Top Up Wallet" button to navigate to the top-up page.

### Wallet

*   A dedicated page for users to top up their wallets.
*   A server action (`topUpWallet`) to securely handle wallet top-ups.
*   The user's balance is stored in Firestore.

## Recent Changes

*   **Fix Firebase Admin SDK private key format:** Resolved an issue where the private key was not being read correctly by the server, which was causing slow load times and failing server-side actions.
*   **Implement wallet top-up feature:** Added a "Top Up Wallet" feature that allows users to add funds to their accounts. This includes a new page, a server action, and updates to the dashboard.
