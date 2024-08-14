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
      creatorId: userId,
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
    console.log(`Error happened while creating a room: ${error}`);
  }
};

/**
 * ドキュメントを取得する非同期関数
 *
 * この関数は、指定されたルームIDとユーザーIDを使用してルームの情報を取得します。
 * ユーザーがルームにアクセスできるかどうかを確認し、アクセス権がない場合はエラーをスローします。
 *
 * @param {Object} params - ドキュメント取得に必要なパラメータ
 * @param {string} params.roomId - 取得するルームのID
 * @param {string} params.userId - ルームにアクセスするユーザーのID
 * @returns {Promise<Object>} 取得したルームの情報
 * @throws {Error} アクセス権がない場合、またはルーム取得中にエラーが発生した場合
 */
export const getDocuments = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You don't have access to this room");
    }

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
};
