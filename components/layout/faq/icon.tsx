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
  const iconColorClassByName: Record<string, string> = {
    Bestellung: "text-slate-900",
    Lieferung: "text-slate-800",
    "Widerruf und Rücksendung": "text-slate-700",
    Kundenkonto: "text-slate-900",
    Zahlung: "text-slate-800",
    Sonderangebote: "text-slate-700",
    Nutzung: "text-slate-900",
    Garantie: "text-slate-800",
    Sonstiges: "text-slate-700",
  };

  const iconProps = {
    className: `h-5 w-5 ${iconColorClassByName[name] ?? "text-slate-900"}`,
    strokeWidth: 1.8,
  };

  switch (name) {
    case "Bestellung":
      return <ShoppingCart {...iconProps} />;
    case "Lieferung":
      return <Truck {...iconProps} />;
    case "Widerruf und Rücksendung":
      return <RotateCcw {...iconProps} />;
    case "Kundenkonto":
      return <User {...iconProps} />;
    case "Zahlung":
      return <Wallet {...iconProps} />;
    case "Sonderangebote":
      return <Tag {...iconProps} />;
    case "Nutzung":
      return <Pointer {...iconProps} />;
    case "Garantie":
      return <ShieldCheck {...iconProps} />;
    case "Sonstiges":
      return <Grid {...iconProps} />;
    default:
      return <Grid {...iconProps} />;
  }
};
