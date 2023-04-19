import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

export const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful assistant that summarizes the documentation of Contentful to the users request."
  ),
  HumanMessagePromptTemplate.fromTemplate("{query}"),
]);
