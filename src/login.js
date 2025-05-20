// src/login.js

import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const Login = ({ onUserChanged }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      if (onUserChanged) onUserChanged(user);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async () => {
    try {
      if (isCreatingAccount) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (user) {
    return (
      <div className="text-center mt-10">
        <p className="text-xl mb-4">Welcome, {user.email}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow bg-white text-center">
      <h2 className="text-2xl font-semibold mb-4">
        {isCreatingAccount ? 'Create Account' : 'Log In'}
      </h2>

      <input
        type="email"
        className="w-full mb-3 p-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full mb-4 p-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleEmailAuth}
        className="bg-blue-600 text-white w-full py-2 rounded mb-2"
      >
        {isCreatingAccount ? 'Sign Up' : 'Log In'}
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-red-500 text-white w-full py-2 rounded mb-2"
      >
        Sign in with Google
      </button>

      <p
        className="text-sm mt-2 text-blue-600 cursor-pointer"
        onClick={() => setIsCreatingAccount(!isCreatingAccount)}
      >
        {isCreatingAccount
          ? 'Already have an account? Log in'
          : 'Need an account? Create one'}
      </p>
    </div>
  );
};

export default Login;
