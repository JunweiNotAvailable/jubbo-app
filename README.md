# Jubbo - Real-Time Communication Assistant

> **Make communication better**

Too often, we walk away from conversations thinking: “That’s not how I wanted to say it.”

That's why we're here to bridge the gap between **intention** and **expression** — not after the fact, but *as it happens*.

---

## Goal

An app that runs quietly in the background of your life and becomes your invisible communication ally.

When you're mid-conversation and struggling to express yourself, it steps in to help by:
- Listening to the conversation in real-time
- Understanding what you’re trying to say
- Suggesting better responses — words, tone, mindset
- Offering emotional clarity or graceful pivots when needed
- Helping you interrupt politely, speak directly, or soften a message — depending on what the moment calls for

Over time, the assistant learns from you and gradually helps you speak like the version of yourself you wish you could be in the moment.

---

## Features

### Core Functionality
- **Real-time Audio Recording**: High-quality audio capture with configurable settings
- **AI-Powered Analysis**: Automatic transcription and conversation advice generation
- **Personalized Suggestions**: AI learns from your communication preferences and style
- **Offline Support**: Local storage fallback when server is unavailable
- **User Preference Management**: Persistent settings with server sync

### UI/UX
- **Home Screen**: Clean interface with recording button and real-time status
- **Advice Screen**: AI-generated suggestions with tone, mindset, and response recommendations
- **Settings Screen**: Comprehensive preference management for personalized AI advice

### Technical Features
- **Generic API Client**: Flexible data operations for any database structure
- **Modular Architecture**: Easy to extend with new AI actions and data types
- **Error Handling**: Graceful degradation and meaningful error messages
- **Performance Optimized**: Efficient audio processing and network operations

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express (Generic REST API)
- **Database**: Neon serverless PostgreSQL (flexible schema)
- **AI Services**: 
  - STT: Deepgram Nova-2 (speed, accuracy, cost balance)
  - Advice Generation: Claude 3.5 Haiku (fastest response)
- **Audio**: Expo Audio with configurable quality settings

## Quick Start

1. **Prerequisites**:
   - Node.js 18+ and npm
   - Expo CLI (`npm install -g @expo/cli`)
   - Running VibeTruely server (see `../server/README.md`)

2. **Installation**:
   ```bash
   cd native
   npm install
   ```

3. **Configuration**:
   ```bash
   # Create environment file
   echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
   ```

4. **Development**:
   ```bash
   npm start    # Start Expo dev server
   npm run ios  # Run on iOS simulator
   npm run android  # Run on Android emulator
   ```

## Architecture

### API Integration
The app uses a flexible API client that works with the generic server endpoints:

- **Data Operations**: `/api/data/:table` for CRUD operations on any table
- **AI Operations**: `/api/ai/*` for transcription, analysis, and advice generation
- **Automatic Sync**: User preferences and conversations stored both locally and on server

### Key Components
- **API Service** (`src/lib/api.ts`): Generic CRUD operations and AI integrations
- **Audio Service** (`src/lib/audio.ts`): High-quality recording with Expo Audio
- **Configuration** (`src/lib/constants.ts`): Centralized app and API configuration
- **Screens**: Home (recording), Advice (suggestions), Settings (preferences)

For detailed setup instructions, see [SETUP.md](SETUP.md).