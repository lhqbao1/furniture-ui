import { google } from "googleapis"

export async function triggerMerchantFetch() {
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
  const auth = new google.auth.GoogleAuth({
    credentials,
        scopes: ["https://www.googleapis.com/auth/content"],
  })

  const shopping = google.content({
    version: "v2.1",
    auth,
  })

  const accountId = process.env.MERCHANT_USER_ID
  const datafeedId = process.env.DATA_FEED_ID // đúng là datafeedId, không phải dataSourceId

  const res = await shopping.datafeeds.fetchnow({
    merchantId: accountId,
    datafeedId,
  })

  return res.data
}
