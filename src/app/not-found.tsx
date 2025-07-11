'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Numbers */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 text-6xl font-bold text-white opacity-5 animate-float">4</div>
                <div className="absolute top-3/4 right-1/4 text-8xl font-bold text-white opacity-5 animate-float animation-delay-1000">0</div>
                <div className="absolute top-1/2 left-1/6 text-7xl font-bold text-white opacity-5 animate-float animation-delay-3000">4</div>
                <div className="absolute bottom-1/4 right-1/3 text-5xl font-bold text-white opacity-5 animate-float animation-delay-2000">?</div>
            </div>

            {/* Main Content */}
            <div className="text-center relative z-10 max-w-2xl mx-auto">
                {/* 404 Number */}
                <div className="mb-8 animate-fade-in-down">
                    <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 animate-gradient-x leading-none">
                        404
                    </h1>
                </div>

                {/* Error Message */}
                <div className="mb-8 animate-fade-in-up animation-delay-300">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl mb-2">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <p className="text-gray-400 text-base md:text-lg">
                        Don't worry, let's get you back on track!
                    </p>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-right animation-delay-900">
                    <Link
                        href="/"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Go Home</span>
                    </Link>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Go Back</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12 animate-fade-in animation-delay-1200">
                    <p className="text-gray-500 text-sm">
                        © 2024 Hamidiye Test System. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-in-left {
                    0% { opacity: 0; transform: translateX(-30px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slide-in-right {
                    0% { opacity: 0; transform: translateX(30px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                .animate-blob { animation: blob 7s infinite; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-gradient-x { 
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
                .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
                .animate-fade-in { animation: fade-in 0.8s ease-out; }
                
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-900 { animation-delay: 0.9s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-1200 { animation-delay: 1.2s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-3000 { animation-delay: 3s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    )
}
