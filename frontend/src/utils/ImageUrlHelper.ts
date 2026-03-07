export const userProfile = (fileName: string | undefined, id: string) => {
  return fileName && fileName !== ""
    ? `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/uploads/profile/${id}/${fileName}`
    : `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/no-profile/no-profile.jpg`;
};

export const getMessageImageUrl = (
  fileName: string,
  userId: string,
  conversationId: string
): string => {
  return `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/message/images/${conversationId}/${userId}/${fileName}`;
};
