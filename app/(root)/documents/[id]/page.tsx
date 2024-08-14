import CollaborativeRoom from "@/components/CollaborativeRoom";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { getDocument } from "@/lib/actions/room.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const ClerkUser = await currentUser();

  if (!ClerkUser) {
    return redirect("/sign-in");
  }

  const room = await getDocument({
    roomId: id,
    userId: ClerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) {
    return redirect("/");
  }

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom roomId={id} roomMetadata={room.metadata} />
    </main>
  );
};

export default Document;
