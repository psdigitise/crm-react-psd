import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';

export default function AccountActivationPage() {
    const navigate = useNavigate();

     useEffect(() => {
        const queryString = window.location.search;
        const timer = setTimeout(() => {
            // Add "from=activation" to indicate the redirect origin
            navigate(`/reset-password${queryString}&from=activation`);
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-xl font-medium text-white mb-2">Account Activated!</h1>
                        <p className="text-gray-300 text-sm">
                            Your account has been successfully activated.
                        </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Redirecting you to set your password...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
