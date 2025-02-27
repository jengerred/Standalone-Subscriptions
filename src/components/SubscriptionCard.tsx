"use client"
import { useState } from "react";
import PlaidLink from "./plaid/PlaidLink";

interface Subscription {
  id: string;
  name: string;
  status: "Current" | "Canceled";
  amount: number;
  dueDate: string;
}

export default function SubscriptionCard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

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

  // Handle adding a new subscription
  const handleAddSubscription = () => {
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      name: "New Subscription",
      status: "Current",
      amount: 19.99,
      dueDate: "2025-03-15",
    };
    setSubscriptions((prev) => [...prev, newSubscription]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold text-gray-800"> 🔔 Subscriptions</h2>
        
        {/* Add New Subscription Button */}
        <button
          onClick={handleAddSubscription}
          className="mt-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-50"
        >
          + Add  
        </button>

        
        {/* Plaid Connection */}
        <PlaidLink />
     

      </div>
      <hr/>
      
      <ul className="space-y-4 mt-4">
        {subscriptions.map((subscription) => (
          <li
            key={subscription.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 last:border-none"
          >
            <div>
              <p className="font-medium text-gray-800">{subscription.name}</p>
              <p
                className={`text-sm ${
                  subscription.status === "Current"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {subscription.status === "Current"
                  ? "Automatic Payment"
                  : "Canceled"}
              </p>
              {subscription.dueDate && (
                <p className="text-sm font-bold text-red-500">
                  Due Date: {subscription.dueDate}
                </p>
              )}

              {/* Action Button */}
              {subscription.status === "Current" ? (
                <button
                  onClick={() => handleCancel(subscription.id)}
                  className="mt-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  onClick={() => handleReactivate(subscription.id)}
                  className="mt-2 px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Reactivate Subscription
                </button>
              )}
            </div>
            <span
              className={`text-lg font-semibold ${
                subscription.status === "Current"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${subscription.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
