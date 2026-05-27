import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/src/i18n/navigation";

const quickLinks = [
  {
    title: "Affiliate List",
    description: "Browse all affiliates and manage update/delete actions.",
    href: "/admin/affiliate/list",
  },
  {
    title: "Generate Link",
    description: "Generate tracking query strings with optional expiry hours.",
    href: "/admin/affiliate/generate-link",
  },
];

export default function AffiliatePage() {
  return (
    <div className="space-y-8">
      <div className="section-header">Affiliate</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group"
          >
            <Card className="h-full border-secondary/20 transition-colors group-hover:border-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.title}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-secondary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
