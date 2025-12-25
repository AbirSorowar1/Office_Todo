import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, AlertCircle, Loader } from 'lucide-react';
import Button from '../components/shared/Button';

const Signup = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, error: authError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            setError('');
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign up. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <Briefcase className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Join WorkHub Pro
                    </h1>
                    <p className="text-gray-600">
                        Create your account and start managing your workplace
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Error Message */}
                    {(error || authError) && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-800">{error || authError}</p>
                        </div>
                    )}

                    {/* Google Signup Button */}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full justify-center border-2 hover:bg-gray-50"
                    >
                        {loading ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-5 h-5"
                            />
                        )}
                        <span className="font-medium text-gray-700">
                            {loading ? 'Signing up...' : 'Continue with Google'}
                        </span>
                    </Button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Email Signup Form (Placeholder) */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Work Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    disabled
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Email signup coming soon! Use Google for now.
                            </p>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled
                        >
                            Continue with Email
                        </Button>
                    </div>

                    {/* Terms */}
                    <p className="mt-6 text-xs text-center text-gray-500">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;