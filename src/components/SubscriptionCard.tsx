"use client"

import PlaidLink from "./plaid/PlaidLink";



export default function SubscriptionCard() {
 




  return (
   

      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow mb-6">
         {/* Header */}
       <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-800">
        <span className="mr-2">🔔</span>Subscriptions
        </h2>
        </div>

        {/* Horizontal Divider */}
        <hr className="mb-6" />

        <PlaidLink />
     
         </div>
   
  );
  
}
