import React, { useState } from 'react';
import { useUIStore } from '../stores/UIStore';

interface LoginSignupScreenProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onSignup: (name: string, email: string, pass: string) => Promise<boolean>;
}

const LoginSignupScreen: React.FC<LoginSignupScreenProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (isLogin) {
            const success = await onLogin(email, password);
            if (!success) {
                setError('Invalid email or password.');
            }
        } else {
            if (name.length < 3) {
                setError('Name must be at least 3 characters.');
                setIsLoading(false);
                return;
            }
            const success = await onSignup(name, email, password);
            if (!success) {
                setError('Email already exists or invalid data.');
            } else {
                showNotification('Account created successfully!', '🎉');
            }
        }
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
        <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-purple-400 drop-shadow-lg">
              DareDown
            </h1>
            <p className="text-lg md:text-xl text-gray-300">The ultimate party game of dares and challenges.</p>
        </div>
      
      <div className="w-full max-w-sm bg-gray-800/50 p-6 rounded-2xl border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          {error && <p className="text-red-500 text-sm animate-shake">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div> : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
        
        <p className="mt-6 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode} className="font-semibold text-purple-400 hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
       <div className="mt-4 text-xs text-gray-500 max-w-sm">
          <p>For testing, use admin credentials:</p>
          <p>Email: <span className="text-gray-400">admin@daredown.com</span> | Password: <span className="text-gray-400">password123</span></p>
      </div>
    </div>
  );
};

export default LoginSignupScreen;