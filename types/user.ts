export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  bio: string;
  profileImageUrl: string;
};

export const EMPTY_PROFILE: Pick<UserProfile, "name" | "bio" | "profileImageUrl"> = {
  name: "",
  bio: "",
  profileImageUrl: ""
};
