"use client";

import React, { useState } from "react";
import { useSelf } from "@liveblocks/react/suspense";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";

const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  const user = useSelf();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");

  const shareDocument = async () => {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          <Image
            src="/assets/icons/share.svg"
            alt="Share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">共有</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>プロジェクトを閲覧できるユーザーを管理する</DialogTitle>
          <DialogDescription>
            ドキュメントを閲覧および編集できるユーザーを選択してください
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
