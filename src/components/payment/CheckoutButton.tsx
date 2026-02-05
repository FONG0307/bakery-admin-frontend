import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  orderId: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ orderId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/create_stripe_checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Stripe checkout session');
      }

      const data = await response.json();
      const sessionUrl = data.session.url;

      if (!sessionUrl) {
        throw new Error('Session URL not found');
      }

      // Redirect user to Stripe Checkout
      window.location.href = sessionUrl;

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Processing...' : 'Checkout'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
};

export default CheckoutButton;
