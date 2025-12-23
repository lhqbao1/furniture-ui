import {
  ShoppingCart,
  Truck,
  RotateCcw,
  User,
  Wallet,
  Tag,
  Pointer,
  ShieldCheck,
  Grid,
} from "lucide-react";

export const getIcon = (name: string) => {
  switch (name) {
    case "Bestellung":
      return (
        <ShoppingCart
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Lieferung":
      return (
        <Truck
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Widerruf und Rücksendung":
      return (
        <RotateCcw
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Kundenkonto":
      return (
        <User
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Zahlung":
      return (
        <Wallet
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Sonderangebote":
      return (
        <Tag
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Nutzung":
      return (
        <Pointer
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Garantie":
      return (
        <ShieldCheck
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    case "Sonstiges":
      return (
        <Grid
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
    default:
      return (
        <Grid
          className="w-10 h-10 text-primary"
          strokeWidth="1"
        />
      );
  }
};
