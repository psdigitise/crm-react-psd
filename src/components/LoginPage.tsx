// // // // // import React, { useState } from 'react';
// // // // // import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// // // // // interface LoginPageProps {
// // // // //   onLogin: () => void;
// // // // // }

// // // // // export function LoginPage({ onLogin }: LoginPageProps) {
// // // // //   const [email, setEmail] = useState('jane@example.com');
// // // // //   const [password, setPassword] = useState('');
// // // // //   const [showPassword, setShowPassword] = useState(false);

// // // // //   const handleSubmit = (e: React.FormEvent) => {
// // // // //     e.preventDefault();
// // // // //     onLogin();
// // // // //   };

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
// // // // //       <div className="max-w-md w-full">
// // // // //         {/* Logo */}
// // // // //         <div className="text-center mb-8">
// // // // //           <div className="inline-flex items-center space-x-2 mb-6">
// // // // //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// // // // //               <span className="text-white font-bold text-sm">P</span>
// // // // //             </div>
// // // // //             <span className="text-2xl font-bold">
// // // // //               <span className="text-blue-600">PS</span>
// // // // //               <span className="text-green-500">Digitise</span>
// // // // //             </span>
// // // // //           </div>
// // // // //           <h1 className="text-2xl font-semibold text-gray-900">Login to PSDigitise</h1>
// // // // //         </div>

// // // // //         {/* Login Form */}
// // // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
// // // // //           <form onSubmit={handleSubmit} className="space-y-6">
// // // // //             {/* Email Field */}
// // // // //             <div>
// // // // //               <div className="relative">
// // // // //                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // // //                 <input
// // // // //                   type="email"
// // // // //                   value={email}
// // // // //                   onChange={(e) => setEmail(e.target.value)}
// // // // //                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// // // // //                   placeholder="jane@example.com"
// // // // //                   required
// // // // //                 />
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Password Field */}
// // // // //             <div>
// // // // //               <div className="relative">
// // // // //                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // // //                 <input
// // // // //                   type={showPassword ? 'text' : 'password'}
// // // // //                   value={password}
// // // // //                   onChange={(e) => setPassword(e.target.value)}
// // // // //                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // // // //                   placeholder="••••••"
// // // // //                   required
// // // // //                 />
// // // // //                 <button
// // // // //                   type="button"
// // // // //                   onClick={() => setShowPassword(!showPassword)}
// // // // //                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600"
// // // // //                 >
// // // // //                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// // // // //                 </button>
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Forgot Password */}
// // // // //             <div className="text-right">
// // // // //               <button
// // // // //                 type="button"
// // // // //                 className="text-sm text-gray-500 hover:text-gray-700"
// // // // //               >
// // // // //                 Forgot Password?
// // // // //               </button>
// // // // //             </div>

// // // // //             {/* Login Button */}
// // // // //             <button
// // // // //               type="submit"
// // // // //               className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
// // // // //             >
// // // // //               Login
// // // // //             </button>

// // // // //             {/* Divider */}
// // // // //             <div className="relative">
// // // // //               <div className="absolute inset-0 flex items-center">
// // // // //                 <div className="w-full border-t border-gray-300" />
// // // // //               </div>
// // // // //               <div className="relative flex justify-center text-sm">
// // // // //                 <span className="px-2 bg-white text-gray-500">or</span>
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Email Link Button */}
// // // // //             <button
// // // // //               type="button"
// // // // //               className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
// // // // //             >
// // // // //               Login with Email Link
// // // // //             </button>
// // // // //           </form>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // import React, { useState } from 'react';
// // // // import axios from 'axios';
// // // // import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// // // // interface LoginPageProps {
// // // //   onLogin: () => void;
// // // // }

// // // // export function LoginPage({ onLogin }: LoginPageProps) {
// // // //   const [email, setEmail] = useState('jane@example.com');
// // // //   const [password, setPassword] = useState('');
// // // //   const [showPassword, setShowPassword] = useState(false);
// // // //   const [error, setError] = useState('');

// // // //   const handleSubmit = async (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     setError('');

// // // //     try {
// // // //       const response = await axios.post(
// // // //         'http://103.214.132.20:8002/api/method/customcrm.api.login',
// // // //         new URLSearchParams({
// // // //           usr: email,
// // // //           pwd: password,
// // // //         }),
// // // //         {
// // // //           headers: {
// // // //             'Content-Type': 'application/x-www-form-urlencoded',
// // // //           },
// // // //         }
// // // //       );

// // // //       const res = response.data.message;

// // // //       if (res.success_key === 1) {
// // // //         // Save session data
// // //         // sessionStorage.setItem('username', res.username);
// // //         // sessionStorage.setItem('email', res.email);
// // //         // sessionStorage.setItem('company', res.company || '');

// // // //         // Proceed to next page
// // // //         onLogin();
// // // //       } else {
// // // //         setError('Login failed. Please check your credentials.');
// // // //       }
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       setError('Something went wrong. Please try again later.');
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
// // // //       <div className="max-w-md w-full">
// // // //         <div className="text-center mb-8">
// // // //           <div className="inline-flex items-center space-x-2 mb-6">
// // // //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// // // //               <span className="text-white font-bold text-sm">P</span>
// // // //             </div>
// // // //             <span className="text-2xl font-bold">
// // // //               <span className="text-blue-600">PS</span>
// // // //               <span className="text-green-500">Digitise</span>
// // // //             </span>
// // // //           </div>
// // // //           <h1 className="text-2xl font-semibold text-gray-900">Login to PSDigitise</h1>
// // // //         </div>

// // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
// // // //           <form onSubmit={handleSubmit} className="space-y-6">
// // // //             {/* Email Field */}
// // // //             <div className="relative">
// // // //               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // //               <input
// // // //                 type="email"
// // // //                 value={email}
// // // //                 onChange={(e) => setEmail(e.target.value)}
// // // //                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// // // //                 placeholder="jane@example.com"
// // // //                 required
// // // //               />
// // // //             </div>

// // // //             {/* Password Field */}
// // // //             <div className="relative">
// // // //               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // //               <input
// // // //                 type={showPassword ? 'text' : 'password'}
// // // //                 value={password}
// // // //                 onChange={(e) => setPassword(e.target.value)}
// // // //                 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // // //                 placeholder="••••••"
// // // //                 required
// // // //               />
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={() => setShowPassword(!showPassword)}
// // // //                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600"
// // // //               >
// // // //                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// // // //               </button>
// // // //             </div>

// // // //             {/* Error Message */}
// // // //             {error && <p className="text-red-600 text-sm">{error}</p>}

