
'use client'
import { useMediaQuery } from 'react-responsive'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ProductReviewTab from "./tabs/review"
import QASection from "./tabs/q&a"
import { ProductItem } from "@/types/products"
import { useTranslations } from 'next-intl'
import ProductDetailsProperties from './tabs/properties/page'

interface ProductDetailsTabProps {
  product: ProductItem
}

export function ProductDetailsTab({ product }: ProductDetailsTabProps) {
  const isMobile = useMediaQuery({ maxWidth: 640 }) // mobile breakpoint
  const t = useTranslations()

  const sections = [
    { value: "description", label: t('description'), content: <div className='product-descriptions' dangerouslySetInnerHTML={{ __html: product?.description ?? "" }} /> },
    { value: "properties", label: t('properties'), content: <ProductDetailsProperties product={product} /> },
    { value: "details", label: "Aufbau & Details", content: '' },
    { value: "review", label: t('review'), content: <ProductReviewTab productId={product.id} /> },
    {
      value: "q&a", label: "häufig gestellte Frage", content: <QASection productId={product.id} />
    },
  ]



  if (isMobile) {
    // render accordion
    return (
      <Accordion type="single" collapsible className="space-y-2">
        {sections.map((section) => (
          <AccordionItem value={section.value} key={section.value}>
            <AccordionTrigger>{section.label}</AccordionTrigger>
            <AccordionContent>{section.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  // render tabs
  return (
    <Tabs defaultValue="description">
      <TabsList className="flex flex-row lg:gap-12 gap-8 overflow-x-scroll">
        {sections.map((section) => (
          <TabsTrigger key={section.value} value={section.value} className="text-xl text-gray-600 font-bold w-fit">
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.value} value={section.value} className={`${section.value === 'description' ? 'w-full grid grid-cols-5 gap-12' : ''}`}>
          <div className='col-span-3'>{section.content}</div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
