export const canShowCancelButton = (
  createdAt: string | Date,
  limitMinutes = 115,
) => {
  const createdTime =
    typeof createdAt === "string"
      ? new Date(
          createdAt.endsWith("Z") ? createdAt : `${createdAt}Z`,
        ).getTime()
      : createdAt.getTime();

  const now = Date.now();
  const diffMinutes = (now - createdTime) / (1000 * 60);

  return diffMinutes <= limitMinutes;
};
