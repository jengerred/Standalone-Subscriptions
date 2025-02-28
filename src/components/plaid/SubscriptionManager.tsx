import React, { useState, useEffect } from 'react';

interface Subscription {
  name: string;
  amount: number;
  transactions: { date: string; amount: number }[];
}

interface SubscriptionManagerProps {
    access_token: string;
  }

  
  export function SubscriptionManager({ access_token }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const response = await fetch('/api/plaid/detect-subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }

        const data = await response.json();
        setSubscriptions(data.subscriptions);
      } catch (err) {
        setError('Error fetching subscriptions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [access_token]);

  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Detected Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p>No subscriptions detected.</p>
      ) : (
        <ul>
          {subscriptions.map((sub, index) => (
            <li key={index}>
              <strong>{sub.name}</strong>: ${sub.amount.toFixed(2)} per month
              <ul>
                {sub.transactions.map((t, i) => (
                  <li key={i}>
                    {t.date}: ${Math.abs(t.amount).toFixed(2)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
