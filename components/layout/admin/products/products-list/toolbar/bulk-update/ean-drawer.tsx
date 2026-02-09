import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface EANDrawerProps {
  product_ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EANDrawer = ({ product_ids, open, onOpenChange }: EANDrawerProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6 w-[800px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[800px] mx-auto">
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EANDrawer;
