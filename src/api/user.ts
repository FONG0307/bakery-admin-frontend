export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";
  address?: string;
};