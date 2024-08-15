"use server";
import { nanoid } from "nanoid";
import { title } from "process";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";

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
export const getDocument = async ({
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

/**
 * ドキュメントを取得する非同期関数
 *
 * この関数は、指定されたメールアドレスを使用してユーザーが所有するルームのリストを取得します。
 *
 * @param {string} email - ルームを取得するユーザーのメールアドレス
 * @returns {Promise<Object>} 取得したルームのリスト
 * @throws {Error} ルーム取得中にエラーが発生した場合
 */
export const getDocuments = async (email: string) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });
    return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happened while getting rooms: ${error}`);
  }
};

/**
 * ドキュメントを更新する非同期関数
 *
 * この関数は、指定されたルームIDと新しいタイトルを使用してルームのメタデータを更新します。
 *
 * @param {string} roomId - 更新するルームのID
 * @param {string} title - 新しいタイトル
 * @returns {Promise<Object>} 更新されたルームの情報
 * @throws {Error} ルーム更新中にエラーが発生した場合
 */
export const updateDocument = async (roomId: string, title: string) => {
  try {
    const update = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(update);
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
};

/**
 * ドキュメントのアクセス権を更新する非同期関数
 *
 * この関数は、指定されたルームIDとメールアドレスを使用して、
 * ユーザーのアクセス権を更新し、通知を送信します。
 *
 * @param {Object} params - アクセス権更新に必要なパラメータ
 * @param {string} params.roomId - 更新するルームのID
 * @param {string} params.email - アクセス権を更新するユーザーのメールアドレス
 * @param {string} params.userType - ユーザーの新しいアクセス権のタイプ
 * @param {Object} params.updatedBy - アクセス権を更新したユーザーの情報
 * @returns {Promise<Object>} 更新されたルームの情報
 * @throws {Error} アクセス権更新中にエラーが発生した場合
 */
export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    if (room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `あなたは${updatedBy.name}によってドキュメントへの${userType}アクセスが付与されました`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
};

/**
 * コラボレーターを削除する非同期関数
 *
 * この関数は、指定されたルームIDとメールアドレスを使用して、
 * ルームからコラボレーターを削除します。
 * 自分自身を削除しようとした場合はエラーをスローします。
 *
 * @param {Object} params - コラボレーター削除に必要なパラメータ
 * @param {string} params.roomId - コラボレーターを削除するルームのID
 * @param {string} params.email - 削除するコラボレーターのメールアドレス
 * @returns {Promise<Object>} 更新されたルームの情報
 * @throws {Error} コラボレーター削除中にエラーが発生した場合
 */
export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document");
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
};
