"use server";
import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";

/**
 * ユーザーの情報を取得する非同期関数
 *
 * @param {Object} params - 関数の引数
 * @param {string[]} params.userIds - 取得するユーザーのメールアドレスの配列
 * @returns {string} - ユーザー情報の文字列化されたJSON
 * @throws {Error} - ユーザー情報の取得中にエラーが発生した場合
 */
export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));

    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    return parseStringify(sortedUsers);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};
