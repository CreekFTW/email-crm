"use client";

import React from 'react'
import { Button } from './button'
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';

const NotFoundInfo = () => {
    const router = useRouter();

    return (
        <div className='w-full min-h-screen flex flex-col items-center justify-center overflow-y-auto bg-linear-to-b from-background to-muted/20 px-4'>
            <div className='max-w-2xl w-full text-center space-y-8'>
                {/* Animated 404 with icon */}
                <div className='relative'>
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <FileQuestion className='w-32 h-32 text-muted-foreground/20 animate-pulse' />
                    </div>
                    <h1 className='text-9xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-orange-500 via-purple-500 to-blue-500 animate-gradient'>
                        404
                    </h1>
                </div>

                {/* Content */}
                <div className='space-y-4'>
                    <h2 className='text-3xl md:text-4xl font-bold text-foreground'>
                        Page Not Found
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                        Oops! The page you&apos;re looking for seems to have wandered off into the digital void.
                    </p>
                </div>

                {/* Action buttons */}
                <div className='flex flex-col sm:flex-row gap-3 justify-center items-center pt-4'>
                    <Button
                        onClick={() => router.back()}
                        size="lg"
                        variant="outline"
                        className='w-full sm:w-auto'
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Go Back
                    </Button>
                    <Link href="/login" className='w-full sm:w-auto'>
                        <Button size="lg" className='w-full'>
                            <Home className="mr-2 h-5 w-5" />
                            Go to Login
                        </Button>
                    </Link>
                </div>

                {/* Additional help */}
                <div className='pt-8 border-t border-border/40 mt-8'>
                    <p className='text-sm text-muted-foreground mb-3'>
                        Looking for something specific?
                    </p>
                    <div className='flex flex-wrap gap-2 justify-center text-sm'>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
                <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-blob' />
                <div className='absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-blob animation-delay-2000' />
                <div className='absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-4000' />
            </div>
        </div>
    )
}

export default NotFoundInfo