// // // //             {/* Login Button */}
// // // //             <button
// // // //               type="submit"
// // // //               className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
// // // //             >
// // // //               Login
// // // //             </button>
// // // //           </form>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // // import React, { useState } from 'react';
// // // // import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
// // // // import { setUserSession } from '../utils/session';

// // // // interface LoginPageProps {
// // // //   onLogin: () => void;
// // // // }

// // // // interface LoginResponse {
// // // //   message: {
// // // //     success_key: number;
// // // //     message: string;
// // // //     sid?: string;
// // // //     api_key?: string | null;
// // // //     api_secret?: string | null;
// // // //     username?: string;
// // // //     email?: string;
// // // //     company?: string | null;
// // // //     warning?: string;
// // // //     full_name?: string;
// // // //   };
// // // // }

// // // // export function LoginPage({ onLogin }: LoginPageProps) {
// // // //   const [email, setEmail] = useState('hari@psd.com');
// // // //   const [password, setPassword] = useState('admin@123');
// // // //   const [showPassword, setShowPassword] = useState(false);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [error, setError] = useState('');

// // // //   const handleSubmit = async (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     setLoading(true);
// // // //     setError('');

// // // //     try {
// // // //       const formData = new FormData();
// // // //       formData.append('usr', email);
// // // //       formData.append('pwd', password);

// // // //       console.log('Attempting login with:', { email, password: '***' });

// // // //       const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
// // // //         method: 'POST',
// // // //         body: formData,
// // // //         // Add headers for better compatibility
// // // //         headers: {
// // // //           'Accept': 'application/json',
// // // //         }
// // // //       });

// // // //       console.log('Response status:', response.status);
// // // //       console.log('Response headers:', response.headers);

// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// // // //       }

// // // //       const result: LoginResponse = await response.json();
// // // //       console.log('Login response:', result);

// // // //       if (result.message && result.message.success_key === 1) {
// // // //         // Store user session data
// // // //         const sessionData = {
// // // //           company: result.message.company || '',
// // // //           username: result.message.username || '',
// // // //           email: result.message.email || email,
// // // //           full_name: result.message.full_name || '',
// // // //           sid: result.message.sid || '',
// // // //           api_key: result.message.api_key || '',
// // // //           api_secret: result.message.api_secret || ''
// // // //         };

// // // //         console.log('Storing session data:', sessionData);

// // // //         // Store session data using utility function
// // // //         setUserSession(sessionData);

// // // //         // Show success message
// // // //         console.log('Login successful, redirecting...');

// // // //         // Redirect to dashboard
// // // //         onLogin();
// // // //       } else {
// // // //         // Show error message
// // // //         const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
// // // //         console.error('Login failed:', errorMessage);
// // // //         setError(errorMessage);
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Login error:', error);

// // // //       // More specific error handling
// // // //       if (error instanceof TypeError && error.message.includes('fetch')) {
// // // //         setError('Unable to connect to the server. Please check your internet connection and try again.');
// // // //       } else if (error instanceof Error) {
// // // //         setError(`Connection error: ${error.message}`);
// // // //       } else {
// // // //         setError('An unexpected error occurred. Please try again.');
// // // //       }
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
// // // //       <div className="max-w-md w-full">
// // // //         {/* Logo */}
// // // //         <div className="text-center mb-8">
// // // //           <div className="inline-flex items-center space-x-2 mb-6">
// // // //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// // // //               <span className="text-white font-bold text-sm">P</span>
// // // //             </div>
// // // //             <span className="text-2xl font-bold">
// // // //               <span className="text-blue-600">PS</span>
// // // //               <span className="text-green-500">Digitise</span>
// // // //             </span>
// // // //           </div>
// // // //           <h1 className="text-2xl font-semibold text-gray-900">Login to PSDigitise</h1>
// // // //         </div>

// // // //         {/* Login Form */}
// // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
// // // //           <form onSubmit={handleSubmit} className="space-y-6">
// // // //             {/* Error Message */}
// // // //             {error && (
// // // //               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// // // //                 <p className="text-red-800 text-sm">{error}</p>
// // // //               </div>
// // // //             )}

// // // //             {/* Email Field */}
// // // //             <div>
// // // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // // //                 Email Address
// // // //               </label>
// // // //               <div className="relative">
// // // //                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // //                 <input
// // // //                   type="email"
// // // //                   value={email}
// // // //                   onChange={(e) => setEmail(e.target.value)}
// // // //                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// // // //                   placeholder="demo@psdigitise.com"
// // // //                   required
// // // //                   disabled={loading}
// // // //                 />
// // // //               </div>
// // // //             </div>

// // // //             {/* Password Field */}
// // // //             <div>
// // // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // // //                 Password
// // // //               </label>
// // // //               <div className="relative">
// // // //                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // // //                 <input
// // // //                   type={showPassword ? 'text' : 'password'}
// // // //                   value={password}
// // // //                   onChange={(e) => setPassword(e.target.value)}
// // // //                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // // //                   placeholder="••••••"
// // // //                   required
// // // //                   disabled={loading}
// // // //                 />
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => setShowPassword(!showPassword)}
// // // //                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600"
// // // //                   disabled={loading}
// // // //                 >
// // // //                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// // // //                 </button>
// // // //               </div>
// // // //             </div>

// // // //             {/* Forgot Password */}
// // // //             <div className="text-right">
// // // //               <button
// // // //                 type="button"
// // // //                 className="text-sm text-gray-500 hover:text-gray-700"
// // // //                 disabled={loading}
// // // //               >
// // // //                 Forgot Password?
// // // //               </button>
// // // //             </div>

// // // //             {/* Login Button */}
// // // //             <button
// // // //               type="submit"
// // // //               disabled={loading}
// // // //               className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// // // //             >
// // // //               {loading ? (
// // // //                 <>
// // // //                   <Loader2 className="w-5 h-5 animate-spin mr-2" />
// // // //                   Signing in...
// // // //                 </>
// // // //               ) : (
// // // //                 'Login'
// // // //               )}
// // // //             </button>

// // // //             {/* Divider */}
// // // //             <div className="relative">
// // // //               <div className="absolute inset-0 flex items-center">
// // // //                 <div className="w-full border-t border-gray-300" />
// // // //               </div>
// // // //               <div className="relative flex justify-center text-sm">
// // // //                 <span className="px-2 bg-white text-gray-500">or</span>
// // // //               </div>
// // // //             </div>

// // // //             {/* Email Link Button */}
// // // //             <button
// // // //               type="button"
// // // //               className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
// // // //               disabled={loading}
// // // //             >
// // // //               Login with Email Link
// // // //             </button>
// // // //           </form>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // import React, { useState } from 'react';
// // // import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
// // // import { setUserSession } from '../utils/session';

