import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from 'next-intl'

interface BankDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}
const BankDialog = ({ open, onOpenChange }: BankDialogProps) => {
    const t = useTranslations()
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] gap-2">
                <DialogHeader>
                    <DialogTitle className="text-center">{t('bankInfor')}</DialogTitle>
                </DialogHeader>
                <div>DE57100101232316418882</div>
                <div translate="no">Prestige Home GmbH</div>
                <div>SWIFT/BIC QNTODEB2XXX</div>
                <div>Bankname: QUOTO</div>
            </DialogContent>
        </Dialog>
    )
}

export default BankDialog