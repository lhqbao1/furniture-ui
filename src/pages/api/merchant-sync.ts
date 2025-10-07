import { GoogleAuth } from 'google-auth-library';
import axios, { AxiosError } from 'axios';
import { getProductsFeed } from '@/features/products/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = new GoogleAuth({
      keyFile: 'path/to/service-account.json',
      scopes: ['https://www.googleapis.com/auth/content'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const merchantId = process.env.MERCHANT_ACCOUNT_ID;

    const products = await getProductsFeed();

    const formatted = products.map((p) => ({
      offerId: p.id,
      title: p.name,
      description: p.description,
      link: `https://prestige-home.de/product/${p.id}`,
      imageLink: p.static_files[0].url,
      price: {
        value: p.price.toString(),
        currency: 'EUR',
      },
      availability: p.stock > 0 ? 'in_stock' : 'out_of_stock',
      condition: 'new',
    }));

    const batchRequest = {
      entries: formatted.map((product, index) => ({
        batchId: index + 1,
        merchantId,
        method: 'insert',
        product,
      })),
    };

    const response = await axios.post(
      `https://shoppingcontent.googleapis.com/content/v2.1/products/batch`,
      batchRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error: unknown) {
    const err = error as AxiosError;
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
