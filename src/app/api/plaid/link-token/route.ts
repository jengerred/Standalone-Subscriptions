// src/app/api/plaid/link-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { User } from '@/models/User';
import { verifyJWT } from '@/lib/auth';

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

const client = new PlaidApi(config);

export async function POST(req: NextRequest) {
  try {
    // Authorization check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // JWT Verification
    const { payload } = await verifyJWT(token);
    if (!payload.userId) {
      return NextResponse.json(
        { 
          error: 'Invalid authentication token',
          code: 'INVALID_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    // User validation
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User account not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Plaid API call
    const response = await client.linkTokenCreate({
      user: { client_user_id: user._id.toString() },
      client_name: 'Subscription Manager',
      products: [Products.PaymentInitiation],
      country_codes: [CountryCode.Us],
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });

    return NextResponse.json({ 
      link_token: response.data.link_token 
    });

  } catch (error) {
    console.error('Plaid Link Token Error:', error);
    
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
        code: 'PLAID_LINK_TOKEN_ERROR'
      },
      { status: 500 }
    );
  }
}
