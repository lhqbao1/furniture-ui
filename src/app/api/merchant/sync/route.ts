import { GoogleAuth } from "google-auth-library";
import axios, { AxiosError } from "axios";
import { getProductsFeed } from "@/features/products/api";

async function syncProducts() {
  const auth = new GoogleAuth({
    keyFile: "path/to/service-account.json",
    scopes: ["https://www.googleapis.com/auth/content"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const merchantId = process.env.MERCHANT_ACCOUNT_ID;

  // 🔹 Lấy sản phẩm từ API của bạn
  const products = await getProductsFeed();

  // 🔹 Format dữ liệu theo chuẩn Google Merchant
  const formatted = products.map((p) => ({
    offerId: p.id,
    title: p.name,
    description: p.description,
    link: p.brand
      ? p.brand.name.toLowerCase() === "econelo"
        ? `https://econelo.de/produkt/${p.url_key}`
        : `https://prestige-home.de/de/product/${p.url_key}`
      : `https://prestige-home.de/de/product/${p.url_key}`,
    imageLink: p.static_files[0].url,
    price: {
      value: p.price.toString(),
      currency: "EUR",
    },
    availability: p.stock > 0 ? "in_stock" : "out_of_stock",
    condition: "new",
    // brand: p.brand,
  }));

  const batchRequest = {
    entries: formatted.map((product, index) => ({
      batchId: index + 1,
      merchantId,
      method: "insert",
      product,
    })),
  };

  try {
    const response = await axios.post(
      `https://shoppingcontent.googleapis.com/content/v2.1/products/batch`,
      batchRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      },
    );
    return Response.json({ success: true, data: response.data });
  } catch (error: unknown) {
    const err = error as AxiosError;
    return Response.json(
      { error: err.response?.data || err.message },
      { status: 500 },
    );
  }
}

export async function POST() {
  return await syncProducts();
}

export async function GET() {
  return await syncProducts(); // Cho phép Vercel cron gọi GET
}
