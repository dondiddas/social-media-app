export const userProfile = (fileName: string | undefined, id: string) => {
  if (fileName && fileName.startsWith("http")) {
    // If fileName is already a full URL (e.g., S3), return as is
    return fileName;
  }
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
