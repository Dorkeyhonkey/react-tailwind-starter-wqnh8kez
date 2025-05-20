// src/App.js

import React, { useState } from "react";
import "./style.css";
import Login from "./login";

function App() {
  const [user, setUser] = useState(null);

  const handleUserChanged = (loggedInUser) => {
    setUser(loggedInUser);
    console.log("User changed:", loggedInUser);
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-[#F5F1EB] flex flex-col items-center">
      {!user && (
        <section className="mt-10 w-full flex justify-center">
          <div className="w-full max-w-md">
            <Login onUserChanged={handleUserChanged} />
          </div>
        </section>
      )}

      {user && (
        <>
          <header className="mt-12 text-center px-6">
            <h1 className="text-5xl font-extrabold mb-4">EchoVault</h1>
            <p className="text-lg text-gray-700">
              Your private digital memorial vault — emotional peace of mind for the ones you love.
            </p>
          </header>

          <section className="mt-12 max-w-2xl text-center px-4">
            <h2 className="text-2xl font-bold mb-2 text-[#2C3E50]">
              "What if your child could hear your voice on their wedding day… even if you're not around anymore?"
            </h2>
            <p className="text-md text-gray-600 mt-4">
              EchoVault helps you preserve messages, videos, instructions, and secrets — locked securely in digital vaults that unlock only at the right time.
            </p>
          </section>

          <section className="mt-16 px-4 text-center max-w-xl">
            <h3 className="text-xl font-semibold mb-2">🔐 Coming Soon: Vault Creation</h3>
            <p className="text-gray-600">
              Soon you'll be able to create encrypted vaults, assign recipients, and schedule unlock triggers like time-based or death verification.
            </p>
          </section>

          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-5xl w-full">
            <div className="p-6 bg-white shadow rounded">
              <h4 className="font-bold text-lg mb-2">Encrypted Legacy Vaults</h4>
              <p className="text-sm text-gray-600">
                Store videos, letters, passwords, crypto keys & more — all encrypted before upload.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded">
              <h4 className="font-bold text-lg mb-2">Smart Unlocking</h4>
              <p className="text-sm text-gray-600">
                Choose when and how vaults unlock — after death, on a date, or for specific recipients.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded">
              <h4 className="font-bold text-lg mb-2">Voice & AI Memories</h4>
              <p className="text-sm text-gray-600">
                Use AI to generate goodbye messages, narrated slideshows, and printed keepsakes.
              </p>
            </div>
          </section>

          <footer className="mt-20 text-center text-sm text-gray-500 p-6">
            &copy; {new Date().getFullYear()} EchoVault — All rights reserved.<br />
            Built with ❤️ for digital legacy that lasts forever.
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
