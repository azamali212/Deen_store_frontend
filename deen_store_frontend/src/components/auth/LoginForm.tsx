'use client';

import React from 'react';
import Input from '@/components/ui/inputs/input';
import Button from '@/components/ui/buttons/button';
import Card from '@/components/ui/cards/card';
import Logo from '@/components/common/logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Colors } from '@/constants/colors';
import { LoginProps } from '@/types/ui';
import ROUTES from "@/constants/route.constant"



const LoginForm: React.FC<LoginProps> = ({
    emailOrPhone,
    setEmailOrPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    openForgotPassword,
    variant,
}) => {
    return (
        <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div className="flex justify-center mb-4">
                
            </div>
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Sign in</h2>

                <div className="space-y-4">
                    <Input
                        type="text"
                        label="Email or mobile phone number"
                        placeholder="example@email.com"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                        variant={variant}
                    />

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="********"
                                variant={variant}
                                className="w-full px-4 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" style={{
                        backgroundColor: variant === 'admin' ? Colors.ADMINLOGINCOLOR : Colors.PRIMARY,
                        color: Colors.TEXT_LIGHT
                    }}>
                        Continue
                    </Button>

                </div>



                {variant !== 'admin' && (
                    <p className="text-xs text-gray-600 mt-4">
                        By continuing, you agree to <strong>Shopinity's</strong>{' '}
                        <a href="#" className="text-primary underline hover:no-underline">Terms & Conditions</a>. Please review our{' '}
                        <a href="#" className="text-primary underline hover:no-underline">Privacy Policy</a>,{' '}
                        <a href="#" className="text-primary underline hover:no-underline">Cookie Policy</a> and{' '}
                        <a href="#" className="text-primary underline hover:no-underline">Interest-Based Ads Policy</a>.
                    </p>
                )}

                <div className="mt-6 space-y-3">
                    {variant !== 'admin' && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                            <Link href={ROUTES.REGISTER} className="text-sm text-primary hover:underline">
                                Create An Account?
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                        <button type="button" onClick={openForgotPassword} className="text-sm text-primary hover:underline">
                            Forgot Password
                        </button>
                    </div>

                    {variant !== 'admin' && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                            <a href="#" className="text-sm text-primary hover:underline">
                                Business Account Access
                            </a>
                        </div>
                    )}
                </div>
            </Card>
        </form>
    );
};

export default LoginForm;