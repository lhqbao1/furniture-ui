import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import ProductReviewTab from "./tabs/review"
import QASection from "./tabs/q&a"
import { NewProductItem } from "@/types/products"

interface ProductDetailsTabProps {
  product?: NewProductItem
}

export function ProductDetailsTab({ product }: ProductDetailsTabProps) {
  return (
    <div className="">
      <Tabs defaultValue="review">
        <TabsList className="flex flex-row gap-12">
          <TabsTrigger value="description" className="text-xl text-gray-600 font-bold w-fit">Description</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xl text-gray-600 font-bold">Shipping</TabsTrigger>
          <TabsTrigger value="review" className="text-xl text-gray-600 font-bold">Review</TabsTrigger>
          <TabsTrigger value="q&a" className="text-xl text-gray-600 font-bold">Q&A</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <Card>
            <CardContent className="grid gap-6">
              <div
                dangerouslySetInnerHTML={{
                  __html: product?.description ?? "",
                }}
                className=""
              ></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="review">
          <ProductReviewTab />
        </TabsContent>
        <TabsContent value="q&a">
          <QASection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
