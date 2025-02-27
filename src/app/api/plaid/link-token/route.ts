import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, Products, CountryCode, PlaidEnvironments } from 'plaid';
import { User } from "@/models/User";

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14'
    }
  },
});

const plaidClient = new PlaidApi(config);

export async function POST(req: NextRequest) {
  try {
    const { client_user_id } = await req.json();
    
    // Sandbox override
    const isSandbox = process.env.PLAID_ENV === 'sandbox';
    const sandboxUserId = isSandbox ? "user_good" : client_user_id;

    const user = await User.findById(isSandbox ? sandboxUserId : client_user_id)
      .select('plaidAccessToken');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const linkTokenRequest = {
      client_name: 'Your App Name',
      user: {
        client_user_id: user._id.toString(),
        ...(isSandbox && { 
          // Sandbox-specific test credentials
          test_username: "user_good",
          test_password: "pass_good"
        })
      },
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
      ...(user.plaidAccessToken && { 
        access_token: user.plaidAccessToken 
      })
    };

    const response = await plaidClient.linkTokenCreate(linkTokenRequest);
    
    return NextResponse.json({ 
      link_token: response.data.link_token
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorDetails = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.stack 
      : undefined;

    console.error('Plaid Link Token Error:', errorMessage, errorDetails);

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
