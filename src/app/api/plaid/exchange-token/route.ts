import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Get valid environment from .env
const plaidEnv = (process.env.PLAID_ENV || 'sandbox') as keyof typeof PlaidEnvironments;

const config = new Configuration({
    basePath: PlaidEnvironments[plaidEnv],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'Plaid-Version': '2020-09-14'
      }
  },
});

const client = new PlaidApi(config);

export async function POST(req: Request) {
    try {
        const { public_token } = await req.json();

        console.log('Received public token:', public_token); // Log the received token

        const response = await client.itemPublicTokenExchange({ public_token });

        console.log('Exchange successful, access token received');

        return NextResponse.json({ 
            access_token: response.data.access_token 
        });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        
        let errorMessage = 'An unexpected error occurred';
        let errorDetails;

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
        }

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
