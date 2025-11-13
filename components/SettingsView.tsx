
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import LogoutIcon from './icons/LogoutIcon.tsx';

export default function SettingsView() {
  const { userId, apiKey, saveApiKey, isSavingKey, authError, logout } = useContext(AppContext);
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setKeyInput(apiKey || '');
  }, [apiKey]);

  const handleSave = async () => {
    const success = await saveApiKey(keyInput);
    setSaveStatus(success ? 'success' : 'error');
    if (success) {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-8 text-white">Settings</h2>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">User Profile</h3>
        <div className="flex items-center justify-between">
          <p className="text-gray-300">Logged in as: <span className="font-bold text-indigo-400">{userId}</span></p>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Gemini API Key</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Your API key is stored only in your browser and is required to generate flashcards.
        </p>
        
        {authError && saveStatus === 'error' && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-4 text-sm" role="alert">
            <p>{authError}</p>
          </div>
        )}

        {saveStatus === 'success' && (
            <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-md mb-4 text-sm" role="alert">
                <p>API Key saved and verified successfully!</p>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setSaveStatus('idle');
            }}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your Gemini API Key"
          />
          <button
            onClick={handleSave}
            disabled={isSavingKey || !keyInput}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSavingKey ? 'Verifying...' : 'Save Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
