import type { IconName } from "@/components/icon";

// Icons for endpoint groups in the homepage explorer and console. Groups without one get the box.
const icons: Record<string, IconName> = {
  products: "box",
  posts: "fileText",
  comments: "messageCircle",
  todos: "circleCheck",
  carts: "shoppingCart",
  orders: "package",
  quotes: "quote",
  recipes: "utensils",
  notifications: "bell",
  transactions: "receipt",
  employees: "idCard",
  companies: "building",
  people: "users",
  books: "book",
  movies: "film",
  countries: "globe",
  events: "calendar",
  albums: "folder",
  photos: "image",
  echo: "repeat",
  status: "activity",
  utils: "wrench",
};

export const groupIcon = (id: string): IconName => icons[id] ?? "box";
