export const MEDIA_BASE_URL = "https://super-star-d2c1.daygist365.workers.dev";

export const FEELINGS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😍", label: "Love" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🎉", label: "Celebrating" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "😂", label: "Laughing" },
  { emoji: "🥳", label: "Party" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🤗", label: "Hugged" },
  { emoji: "🥰", label: "Blessed" },
  { emoji: "😅", label: "Silly" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "💔", label: "Heartbroken" },
  { emoji: "😇", label: "Innocent" },
];

export const ORDER_STATUS_FILTERS: {
  value: "all" | "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
