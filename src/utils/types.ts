export type BaseChatMessage = {
  role: "assistant" | "user";
  text: string;
};

export type Metadata = {
  url: string;
  text: string;
  chunk: string;
};

export type ConversationEntry = {
  message: string;
  speaker: "assistant" | "user";
  date: Date;
  id?: string;
};

export type request = {
  prompt: string;
};
