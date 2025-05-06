"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCasesApi } from "@/hooks/use-cases-api";
import { useState } from "react";

import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

export function CreateCaseButton() {
  const queryClient = useQueryClient();
  const api = useCasesApi();

  const mutation = useMutation({
    mutationFn: (data: string) => api.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  const [open, setOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");

  const handleClose = () => {
    setOpen(false);
    setCaseTitle("");
  };

  const handleCreateCase = async (title: string) => {
    await mutation.mutateAsync(title);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Case</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Detective Case</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Case Title
          </label>
          <input
            className="p-2 rounded-md outline text-base"
            title="name"
            placeholder="The tile of your case"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            type="text"
          />
        </div>
        <Button
          onClick={() => handleCreateCase(caseTitle)}
          isLoading={mutation.isPending}
        >
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
