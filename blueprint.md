
# PadelUP - Blueprint

## Overview

PadelUP is a web application designed to connect padel players. It allows users to find and join matches, create their own matches, and challenge other players. The application is built with Next.js and Firebase, and it leverages modern web technologies to provide a seamless and interactive user experience.

## Core Features

*   **Authentication:** Users can sign up and log in using email and password.
*   **User Profiles:** Each user has a profile with their name, email, and skill level.
*   **Matchmaking:** Users can find and join open matches based on their skill level and location.
*   **Match Creation:** Users can create their own matches, either public or private.
*   **Challenge System:** Users can challenge other players to a match.
*   **Real-time Chat:** Each match has a real-time chat for players to communicate.
*   **Scoring and Leaderboards:** Players can submit match scores, which automatically update their skill level and ranking.

## Technical Stack

*   **Framework:** Next.js (App Router)
*   **Database:** Firebase Firestore
*   **Authentication:** Firebase Authentication
*   **Real-time:** Firebase Firestore
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React

## Project Structure

*   **/app:** Core application logic, including pages, layouts, and components.
*   **/components:** Reusable UI components.
*   **/lib:** Firebase configuration and utility functions.
*   **/services:** Firebase service interactions (now migrated to Server Actions).
*   **/styles:** Global styles and Tailwind CSS configuration.

## Plan

1.  **Refactor `bookingService.ts` to Server Actions:**
    *   [x] Migrate `leaveMatch` to a `leaveMatchAction` Server Action.
    *   [x] Migrate `cancelMatch` to a `cancelMatchAction` Server Action.
    *   [x] Migrate `createChallengeMatch` to a `createChallengeMatchAction` Server Action.
2.  **Create `UserCard.tsx` component:**
    *   [x] Implement the `createChallengeMatchAction` in the `UserCard.tsx` component.
3.  **Install `lucide-react` library:**
    *   [x] Install the `lucide-react` library for modern icons.
4.  **Create `blueprint.md` file:**
    *   [x] Create a `blueprint.md` file to document the project's overview, features, and plan.
