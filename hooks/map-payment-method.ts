export const mapTrustedShopsPaymentType = (id: string): string => {
  switch (id) {
    case "paypal":
      return "PAYPAL";

    case "klarna":
      // Klarna Pay Later / Invoice
      return "INVOICE";

    case "card":
      // Credit / Debit Card
      return "CREDIT_CARD";

    case "applepay":
      // Apple Pay vẫn là card
      return "CREDIT_CARD";

    case "googlepay":
      // Google Pay vẫn là card
      return "CREDIT_CARD";

    default:
      return "OTHER";
  }
};
