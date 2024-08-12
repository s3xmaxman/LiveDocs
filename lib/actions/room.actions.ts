"use server";
import { nanoid } from "nanoid";
import { title } from "process";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";

/**
 * ドキュメントを作成する非同期関数
 *
 * この関数は、指定されたユーザーIDとメールアドレスを使用して新しいルームを作成します。
 *
 * @param {Object} params - ドキュメント作成に必要なパラメータ
 * @param {string} params.userId - ドキュメントを作成するユーザーのID
 * @param {string} params.email - ドキュメントを作成するユーザーのメールアドレス
 * @returns {Promise<Object>} 作成されたルームの情報
 * @throws {Error} ルーム作成中にエラーが発生した場合
 */
export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      createId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });

    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    console.log(`Error creating document: ${error}`);
  }
};
