import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyPayment } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setErrorMessage('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        await verifyPayment(reference);
        setStatus('success');
        clearCart(); // Clear the cart only after successful payment
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.detail || 'Payment verification failed.');
      }
    };

    verify();
  }, [reference, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifying Payment...</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Please do not close this window.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
                Your order has been confirmed and the vendor has been notified.
              </p>
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Payment Failed</h2>
              <p className="text-red-500 mt-2 mb-8">{errorMessage}</p>
              <div className="flex space-x-4 w-full">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
