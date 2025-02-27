import { useState, useEffect } from "react";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link"; 

export default function PlaidLink() {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const isSandbox = process.env.NEXT_PUBLIC_PLAID_ENV === 'sandbox';
      
      const fetchToken = async () => {
        try {
          const response = await axios.post("/api/plaid/link-token", {
            client_user_id: isSandbox ? "custom_demo_user" : undefined
          });
          setLinkToken(response.data.link_token);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to initialize Plaid connection";
          setError(message);
        }
      };
  
      fetchToken();
    }, []);
  
    const { open, ready } = usePlaidLink({
      token: linkToken,
      onSuccess: async (publicToken) => {
        try {
          await axios.post("/api/plaid/exchange-token", {
            public_token: publicToken,
            user_id: "custom_demo_user"
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to save bank connection";
          setError(message);
        }
      }
    });
  
    return (
      <div className="plaid-container">
        {error && <div className="error">{error}</div>}
        {linkToken && (
          <button onClick={() => open()} disabled={!ready}>
            Connect Bank Account
          </button>
        )}
      </div>
    );
  }
  