"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddOrEditBrandForm from "./add-brand-form";

const AddBrandDialog = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <form>
        <DialogTrigger asChild>
          <Button variant="secondary">Add Brand</Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[960px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <AddOrEditBrandForm onClose={handleClose} />
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddBrandDialog;
