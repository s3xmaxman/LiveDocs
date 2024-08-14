import Header from "@/components/Header";
import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import AddDocumentBtn from "@/components/AddDocumentBtn";
import { redirect } from "next/navigation";

const Home = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return redirect("/sign-in");
  }

  const document = [];

  return (
    <main className="home-container">
      <Header className="sticky left-0 ">
        <div className="flex w-fit items-center justify-center gap-2">
          通知
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>
      {document.length > 0 ? (
        <div></div>
      ) : (
        <div className="document-list-empty">
          <Image
            src={"/assets/icons/doc.svg"}
            alt="document"
            width={40}
            height={40}
            className="mx-auto"
          />
          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

export default Home;
