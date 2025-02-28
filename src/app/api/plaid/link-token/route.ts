import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { AxiosError } from 'axios';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST() {
  try {
    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: 'user-id' },
        client_name: 'Plaid App',
        products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
        language: 'en',
      });
      

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Plaid Error:', error.response?.data || error.message);
    } else {
      console.error('Plaid Error:', error);
    }
    return NextResponse.json(
      { error: 'Link token creation failed' },
      { status: 400 }
    );
  }
}
