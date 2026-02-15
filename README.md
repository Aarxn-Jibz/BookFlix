# BookFlix

A Netflix-style book recommendation frontend built with React, TensorFlow.js, and modern streaming UI patterns.

## Features

- **User Profile Selection**: Choose from multiple user profiles (Netflix-style)
- **Personalized Recommendations**: TensorFlow.js model provides top 10 book recommendations
- **Hero Banner**: Cinematic display of the #1 recommended book
- **Interactive Rows**: 
  - Top Picks for You (with match scores)
  - Trending Now
  - Because you liked [Book Name] (dynamic rows based on liked books)
- **Heart/Like System**: Save favorite books and get personalized recommendations
- **Smooth Animations**: Framer Motion powered transitions and hover effects

## Tech Stack

- **React 18** with Vite
- **TensorFlow.js** for model inference
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure model files are in the `model/` directory:
   - `model.json`
   - `group1-shard*.bin` files
   - `book_titles.json`
   - `book_images.json`
   - `user_vocab.json`

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
src/
├── context/
│   └── BookContext.jsx    # Model loading, state management
├── components/
│   ├── ProfileGate.jsx    # User selection screen
│   ├── Hero.jsx           # Featured book banner
│   └── Row.jsx            # Horizontal book row
├── pages/
│   └── Home.jsx           # Main dashboard
├── App.jsx                # Routing and layout
└── main.jsx               # Entry point
```

## Usage

1. **Select a Profile**: On the initial screen, click on a user profile to start
2. **Browse Recommendations**: View your personalized book recommendations
3. **Like Books**: Click the heart icon on any book to save it
4. **Discover More**: Liked books generate new "Because you liked..." recommendation rows

## Model Details

The TensorFlow.js model is a User Retrieval model that:
- **Input**: User ID (integer index from user_vocab.json)
- **Output**: Top 10 recommended book indices
- **Format**: Graph Model (converted from TensorFlow)

## Styling

The app uses a dark theme inspired by Netflix:
- Background: `#141414` (Netflix black)
- Accent: `#E50914` (Netflix red)
- Premium UI with smooth animations and hover effects
