DareDown
Tagline: Win fast. Lose harder.

DareDown is a real-time multiplayer web game where players compete in mini-games and losers complete dares. Now with a pre-room category feature, each player picks the type of challenge they want to play before entering the room, and everyone can see the chosen categories. Mini-games and dares are then selected based on the mix of all players’ chosen categories, creating a fun and chaotic multiplayer experience.

🎮 Features
Real-time multiplayer gameplay using Socket.io

Pre-room category selection: each player picks a category (General, Programming, Trivia, Speed/Reflex)

Mini-games and dares filtered by players’ chosen categories

Leaderboards track wins and completed dares

Modular, scalable design for future expansion (mobile-ready)

Easy setup with Firebase for authentication, database, and storage

⚙️ Tech Stack
Frontend: React + Vite + TailwindCSS

Backend: Node.js + Express + Socket.io

Database & Auth: Firebase (Firestore + Auth + Storage)

Hosting: Vercel (frontend) + Render/Railway (backend)

🏗️ How It Works
Players join the lobby and choose a category before entering a game room.

The room displays all players’ selected categories.

Mini-games and dares are selected based on the mix of chosen categories.

Players compete in short rounds — losers receive a dare from the selected categories.

Leaderboards update in real-time, and the chaos continues!

🔧 Setup Instructions
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/daredown.git
Install dependencies:

bash
Copy code
cd daredown
npm install
Setup Firebase: create a project and update .env with API keys

Run the frontend:

bash
Copy code
npm run dev
Run the backend (Socket.io server):

bash
Copy code
node server.js
Open the game in your browser and start playing!

📦 Folder Structure (Suggested)
bash
Copy code
/frontend  - React + Tailwind app
/backend   - Node.js + Express + Socket.io server
/firebase  - Firestore setup, authentication, storage rules
/public    - Static assets (images, sounds)
✨ Future Improvements
Add more mini-game categories

Mobile-friendly interface with React Native

Voting system for next round categories

Achievement system for completed dares

🤝 Contributing
Contributions are welcome! Open an issue or submit a pull request to add mini-games, dares, or new features.


<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>

