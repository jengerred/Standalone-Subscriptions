import {  NextResponse } from 'next/server';
import { Configuration, PlaidApi, Products, CountryCode, PlaidEnvironments } from 'plaid';

// Initialize Plaid client
const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'Plaid-Version': '2020-09-14'
      }
    }
  })
);

// app/api/plaid/link-token/route.ts
export async function POST() {
    try {

      
      // Always use sandbox credentials in sandbox mode
      const isSandbox = process.env.PLAID_ENV === 'sandbox';
      const sandboxUserId = "custom_demo_user"; // Hardcode for testing
  
      const request = {
        client_name: 'Subscription Manager',
        user: {
          client_user_id: sandboxUserId, // Always use sandbox ID in sandbox
          ...(isSandbox && {
            test_username: "user_good",
            test_password: "pass_good"
          })
        },
        products: [Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en'
      };
  
      console.log('Plaid Request:', request); // Add logging
      const response = await plaidClient.linkTokenCreate(request);
      return NextResponse.json({ link_token: response.data.link_token });
    } catch (error) {
      console.error('Plaid Error Details:', error);
      return NextResponse.json(
        { error: "Failed to generate link token" },
        { status: 500 }
      );
    }
  }
  