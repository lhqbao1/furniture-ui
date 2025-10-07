// // file: app/api/merchant/createDatasource/route.ts

// import { NextResponse } from "next/server";
// import { google } from "googleapis";

// const merchantAccountId = process.env.MERCHANT_ID;  // e.g. "1234567890"
// const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
// const privateKey = process.env.GOOGLE_PRIVATE_KEY!;

// export async function POST(req: Request) {
//   try {
//     // Auth JWT
//     const auth = new google.auth.JWT(
//       clientEmail,
//       undefined,
//       privateKey.replace(/\\n/g, "\n"),
//       ["https://www.googleapis.com/auth/content"]  // check if new Merchant API uses same or updated scope
//     );

//     // Data Sources service
//     const merchantDatasources = google.shopping.merchantdatasources_v1({
//       version: "v1",
//       auth,
//     });

//     // Create primary data source
//     const createResponse = await merchantDatasources.accounts.dataSources.create({
//       parent: `accounts/${merchantAccountId}`,
//       requestBody: {
//         displayName: "My Primary Products API Source",
//         primaryProductDataSource: {
//           // optionally set countries, feedLabel, contentLanguage, etc.
//           countries: ["DE"],  // since you only sell in Germany
//           contentLanguage: "de",  // optional
//           feedLabel: "default",   // optional
//         }
//         // input: "API" is implicit for API data sources
//       }
//     });

//     return NextResponse.json({ success: true, data: createResponse.data });
//   } catch (err: any) {
//     console.error("Error creating data source", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
