# Together Forever - Couple PWA

A beautiful Progressive Web App for couples to track their love story, special moments, and milestones together.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+ (currently using 21.7.1 - upgrade recommended)
- Firebase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google Sign-in)
   - Create a Firestore database
   - Enable Firebase Storage
   - Copy your Firebase config to `.env` file (see `.env.example`)

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## ✨ Features

- 💕 **Couple Profiles**: Upload photos and display both partners
- 📅 **Days Counter**: Real-time calculation of days together
- 🎉 **Events Management**: Track anniversaries, holidays, and special dates
- 🔐 **Authentication**: Email/password and Google Sign-in
- 📱 **PWA**: Installable on mobile devices with offline support
- 🎨 **Beautiful Design**: Romantic theme with smooth animations

## 🔧 Tech Stack

- **Frontend**: Vue.js 3 + Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **PWA**: Vite PWA Plugin
- **Styling**: Custom CSS with romantic design system

## 📖 Documentation

See [walkthrough.md](file:///Users/LionNg/.gemini/antigravity/brain/33abbf22-fa49-4381-bc17-a12b7de04808/walkthrough.md) for detailed documentation.

## 🔒 Security

Before deploying to production, update your Firestore and Storage security rules. See the walkthrough for recommended rules.

## 💝 Made with Love

Built with Vue.js and Firebase to help couples celebrate their journey together.