// // // interface LoginPageProps {
// // //   onLogin: () => void;
// // // }

// // // interface LoginResponse {
// // //   message: {
// // //     success_key: number;
// // //     message: string;
// // //     sid?: string;
// // //     api_key?: string | null;
// // //     api_secret?: string | null;
// // //     username?: string;
// // //     email?: string;
// // //     company?: string | null;
// // //     warning?: string;
// // //     full_name?: string;
// // //   };
// // // }

// // // interface RegisterData {
// // //   email: string;
// // //   first_name: string;
// // //   company: string;
// // //   role_profile_name: string;
// // //   new_password: string;
// // // }

// // // export function LoginPage({ onLogin }: LoginPageProps) {
// // //   const [isRegisterMode, setIsRegisterMode] = useState(false);
// // //   const [email, setEmail] = useState('hari@psd.com');
// // //   const [password, setPassword] = useState('admin@123');
// // //   const [showPassword, setShowPassword] = useState(false);
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState('');

// // //   // Register form state
// // //   const [registerData, setRegisterData] = useState<RegisterData>({
// // //     email: '',
// // //     first_name: '',
// // //     company: '',
// // //     role_profile_name: 'Only If Create',
// // //     new_password: ''
// // //   });
// // //   const [confirmPassword, setConfirmPassword] = useState('');

// // //   const handleLogin = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     setError('');

// // //     try {
// // //       const formData = new FormData();
// // //       formData.append('usr', email);
// // //       formData.append('pwd', password);

// // //       console.log('Attempting login with:', { email, password: '***' });

// // //       const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
// // //         method: 'POST',
// // //         body: formData,
// // //         headers: {
// // //           'Accept': 'application/json',
// // //         }
// // //       });

// // //       console.log('Response status:', response.status);
// // //       console.log('Response headers:', response.headers);

// // //       if (!response.ok) {
// // //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// // //       }

// // //       const result: LoginResponse = await response.json();
// // //       console.log('Login response:', result);

// // //       if (result.message && result.message.success_key === 1) {
// // //         const sessionData = {
// // //           company: result.message.company || '',
// // //           username: result.message.username || '',
// // //           email: result.message.email || email,
// // //           full_name: result.message.full_name || '',
// // //           sid: result.message.sid || '',
// // //           api_key: result.message.api_key || '',
// // //           api_secret: result.message.api_secret || ''
// // //         };

// // //         console.log('Storing session data:', sessionData);
// // //         setUserSession(sessionData);
// // //         console.log('Login successful, redirecting...');
// // //         onLogin();
// // //       } else {
// // //         const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
// // //         console.error('Login failed:', errorMessage);
// // //         setError(errorMessage);
// // //       }
// // //     } catch (error) {
// // //       console.error('Login error:', error);

// // //       if (error instanceof TypeError && error.message.includes('fetch')) {
// // //         setError('Unable to connect to the server. Please check your internet connection and try again.');
// // //       } else if (error instanceof Error) {
// // //         setError(`Connection error: ${error.message}`);
// // //       } else {
// // //         setError('An unexpected error occurred. Please try again.');
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleRegister = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     setError('');

// // //     // Validate passwords match
// // //     if (registerData.new_password !== confirmPassword) {
// // //       setError('Passwords do not match');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     // Validate required fields
// // //     if (!registerData.email || !registerData.first_name || !registerData.new_password) {
// // //       setError('Please fill in all required fields');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     try {
// // //       console.log('Attempting registration with:', { ...registerData, new_password: '***' });

// // //       const response = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// // //         },
// // //         body: JSON.stringify(registerData)
// // //       });

// // //       console.log('Registration response status:', response.status);

// // //       if (!response.ok) {
// // //         const errorText = await response.text();
// // //         throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
// // //       }

// // //       const result = await response.json();
// // //       console.log('Registration successful:', result);

// // //       // Reset form and switch to login mode
// // //       setRegisterData({
// // //         email: '',
// // //         first_name: '',
// // //         company: '',
// // //         role_profile_name: 'Only If Create',
// // //         new_password: ''
// // //       });
// // //       setConfirmPassword('');
// // //       setEmail(registerData.email); // Pre-fill login email
// // //       setIsRegisterMode(false);
// // //       setError('');

// // //       // Show success message
// // //       alert('Registration successful! Please log in with your credentials.');

// // //     } catch (error) {
// // //       console.error('Registration error:', error);

// // //       if (error instanceof TypeError && error.message.includes('fetch')) {
// // //         setError('Unable to connect to the server. Please check your internet connection and try again.');
// // //       } else if (error instanceof Error) {
// // //         setError(`Registration failed: ${error.message}`);
// // //       } else {
// // //         setError('An unexpected error occurred during registration. Please try again.');
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
// // //     setRegisterData(prev => ({
// // //       ...prev,
// // //       [field]: value
// // //     }));
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
// // //       <div className="max-w-md w-full">
// // //         {/* Logo */}
// // //         <div className="text-center mb-8">
// // //           <div className="inline-flex items-center space-x-2 mb-6">
// // //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// // //               <span className="text-white font-bold text-sm">P</span>
// // //             </div>
// // //             <span className="text-2xl font-bold">
// // //               <span className="text-blue-600">PS</span>
// // //               <span className="text-green-500">Digitise</span>
// // //             </span>
// // //           </div>
// // //           <h1 className="text-2xl font-semibold text-gray-900">
// // //             {isRegisterMode ? 'Create Account' : 'Login to PSDigitise'}
// // //           </h1>
// // //         </div>

// // //         {/* Form Container */}
// // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
// // //           {isRegisterMode ? (
// // //             /* Register Form */
// // //             <form onSubmit={handleRegister} className="space-y-6">
// // //               {/* Error Message */}
// // //               {error && (
// // //                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// // //                   <p className="text-red-800 text-sm">{error}</p>
// // //                 </div>
// // //               )}

