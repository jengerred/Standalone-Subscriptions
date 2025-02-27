import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, Products, CountryCode, PlaidEnvironments } from 'plaid';

// Verify credentials are loaded
console.log('Loaded client ID:', process.env.PLAID_CLIENT_ID);
console.log('Loaded secret:', process.env.PLAID_SECRET?.substring(0, 4) + '*'.repeat(process.env.PLAID_SECRET?.length - 4));

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

export async function POST() {
  try {
    const request = {
      client_name: 'Your App',
      user: {
        client_user_id: 'unique_user_id', // Must be unique per user
      },
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en'
    };

    const response = await plaidClient.linkTokenCreate(request);
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid Error:', error?.response?.data || error.message);
    return NextResponse.json(
      { error: 'Link token creation failed' },
      { status: 400 }
    );
  }
}
