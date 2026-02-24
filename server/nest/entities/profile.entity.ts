import { UserTypeEnum } from "@shared/domain/enums";

export class ProfileEntity {
  id!: string;
  email!: string | null;
  firstName!: string | null;
  lastName!: string | null;
  profileImageUrl!: string | null;
  role?: UserTypeEnum;
  createdAt!: string | null;
  updatedAt!: string | null;
}

