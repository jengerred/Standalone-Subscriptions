import React, { useState, useEffect } from "react";

interface Transaction {
  date: string;
  amount: number;
}

interface Subscription {
  id: string; // Added ID for unique identification
  name: string;
  amount: number;
  status: "Current" | "Canceled"; // Added status field
  transactions: Transaction[];
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
        const response = await fetch("/api/plaid/detect-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        const data = await response.json();

  // Set subscriptions with fetched data and default status
  setSubscriptions(
    data.subscriptions.map((sub: Omit<Subscription, "status">) => ({
      ...sub,
      status: "Current", // Default all subscriptions to "Current"
    }))
  );
} catch (err) {
  setError("Error fetching subscriptions");
  console.error(err);
} finally {
  setLoading(false);
}
}

    fetchSubscriptions();
  }, [access_token]);

  // Function to calculate the next due date
  const calculateNextDueDate = (transactions: { date: string }[]) => {
    if (transactions.length < 2) return null;

    // Sort transactions by date
    const sortedDates = transactions
      .map((t) => new Date(t.date))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate interval between recurring transactions
    const interval =
      (sortedDates[1].getTime() - sortedDates[0].getTime()) / (1000 * 60 * 60 * 24);

    // Determine the next due date
    let lastDate = sortedDates[sortedDates.length - 1];
    const currentDate = new Date();

    while (lastDate < currentDate) {
      lastDate = new Date(lastDate.getTime() + interval * (1000 * 60 * 60 * 24));
    }

    return lastDate.toISOString().split("T")[0]; // Return as YYYY-MM-DD
  };

  // Handle cancel subscription
  const handleCancel = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: "Canceled" } : sub
      )
    );
  };

  // Handle reactivate subscription
  const handleReactivate = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: "Current" } : sub
      )
    );
  };

  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <span>🔎</span> Detected Subscriptions
      </h2>

      {/* Detected Subscriptions */}
      {subscriptions.length === 0 ? (
        <p>No subscriptions detected.</p>
      ) : (
        <ul className="space-y-6">
          {subscriptions.map((sub, index) => {
            const nextDueDate = calculateNextDueDate(sub.transactions); // Calculate due date

            // Find the most recent payment date
            const lastPaymentDate =
              sub.transactions.length > 0
                ? sub.transactions[sub.transactions.length - 1].date
                : null;

            return (
              <li
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                {/* Subscription Details */}
                <div>
                  {/* Subscription Name */}
                  <p className="font-bold text-left text-gray-800 text-lg">{sub.name}</p>

                  {/* Last Payment */}
                  {lastPaymentDate && (
                    <p className="text-sm text-green-600 mt-2 text-left">
                      Last Payment:{" "}
                      {new Date(lastPaymentDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {/* Due Date */}
                  {nextDueDate && (
                    <>
                      <p className="text-sm font-bold text-red-500 mt-2">
                        Due Date:{" "}
                        {new Date(nextDueDate).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                        ⏰ Time Left:{" "}
                        {Math.ceil(
                          (new Date(nextDueDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </>
                  )}

                  {/* Status-Based Button */}
                  {sub.status === "Current" ? (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      className="mt-3 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(sub.id)}
                      className="mt-3 px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Reactivate Subscription
                    </button>
                  )}
                </div>

                {/* Amount */}
                <span className={`text-xl font-semibold ${sub.status === 'Current' ? 'text-green-600' : 'text-gray-400'}`}>
                  ${sub.amount.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
