"use client";

import { useState } from "react";
import { MessageSquarePlus, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { useCreateConversation, useCheckExistingConversation } from "../hooks/chat-query";
import { useChatStore } from "../stores/chat-store";
import { toast } from "sonner";

interface MessageRequestDialogProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MessageRequestDialog = ({
  userId,
  userName,
  isOpen,
  onOpenChange,
}: MessageRequestDialogProps) => {
  const { addWindow } = useChatStore();
  const createConversationMutation = useCreateConversation();
  const { data: existingCheck } = useCheckExistingConversation(userId);
  const isExisting = existingCheck?.pages[0]?.exists;

  const handleRequest = async () => {
    try {
      const response = await createConversationMutation.mutateAsync({
        otherUserId: userId,
        type: "general",
      });

      if (response.success) {
        addWindow(response.data);
        onOpenChange(false);
        toast.success(isExisting ? "Conversation opened" : `Message request sent to ${userName}`);
      }
    } catch (error) {
      toast.error("Failed to process message request");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <MessageSquarePlus className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {isExisting ? "Continue Conversation?" : "Send Message Request?"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[15px] leading-relaxed">
            {isExisting 
              ? `You already have a conversation with ${userName}. Would you like to open the chat window?`
              : `You're about to send a message request to ${userName}. Once they approve, you'll be able to chat and share media with each other.`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl h-11 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequest}
            disabled={createConversationMutation.isPending}
            className="flex-1 rounded-xl h-11 font-semibold gap-2"
          >
            {createConversationMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isExisting ? "Open Chat" : "Request Message"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
