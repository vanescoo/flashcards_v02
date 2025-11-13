
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';

export default function LoginModal() {
  const [userId, setUserId] = useState('');
  const { login } = useContext(AppContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      login(userId.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to Gemini Flashcards</h2>
        <p className="text-gray-400 mb-6">
          Please enter a User ID to save and sync your progress. This can be any name you choose.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your User ID (e.g., 'learner123')"
            aria-label="User ID"
          />
          <button
            type="submit"
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500"
            disabled={!userId.trim()}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
