import { env } from "@/env.mjs";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorDBQAChain } from "langchain/chains";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pineconeIndex } from "./pinecone";

export const model = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  temperature: 0,
});

export const embeddingModel = new OpenAIEmbeddings({
  modelName: "text-embedding-ada-002",
  openAIApiKey: env.OPENAI_API_KEY,
  maxConcurrency: 5,
});

export const vectorStore = await PineconeStore.fromExistingIndex(
  embeddingModel,
  {
    pineconeIndex,
  }
);

export const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
  returnSourceDocuments: true,
});