// // //               {/* Email Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Email Address <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type="email"
// // //                     value={registerData.email}
// // //                     onChange={(e) => handleRegisterInputChange('email', e.target.value)}
// // //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// // //                     placeholder="your@email.com"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* First Name Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   First Name <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <div className="relative">
// // //                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type="text"
// // //                     value={registerData.first_name}
// // //                     onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
// // //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //                     placeholder="John"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Company Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Company
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type="text"
// // //                     value={registerData.company}
// // //                     onChange={(e) => handleRegisterInputChange('company', e.target.value)}
// // //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //                     placeholder="Your Company"
// // //                     disabled={loading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Password Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Password <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type={showPassword ? 'text' : 'password'}
// // //                     value={registerData.new_password}
// // //                     onChange={(e) => handleRegisterInputChange('new_password', e.target.value)}
// // //                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //                     placeholder="••••••"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setShowPassword(!showPassword)}
// // //                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600"
// // //                     disabled={loading}
// // //                   >
// // //                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Confirm Password Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Confirm Password <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type={showPassword ? 'text' : 'password'}
// // //                     value={confirmPassword}
// // //                     onChange={(e) => setConfirmPassword(e.target.value)}
// // //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //                     placeholder="••••••"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Register Button */}
// // //               <button
// // //                 type="submit"
// // //                 disabled={loading}
// // //                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// // //               >
// // //                 {loading ? (
// // //                   <>
// // //                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
// // //                     Creating Account...
// // //                   </>
// // //                 ) : (
// // //                   'Create Account'
// // //                 )}
// // //               </button>

// // //               {/* Switch to Login */}
// // //               <div className="text-center">
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => {
// // //                     setIsRegisterMode(false);
// // //                     setError('');
// // //                   }}
// // //                   className="text-sm text-gray-500 hover:text-gray-700"
// // //                   disabled={loading}
// // //                 >
// // //                   Already have an account? Sign in
// // //                 </button>
// // //               </div>
// // //             </form>
// // //           ) : (
// // //             /* Login Form */
// // //             <form onSubmit={handleLogin} className="space-y-6">
// // //               {/* Error Message */}
// // //               {error && (
// // //                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// // //                   <p className="text-red-800 text-sm">{error}</p>
// // //                 </div>
// // //               )}

// // //               {/* Email Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Email Address
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type="email"
// // //                     value={email}
// // //                     onChange={(e) => setEmail(e.target.value)}
// // //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// // //                     placeholder="hari@psd.com"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Password Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Password
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
// // //                   <input
// // //                     type={showPassword ? 'text' : 'password'}
// // //                     value={password}
// // //                     onChange={(e) => setPassword(e.target.value)}
// // //                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //                     placeholder="••••••"
// // //                     required
// // //                     disabled={loading}
// // //                   />
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setShowPassword(!showPassword)}
// // //                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600"
// // //                     disabled={loading}
// // //                   >
// // //                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Forgot Password */}
// // //               <div className="text-right">
// // //                 <button
// // //                   type="button"
// // //                   className="text-sm text-gray-500 hover:text-gray-700"
// // //                   disabled={loading}
// // //                 >
// // //                   Forgot Password?
// // //                 </button>
// // //               </div>

// // //               {/* Login Button */}
// // //               <button
// // //                 type="submit"
// // //                 disabled={loading}
// // //                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// // //               >
// // //                 {loading ? (
// // //                   <>
// // //                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
// // //                     Signing in...
// // //                   </>
// // //                 ) : (
// // //                   'Login'
// // //                 )}
// // //               </button>

// // //               {/* Divider */}
// // //               <div className="relative">
// // //                 <div className="absolute inset-0 flex items-center">
// // //                   <div className="w-full border-t border-gray-300" />
// // //                 </div>
// // //                 <div className="relative flex justify-center text-sm">
// // //                   <span className="px-2 bg-white text-gray-500">or</span>
// // //                 </div>
// // //               </div>

// // //               {/* Register Button */}
// // //               <button
// // //                 type="button"
// // //                 onClick={() => {
// // //                   setIsRegisterMode(true);
// // //                   setError('');
// // //                 }}
// // //                 className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
// // //                 disabled={loading}
// // //               >
// // //                 Create New Account
// // //               </button>
// // //             </form>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import React, { useState } from 'react';
// // import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
// // import { setUserSession } from '../utils/session';

// // interface LoginPageProps {
// //   onLogin: () => void;
// // }

// // interface LoginResponse {
// //   message: {
// //     success_key: number;
// //     message: string;
// //     sid?: string;
// //     api_key?: string | null;
// //     api_secret?: string | null;
// //     username?: string;
// //     email?: string;
// //     company?: string | null;
// //     warning?: string;
// //     full_name?: string;
// //   };
// // }

// // interface RegisterData {
// //   email: string;
// //   first_name: string;
// //   company: string;
// //   role_profile_name: string;
// //   new_password: string;
// // }

// // export function LoginPage({ onLogin }: LoginPageProps) {
// //   const [isRegisterMode, setIsRegisterMode] = useState(false);
// //   const [email, setEmail] = useState('hari@psd.com');
// //   const [password, setPassword] = useState('admin@123');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');

// //   const [passwordError, setPasswordError] = useState("");

// //   const validatePassword = (password: string) => {
// //     const capitalRegex = /[A-Z]/;
// //     const numberRegex = /[0-9]/;
// //     const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

// //     if (!capitalRegex.test(password)) {
// //       return "Password must contain at least one capital letter.";
// //     }
// //     if (!numberRegex.test(password)) {
// //       return "Password must contain at least one number.";
// //     }
// //     if (!specialCharRegex.test(password)) {
// //       return "Password must contain at least one special character.";
// //     }
// //     if (password.length < 8) {
// //       return "Password must be at least 8 characters long.";
// //     }

// //     return "";
// //   };


// //   // Register form state
// //   const [registerData, setRegisterData] = useState<RegisterData>({
// //     email: '',
// //     first_name: '',
// //     company: '',
// //     role_profile_name: 'Only If Create',
// //     new_password: ''
// //   });
// //   const [confirmPassword, setConfirmPassword] = useState('');

// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');

// //     try {
// //       const formData = new FormData();
// //       formData.append('usr', email);
// //       formData.append('pwd', password);

// //       console.log('Attempting login with:', { email, password: '***' });

// //       const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
// //         method: 'POST',
// //         body: formData,
// //         headers: {
// //           'Accept': 'application/json',
// //         }
// //       });

// //       console.log('Response status:', response.status);
// //       console.log('Response headers:', response.headers);

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       const result: LoginResponse = await response.json();
// //       console.log('Login response:', result);

// //       if (result.message && result.message.success_key === 1) {
// //         const sessionData = {
// //           company: result.message.company || '',
// //           username: result.message.username || '',
// //           email: result.message.email || email,
// //           full_name: result.message.full_name || '',
// //           sid: result.message.sid || '',
// //           api_key: result.message.api_key || '',
// //           api_secret: result.message.api_secret || ''
// //         };

