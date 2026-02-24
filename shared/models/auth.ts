import { UserTypeEnum } from "@shared/domain/enums";

export interface IUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserTypeEnum;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
}

export type User = IUser;
