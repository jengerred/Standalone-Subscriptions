import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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

interface Transaction {
  name: string;
  amount: number;
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token,
      start_date: twoMonthsAgo.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    });

    const transactions = transactionsResponse.data.transactions;

    // Group transactions by description and amount
    const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
      const key = `${transaction.name}-${Math.abs(transaction.amount)}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(transaction);
      return acc;
    }, {});

    // Detect subscriptions based on recurring transactions
    const subscriptions = Object.entries(groupedTransactions)
      .filter(([, transactions]) => transactions.length > 1)
      .map(([key, transactions]) => {
        const [name, amountString] = key.split('-');
        return {
          name,
          amount: parseFloat(amountString),
          transactions: transactions.map(t => ({
            date: t.date,
            amount: t.amount,
          })),
        };
      });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    
    let errorMessage = 'An unexpected error occurred while detecting subscriptions';
    let errorDetails;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        ...(errorDetails && { details: errorDetails }),
        code: 'SUBSCRIPTION_DETECTION_ERROR'
      },
      { status: 500 }
    );
  }
}