// //         // console.log('Storing session data:', sessionData);
// //         setUserSession(sessionData);
// //         console.log('Login successful, redirecting...');
// //         onLogin();
// //       } else {
// //         const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
// //         console.error('Login failed:', errorMessage);
// //         setError(errorMessage);
// //       }
// //     } catch (error) {
// //       console.error('Login error:', error);

// //       if (error instanceof TypeError && error.message.includes('fetch')) {
// //         setError('Unable to connect to the server. Please check your internet connection and try again.');
// //       } else if (error instanceof Error) {
// //         setError(`Connection error: ${error.message}`);
// //       } else {
// //         setError('An unexpected error occurred. Please try again.');
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleRegister = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');

// //     // Validate passwords match
// //     if (registerData.new_password !== confirmPassword) {
// //       setError('Passwords do not match');
// //       setLoading(false);
// //       return;
// //     }

// //     // Validate required fields
// //     if (!registerData.email || !registerData.first_name || !registerData.new_password) {
// //       setError('Please fill in all required fields');
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       console.log('Attempting registration with:', { ...registerData, new_password: '***' });

// //       const response = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// //         },
// //         body: JSON.stringify(registerData)
// //       });

// //       console.log('Registration response status:', response.status);

// //       if (!response.ok) {
// //         const errorText = await response.text();
// //         throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
// //       }

// //       const result = await response.json();
// //       console.log('Registration successful:', result);

// //       // Reset form and switch to login mode
// //       setRegisterData({
// //         email: '',
// //         first_name: '',
// //         company: '',
// //         role_profile_name: 'Only If Create',
// //         new_password: ''
// //       });
// //       setConfirmPassword('');
// //       setEmail(registerData.email); // Pre-fill login email
// //       setIsRegisterMode(false);
// //       setError('');

// //       // Show success message
// //       alert('Registration successful! Please log in with your credentials.');

// //     } catch (error) {
// //       console.error('Registration error:', error);

