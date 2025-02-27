"use client";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import axios from "axios";

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from JWT
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        
        const { data } = await axios.post("/api/auth/verify", { token });
        if (!data?.userId) throw new Error("Invalid token payload");
        
        setUserId(data.userId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication failed";
        setError(message);
        console.error('Authentication Error:', message);
      } finally {
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  // Get link token when user ID is available
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        if (!userId) return;

        const response = await axios.post("/api/plaid/link-token", {
          client_user_id: userId
        });
        
        setLinkToken(response.data.link_token);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create Plaid connection";
        setError(message);
        console.error('Link Token Error:', message);
      }
    };

    if (userId) fetchLinkToken();
  }, [userId]);

  // Plaid Link configuration
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      try {
        await axios.post("/api/plaid/exchange-token", {
          public_token: publicToken,
          user_id: userId
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save bank connection";
        setError(message);
        console.error('Token Exchange Error:', message);
      }
    },
  });

  if (loading) return <div className="plaid-loading">Loading...</div>;
  if (error) return <div className="plaid-error">{error}</div>;

  return (
    <div className="plaid-container">
      <button 
        onClick={() => open()}
        disabled={!ready || !linkToken}
        className="plaid-button"
      >
        Connect Bank Account
      </button>
    </div>
  );
}
