import { brightColors } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

/**
 * ユーザータイプに基づいてアクセス権を取得します。
 *
 * @param userType - ユーザーのタイプ（"creator", "editor", "viewer"など）
 * @returns アクセス権の配列
 * @throws 予期しないユーザータイプの場合、デフォルトのアクセス権を返します。
 */
export const getAccessType = (userType: UserType) => {
  switch (userType) {
    case "creator":
      return ["room:write"];
    case "editor":
      return ["room:write"];
    case "viewer":
      return ["room:read", "room:presence:write"];
    default:
      return ["room:read", "room:presence:write"];
  }
};

/**
 * タイムスタンプを人間が読みやすい形式に変換します。
 *
 * @param timestamp - ISO 8601形式のタイムスタンプ（例: "2023-10-01T12:00:00Z"）
 * @returns 人間が読みやすい時間の経過（例: "2日前", "たった今"）
 * @throws 無効なタイムスタンプの場合、エラーをスローします。
 */
export const dateConverter = (timestamp: string): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case diffInDays > 7:
      return `${Math.floor(diffInDays / 7)}週間前`;
    case diffInDays >= 1 && diffInDays <= 7:
      return `${Math.floor(diffInDays)}日前`;
    case diffInHours >= 1:
      return `${Math.floor(diffInHours)}時間前`;
    case diffInMinutes >= 1:
      return `${Math.floor(diffInMinutes)}分前`;
    default:
      return "たった今";
  }
};

// Function to generate a random color in hex format, excluding specified colors
export function getRandomColor() {
  const avoidColors = ["#000000", "#FFFFFF", "#8B4513"]; // Black, White, Brown in hex format

  let randomColor;
  do {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256); // Random number between 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert RGB to hex format
    randomColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  } while (avoidColors.includes(randomColor));

  return randomColor;
}

export function getUserColor(userId: string) {
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }

  const colorIndex = sum % brightColors.length;
  return brightColors[colorIndex];
}
