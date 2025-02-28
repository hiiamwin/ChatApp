import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

function CreateConversationDialog() {
  return (
    <div className="p-4 border-b">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full justify-start">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input placeholder="Enter chat name..." />
            </div>
            <Button className="w-full">Create Chat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateConversationDialog;
