export type BaseChatMessage = {
  role: "assistant" | "user";
  text: string;
};

export type Metadata = {
  url: string;
  text: string;
  chunk: string;
};