// //       if (error instanceof TypeError && error.message.includes('fetch')) {
// //         setError('Unable to connect to the server. Please check your internet connection and try again.');
// //       } else if (error instanceof Error) {
// //         setError(`Registration failed: ${error.message}`);
// //       } else {
// //         setError('An unexpected error occurred during registration. Please try again.');
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleRegisterInputChange = (field: string, value: string) => {
// //     setRegisterData((prev) => ({ ...prev, [field]: value }));

// //     if (field === 'new_password') {
// //       const error = validatePassword(value);
// //       setPasswordError(error);
// //     }
// //   };


// //   return (
// //     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
// //       <div className="max-w-md w-full">
// //         {/* Logo */}
// //         <div className="text-center mb-8">
// //           <div className="inline-flex items-center space-x-2 mb-6">
// //             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// //               <span className="text-white font-bold text-sm">P</span>
// //             </div>
// //             <span className="text-2xl font-bold">
// //               <span className="text-blue-600">PS</span>
// //               <span className="text-green-500">Digitise</span>
// //             </span>
// //           </div>
// //           <h1 className="text-2xl font-semibold text-gray-900">
// //             {isRegisterMode ? 'Create Account' : 'Login to PSDigitise'}
// //           </h1>
// //         </div>

// //         {/* Form Container */}
// //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
// //           {isRegisterMode ? (
// //             /* Register Form */
// //             <form onSubmit={handleRegister} className="space-y-6">
// //               {/* Error Message */}
// //               {error && (
// //                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// //                   <p className="text-red-800 text-sm">{error}</p>
// //                 </div>
// //               )}

// //               {/* Email Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Email Address <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type="email"
// //                     value={registerData.email}
// //                     onChange={(e) => handleRegisterInputChange('email', e.target.value)}
// //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// //                     placeholder="your@email.com"
// //                     required
// //                     disabled={loading}
// //                   />
// //                 </div>
// //               </div>

// //               {/* First Name Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   First Name <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type="text"
// //                     value={registerData.first_name}
// //                     onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
// //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                     placeholder="John"
// //                     required
// //                     disabled={loading}
// //                   />
// //                 </div>
// //               </div>

// //               {/* Company Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Company
// //                 </label>
// //                 <div className="relative">
// //                   <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type="text"
// //                     value={registerData.company}
// //                     onChange={(e) => handleRegisterInputChange('company', e.target.value)}
// //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                     placeholder="Your Company"
// //                     disabled={loading}
// //                   />
// //                 </div>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Password <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type={showPassword ? 'text' : 'password'}
// //                     value={registerData.new_password}
// //                     onChange={(e) => handleRegisterInputChange('new_password', e.target.value)}
// //                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                     placeholder="••••••"
// //                     required
// //                     disabled={loading}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                     disabled={loading}
// //                   >
// //                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// //                   </button>
// //                 </div>
// //                 {passwordError && (
// //                   <p className="mt-1 text-sm text-red-600">{passwordError}</p>
// //                 )}
// //               </div>


// //               {/* Confirm Password Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Confirm Password <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type={showPassword ? 'text' : 'password'}
// //                     value={confirmPassword}
// //                     onChange={(e) => setConfirmPassword(e.target.value)}
// //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                     placeholder="••••••"
// //                     required
// //                     disabled={loading}
// //                   />
// //                 </div>
// //               </div>

// //               <button
// //                 type="submit"
// //                 disabled={loading || !!passwordError}  // 🔒 disabled if loading OR password invalid
// //                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// //               >
// //                 {loading ? (
// //                   <>
// //                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
// //                     Creating Account...
// //                   </>
// //                 ) : (
// //                   'Create Account'
// //                 )}
// //               </button>


// //               {/* Switch to Login */}
// //               <div className="text-center">
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setIsRegisterMode(false);
// //                     setError('');
// //                   }}
// //                   className="text-sm text-gray-500 hover:text-gray-700"
// //                   disabled={loading}
// //                 >
// //                   Already have an account? Sign in
// //                 </button>
// //               </div>
// //             </form>
// //           ) : (
// //             /* Login Form */
// //             <form onSubmit={handleLogin} className="space-y-6">
// //               {/* Error Message */}
// //               {error && (
// //                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// //                   <p className="text-red-800 text-sm">{error}</p>
// //                 </div>
// //               )}

// //               {/* Email Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Email Address
// //                 </label>
// //                 <div className="relative">
// //                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type="email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
// //                     placeholder="hari@psd.com"
// //                     required
// //                     disabled={loading}
// //                   />
// //                 </div>
// //               </div>

// //               {/* Password Field */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Password
// //                 </label>
// //                 <div className="relative">
// //                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                   <input
// //                     type={showPassword ? 'text' : 'password'}
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                     placeholder="••••••"
// //                     required
// //                     disabled={loading}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                     disabled={loading}
// //                   >
// //                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// //                   </button>
// //                 </div>
// //               </div>

// //               {/* Forgot Password */}
// //               <div className="text-right">
// //                 <button
// //                   type="button"
// //                   className="text-sm text-gray-500 hover:text-gray-700"
// //                   disabled={loading}
// //                 >
// //                   Forgot Password?
// //                 </button>
// //               </div>

// //               {/* Login Button */}
// //               <button
// //                 type="submit"
// //                 disabled={loading}
// //                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// //               >
// //                 {loading ? (
// //                   <>
// //                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
// //                     Signing in...
// //                   </>
// //                 ) : (
// //                   'Login'
// //                 )}
// //               </button>

// //               {/* Divider */}
// //               <div className="relative">
// //                 <div className="absolute inset-0 flex items-center">
// //                   <div className="w-full border-t border-gray-300" />
// //                 </div>
// //                 <div className="relative flex justify-center text-sm">
// //                   <span className="px-2 bg-white text-gray-500">or</span>
// //                 </div>
// //               </div>

// //               {/* Register Button */}
// //               <button
// //                 type="button"
// //                 onClick={() => {
// //                   setIsRegisterMode(true);
// //                   setError('');
// //                 }}
// //                 className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
// //                 disabled={loading}
// //               >
// //                 Create New Account
// //               </button>
// //             </form>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }




// import React, { useState } from 'react';
// import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
// import { setUserSession } from '../utils/session';

// interface LoginPageProps {
//   onLogin: () => void;
// }

// interface LoginResponse {
//   message: {
//     success_key: number;
//     message: string;
//     sid?: string;
//     api_key?: string | null;
//     api_secret?: string | null;
//     username?: string;
//     email?: string;
//     company?: string | null;
//     warning?: string;
//     full_name?: string;
//   };
// }

// interface RegisterData {
//   email: string;
//   first_name: string;
//   company: string;
//   role_profile_name: string;
//   new_password: string;
// }

// interface CompanyData {
//   company_logo: File | null;
//   start_date: string;
//   company_name: string;
// }


// function getTodayISODate() {
//   const today = new Date();
//   return today.toISOString().slice(0, 10); // "2025-07-22"
// }

// export function LoginPage({ onLogin }: LoginPageProps) {
//   const [isRegisterMode, setIsRegisterMode] = useState(false);
//   const [email, setEmail] = useState('hari@psd.com');
//   const [password, setPassword] = useState('admin@123');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [passwordError, setPasswordError] = useState("");

//   // Register form state
//   const [registerData, setRegisterData] = useState<RegisterData>({
//     email: '',
//     first_name: '',
//     company: '',
//     role_profile_name: 'Only If Create',
//     new_password: ''
//   });
//   const [confirmPassword, setConfirmPassword] = useState('');

//   // Company form state
//   const [companyData, setCompanyData] = useState<CompanyData>({
//     company_logo: null,
//     start_date: getTodayISODate(),
//     company_name: ''
//   });

//   const validatePassword = (password: string) => {
//     const capitalRegex = /[A-Z]/;
//     const numberRegex = /[0-9]/;
//     const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

//     if (!capitalRegex.test(password)) {
//       return "Password must contain at least one capital letter.";
//     }
//     if (!numberRegex.test(password)) {
//       return "Password must contain at least one number.";
//     }
//     if (!specialCharRegex.test(password)) {
//       return "Password must contain at least one special character.";
//     }
//     if (password.length < 8) {
//       return "Password must be at least 8 characters long.";
//     }
//     return "";
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       formData.append('usr', email);
//       formData.append('pwd', password);

//       const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Accept': 'application/json',
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result: LoginResponse = await response.json();

//       if (result.message && result.message.success_key === 1) {
//         const sessionData = {
//           company: result.message.company || '',
//           username: result.message.username || '',
//           email: result.message.email || email,
//           full_name: result.message.full_name || '',
//           sid: result.message.sid || '',
//           api_key: result.message.api_key || '',
//           api_secret: result.message.api_secret || ''
//         };

//         setUserSession(sessionData);
//         onLogin();
//       } else {
//         const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
//         setError(errorMessage);
//       }
//     } catch (error) {
//       if (error instanceof TypeError && error.message.includes('fetch')) {
//         setError('Unable to connect to the server. Please check your internet connection and try again.');
//       } else if (error instanceof Error) {
//         setError(`Connection error: ${error.message}`);
//       } else {
//         setError('An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleRegister = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setError('');

//   //   // Validate passwords match
//   //   if (registerData.new_password !== confirmPassword) {
//   //     setError('Passwords do not match');
//   //     setLoading(false);
//   //     return;
//   //   }

//   //   // Validate required fields
//   //   if (!registerData.email || !registerData.first_name || !registerData.new_password) {
//   //     setError('Please fill in all required fields');
//   //     setLoading(false);
//   //     return;
//   //   }

//   //   // Validate company fields
//   //   if (!companyData.company_name || !companyData.company_logo) {
//   //     setError('Please provide both company name and company logo.');
//   //     setLoading(false);
//   //     return;
//   //   }

//   //   try {
//   //     // 1. Register user
//   //     const userResponse = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//   //       },
//   //       body: JSON.stringify(registerData)
//   //     });

//   //     if (!userResponse.ok) {
//   //       const errorText = await userResponse.text();
//   //       throw new Error(`HTTP ${userResponse.status}: ${errorText || userResponse.statusText}`);
//   //     }

//   //     // 2. Register company
//   //     const formData = new FormData();
//   //     formData.append('company_logo', companyData.company_logo!);
//   //     formData.append('start_date', companyData.start_date);
//   //     formData.append('company_name', companyData.company_name);

//   //     const companyResponse = await fetch('http://103.214.132.20:8002/api/v2/document/Company/', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//   //       },
//   //       body: formData
//   //     });

//   //     if (!companyResponse.ok) {
//   //       const errorText = await companyResponse.text();
//   //       throw new Error(`Company registration failed: ${errorText || companyResponse.statusText}`);
//   //     }

//   //     // Reset form and switch to login mode
//   //     setRegisterData({
//   //       email: '',
//   //       first_name: '',
//   //       company: '',
//   //       role_profile_name: 'Only If Create',
//   //       new_password: ''
//   //     });
//   //     setCompanyData({
//   //       company_logo: null,
//   //       start_date: new Date().toLocaleDateString('en-GB'),
//   //       company_name: ''
//   //     });
//   //     setConfirmPassword('');
//   //     setEmail(registerData.email); // Pre-fill login email
//   //     setIsRegisterMode(false);
//   //     setError('');

//   //     alert('Registration successful! Please log in with your credentials.');

//   //   } catch (error) {
//   //     if (error instanceof TypeError && error.message.includes('fetch')) {
//   //       setError('Unable to connect to the server. Please check your internet connection and try again.');
//   //     } else if (error instanceof Error) {
//   //       setError(`Registration failed: ${error.message}`);
//   //     } else {
//   //       setError('An unexpected error occurred during registration. Please try again.');
//   //     }
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Validate passwords match
//     if (registerData.new_password !== confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     // Validate required fields
//     if (!registerData.email || !registerData.first_name || !registerData.new_password) {
//       setError('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }

//     // Validate company fields
//     if (!companyData.company_name || !companyData.company_logo) {
//       setError('Please provide both company name and company logo.');
//       setLoading(false);
//       return;
//     }

//     try {
//       // **Set company in registerData**
//       const userRegisterData = {
//         ...registerData,
//         company: companyData.company_name, // <-- set company here
//       };

//       // 1. Register user
//       const userResponse = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify(userRegisterData)
//       });

//       if (!userResponse.ok) {
//         const errorText = await userResponse.text();
//         throw new Error(`HTTP ${userResponse.status}: ${errorText || userResponse.statusText}`);
//       }

//       // 2. Register company
//       const formData = new FormData();
//       formData.append('company_logo', companyData.company_logo!);
//       formData.append('start_date', companyData.start_date);
//       formData.append('company_name', companyData.company_name);

//       const companyResponse = await fetch('http://103.214.132.20:8002/api/v2/document/Company/', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: formData
//       });

//       if (!companyResponse.ok) {
//         const errorText = await companyResponse.text();
//         throw new Error(`Company registration failed: ${errorText || companyResponse.statusText}`);
//       }

//       // Reset form and switch to login mode
//       setRegisterData({
//         email: '',
//         first_name: '',
//         company: '',
//         role_profile_name: 'Only If Create',
//         new_password: ''
//       });
//       // setCompanyData({
//       //   company_logo: null,
//       //   // start_date: new Date().toLocaleDateString('en-GB'), // <-- THIS IS WRONG
//       //   start_date: getTodayISODate(),
//       //   company_name: ''
//       // });
//       setCompanyData({
//         company_logo: null,
//         start_date: getTodayISODate(), // ✅ Correct!
//         company_name: ''
//       });
//       setConfirmPassword('');
//       setEmail(registerData.email); // Pre-fill login email
//       setIsRegisterMode(false);
//       setError('');

//       alert('Registration successful! Please log in with your credentials.');

//     } catch (error) {
//       if (error instanceof TypeError && error.message.includes('fetch')) {
//         setError('Unable to connect to the server. Please check your internet connection and try again.');
//       } else if (error instanceof Error) {
//         setError(`Registration failed: ${error.message}`);
//       } else {
//         setError('An unexpected error occurred during registration. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegisterInputChange = (field: string, value: string) => {
//     setRegisterData((prev) => ({ ...prev, [field]: value }));

//     if (field === 'new_password') {
//       const error = validatePassword(value);
//       setPasswordError(error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="max-w-md w-full">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center space-x-2 mb-6">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">P</span>
//             </div>
//             <span className="text-2xl font-bold">
//               <span className="text-blue-600">PS</span>
//               <span className="text-green-500">Digitise</span>
//             </span>
//           </div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             {isRegisterMode ? 'Create Account' : 'Login to PSDigitise'}
//           </h1>
//         </div>

//         {/* Form Container */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
//           {isRegisterMode ? (
//             /* Register Form */
//             <form onSubmit={handleRegister} className="space-y-6">
//               {/* Error Message */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <p className="text-red-800 text-sm">{error}</p>
//                 </div>
//               )}

//               {/* Email Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     value={registerData.email}
//                     onChange={(e) => handleRegisterInputChange('email', e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                     placeholder="your@email.com"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               {/* First Name Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   First Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     value={registerData.first_name}
//                     onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="John"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               {/* Company Name Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     value={companyData.company_name}
//                     onChange={(e) => setCompanyData((prev) => ({ ...prev, company_name: e.target.value }))}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Your Company"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               {/* Company Logo Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Company Logo <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0] || null;
//                     setCompanyData((prev) => ({ ...prev, company_logo: file }));
//                   }}
//                   className="w-full"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerData.new_password}
//                     onChange={(e) => handleRegisterInputChange('new_password', e.target.value)}
//                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="••••••"
//                     required
//                     disabled={loading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     disabled={loading}
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {passwordError && (
//                   <p className="mt-1 text-sm text-red-600">{passwordError}</p>
//                 )}
//               </div>

//               {/* Confirm Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="••••••"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || !!passwordError}
//                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                     Creating Account...
//                   </>
//                 ) : (
//                   'Create Account'
//                 )}
//               </button>

//               {/* Switch to Login */}
//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsRegisterMode(false);
//                     setError('');
//                   }}
//                   className="text-sm text-gray-500 hover:text-gray-700"
//                   disabled={loading}
//                 >
//                   Already have an account? Sign in
//                 </button>
//               </div>
//             </form>
//           ) : (
//             /* Login Form */
//             <form onSubmit={handleLogin} className="space-y-6">
//               {/* Error Message */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <p className="text-red-800 text-sm">{error}</p>
//                 </div>
//               )}

//               {/* Email Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                     placeholder="hari@psd.com"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="••••••"
//                     required
//                     disabled={loading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     disabled={loading}
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Forgot Password */}
//               <div className="text-right">
//                 <button
//                   type="button"
//                   className="text-sm text-gray-500 hover:text-gray-700"
//                   disabled={loading}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                     Signing in...
//                   </>
//                 ) : (
//                   'Login'
//                 )}
//               </button>

//               {/* Divider */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-gray-500">or</span>
//                 </div>
//               </div>

//               {/* Register Button */}
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIsRegisterMode(true);
//                   setError('');
//                 }}
//                 className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
//                 disabled={loading}
//               >
//                 Create New Account
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
import { setUserSession } from '../utils/session';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginResponse {
  message: {
    success_key: number;
    message: string;
    sid?: string;
    api_key?: string | null;
    api_secret?: string | null;
    username?: string;
    email?: string;
    company?: string | null;
    warning?: string;
    full_name?: string;
  };
}

interface RegisterData {
  email: string;
  first_name: string;
  company: string;
  role_profile_name: string;
  new_password: string;
}

interface CompanyData {
  company_logo: File | null;
  start_date: string;
  company_name: string;
}

function getTodayISODate() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // "2025-07-22"
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState("");

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    first_name: '',
    company: '',
    role_profile_name: 'Only If Create',
    new_password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Company form state
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_logo: null,
    start_date: getTodayISODate(),
    company_name: ''
  });

  const validatePassword = (password: string) => {
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!capitalRegex.test(password)) {
      return "Password must contain at least one capital letter.";
    }
    if (!numberRegex.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('usr', email);
      formData.append('pwd', password);

      const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: LoginResponse = await response.json();

      if (result.message && result.message.success_key === 1) {
        const sessionData = {
          company: result.message.company || '',
          username: result.message.username || '',
          email: result.message.email || email,
          full_name: result.message.full_name || '',
          sid: result.message.sid || '',
          api_key: result.message.api_key || '',
          api_secret: result.message.api_secret || ''
        };

        setUserSession(sessionData);
        onLogin();
      } else {
        const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        setError(`Connection error: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   // Validate passwords match
  //   if (registerData.new_password !== confirmPassword) {
  //     setError('Passwords do not match');
  //     setLoading(false);
  //     return;
  //   }

  //   // Validate required fields
  //   if (!registerData.email || !registerData.first_name || !registerData.new_password) {
  //     setError('Please fill in all required fields');
  //     setLoading(false);
  //     return;
  //   }

  //   // Validate company fields
  //   if (!companyData.company_name || !companyData.company_logo) {
  //     setError('Please provide both company name and company logo.');
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     // Set company in registerData
  //     const userRegisterData = {
  //       ...registerData,
  //       company: companyData.company_name,
  //     };

  //     // 1. Register user
  //     const userResponse = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       },
  //       body: JSON.stringify(userRegisterData)
  //     });

  //     if (!userResponse.ok) {
  //       const errorText = await userResponse.text();
  //       throw new Error(`HTTP ${userResponse.status}: ${errorText || userResponse.statusText}`);
  //     }

  //     // 2. Register company
  //     const formData = new FormData();
  //     formData.append('company_logo', companyData.company_logo!);

  //     // Ensure start_date is always in YYYY-MM-DD
  //     let isoStartDate = companyData.start_date;
  //     if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStartDate)) {
  //       // Try to convert if not in ISO format
  //       const d = new Date(isoStartDate);
  //       if (!isNaN(d.getTime())) {
  //         isoStartDate = d.toISOString().slice(0, 10);
  //       } else {
  //         isoStartDate = getTodayISODate();
  //       }
  //     }
  //     formData.append('start_date', isoStartDate);
  //     formData.append('company_name', companyData.company_name);

  //     const companyResponse = await fetch('http://103.214.132.20:8002/api/v2/document/Company/', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       },
  //       body: formData
  //     });

  //     if (!companyResponse.ok) {
  //       const errorText = await companyResponse.text();
  //       throw new Error(`Company registration failed: ${errorText || companyResponse.statusText}`);
  //     }

  //     // Reset form and switch to login mode
  //     setRegisterData({
  //       email: '',
  //       first_name: '',
  //       company: '',
  //       role_profile_name: 'Only If Create',
  //       new_password: ''
  //     });

  //     setCompanyData({
  //       company_logo: null,
  //       start_date: getTodayISODate(),
  //       company_name: ''
  //     });
  //     setConfirmPassword('');
  //     setEmail(registerData.email); // Pre-fill login email
  //     setIsRegisterMode(false);
  //     setError('');

  //     alert('Registration successful! Please log in with your credentials.');

  //   } catch (error) {
  //     if (error instanceof TypeError && error.message.includes('fetch')) {
  //       setError('Unable to connect to the server. Please check your internet connection and try again.');
  //     } else if (error instanceof Error) {
  //       setError(`Registration failed: ${error.message}`);
  //     } else {
  //       setError('An unexpected error occurred during registration. Please try again.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (registerData.new_password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!registerData.email || !registerData.first_name || !registerData.new_password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate company fields
    if (!companyData.company_name || !companyData.company_logo) {
      setError('Please provide both company name and company logo.');
      setLoading(false);
      return;
    }

    try {
      // 1. Register company first
      const formData = new FormData();
      formData.append('company_logo', companyData.company_logo!);

      // Ensure start_date is always in YYYY-MM-DD
      let isoStartDate = companyData.start_date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStartDate)) {
        const d = new Date(isoStartDate);
        if (!isNaN(d.getTime())) {
          isoStartDate = d.toISOString().slice(0, 10);
        } else {
          isoStartDate = getTodayISODate();
        }
      }
      formData.append('start_date', isoStartDate);
      formData.append('company_name', companyData.company_name);

      const companyResponse = await fetch('http://103.214.132.20:8002/api/v2/document/Company/', {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: formData
      });

      if (!companyResponse.ok) {
        const errorText = await companyResponse.text();
        throw new Error(`Company registration failed: ${errorText || companyResponse.statusText}`);
      }

      // Optionally, get the company name or ID from the response if needed
      // const companyResult = await companyResponse.json();
      // const companyName = companyResult.data?.company_name || companyData.company_name;

      // 2. Register user (after company is created)
      const userRegisterData = {
        ...registerData,
        company: companyData.company_name, // or companyName if you get it from response
      };

      const userResponse = await fetch('http://103.214.132.20:8002/api/v2/document/User/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(userRegisterData)
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`HTTP ${userResponse.status}: ${errorText || userResponse.statusText}`);
      }

      // Reset form and switch to login mode
      setRegisterData({
        email: '',
        first_name: '',
        company: '',
        role_profile_name: 'Only If Create',
        new_password: ''
      });

      setCompanyData({
        company_logo: null,
        start_date: getTodayISODate(),
        company_name: ''
      });
      setConfirmPassword('');
      setEmail(registerData.email); // Pre-fill login email
      setIsRegisterMode(false);
      setError('');

      alert('Registration successful! Please log in with your credentials.');

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        setError(`Registration failed: ${error.message}`);
      } else {
        setError('An unexpected error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));

    if (field === 'new_password') {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-blue-600">PS</span>
              <span className="text-green-500">Digitise</span>
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isRegisterMode ? 'Create Account' : 'Login to PSDigitise'}
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {isRegisterMode ? (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* First Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Company Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData((prev) => ({ ...prev, company_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Company"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Company Logo Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCompanyData((prev) => ({ ...prev, company_logo: file }));
                  }}
                  className="w-full"
                  required
                  disabled={loading}
                />
              </div>

              {/* Start Date Field */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={companyData.start_date}
                  onChange={e => setCompanyData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div> */}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.new_password}
                    onChange={(e) => handleRegisterInputChange('new_password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordError}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder=""
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                Create New Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}