import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { User } from '@/models/User';

// Get valid environment from .env
const plaidEnv = process.env.PLAID_ENV as keyof typeof PlaidEnvironments;

const config = new Configuration({
    basePath: PlaidEnvironments[plaidEnv],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'Plaid-Version': '2020-09-14' // Required header
      }
  },
});

const client = new PlaidApi(config);

export async function POST(req: Request) {
  const { public_token, user_id } = await req.json();

  try {
    // Exchange public token
    const response = await client.itemPublicTokenExchange({
      public_token,
    });

    // Store access token with user
    await User.findByIdAndUpdate(user_id, {
      plaidAccessToken: response.data.access_token,
    });


    return NextResponse.json({ 
        access_token: response.data.access_token 
      });
  }  catch (error) {
    console.error('Error exchanging public token', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
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