import { env } from "@/env.mjs";
import { PineconeClient } from "@pinecone-database/pinecone";

const initializePinecone = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: env.NEXT_PUBLIC_PINECONE_API_KEY,
    environment: env.NEXT_PUBLIC_PINECONE_ENVIRONMENT,
  });
  return pinecone;
};

const pinecone = await initializePinecone();
export const pineconeIndex = pinecone.Index(env.NEXT_PUBLIC_PINECONE_INDEX);

export default pinecone;
