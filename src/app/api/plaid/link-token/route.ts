import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';


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

export async function POST(req: NextRequest) {
  try {
    const { client_user_id } = await req.json();
    
    // Sandbox configuration
    const isSandbox = process.env.PLAID_ENV === 'sandbox';
    const sandboxUserId = process.env.PLAID_SANDBOX_USER;

    const request = {
      client_name: 'Your App Name',
      user: {
        client_user_id: isSandbox ? sandboxUserId : client_user_id,
        ...(isSandbox && {
          test_username: "user_good",
          test_password: "pass_good"
        })
      },
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
      ...(isSandbox && { access_token: "sandbox-test-token" })
    };

    const response = await plaidClient.linkTokenCreate(request);
    
    return NextResponse.json({ 
      link_token: response.data.link_token
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorDetails = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.stack 
      : undefined;

    return NextResponse.json(
      {
        error: errorMessage,
        ...(errorDetails && { details: errorDetails }),
        code: 'PLAID_TOKEN_EXCHANGE_ERROR'
      },
      { status: 500 }
    );
  }
}
