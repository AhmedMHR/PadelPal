# PadelPal 🎾

**PadelPal** is a modern web application for booking Padel courts, finding match opponents, and tracking your competitive level. Built for the community to make playing Padel easier and more social.

## 🚀 Features

* **🏆 Social Matchmaking:** Join open matches or host your own.
* **📅 Real-time Booking:** Browse venues and book courts instantly.
* **💰 Digital Wallet:** Top up your balance (EGP) to pay for games seamlessly.
* **📈 Level System:** Your ranking (1.0 - 7.0) updates automatically based on match results.
* **💬 Match Chat:** Coordinate with players before the game.
* **🔐 Secure Auth:** Powered by Firebase Authentication.

## 🛠️ Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Lucide React
* **Backend:** Firebase (Firestore, Auth, Storage)
* **Deployment:** Firebase App Hosting (Gen 2)

## ⚙️ Local Development

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/AhmedMHR/PadelPal.git](https://github.com/AhmedMHR/PadelPal.git)
    cd PadelPal
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file with your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-action-a9c21
    # ... other public keys
    
    # Admin Keys (for server actions)
    FIREBASE_CLIENT_EMAIL=your_service_account_email
    FIREBASE_PRIVATE_KEY="your_private_key"
    ```

4.  **Run the app**
    ```bash
    npm run dev
    ```

## 📱 Screenshots

| Dashboard | Match Details |
|-----------|---------------|
| ![Dashboard](/public/dashboard-preview.png) | ![Match](/public/match-preview.png) |

## 🤝 Contributing

:) by **Ahmed M.**

