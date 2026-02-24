export type UserClaims = {
  sub: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  profile_image_url?: string | null;
  picture?: string | null;
};
