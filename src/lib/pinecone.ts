import { env } from "@/env.mjs";
import type { Metadata } from "@/utils/types";
import { PineconeClient, type ScoredVector } from "@pinecone-database/pinecone";

const initializePinecone = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
  });
  return pinecone;
};

const pinecone = await initializePinecone();
export const pineconeIndex = pinecone.Index(env.PINECONE_INDEX);

export default pinecone;

export const getMatchesFromEmbeddings = async (
  embeddings: number[],
  topK: number
): Promise<ScoredVector[]> => {
  if (!env.PINECONE_INDEX) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }

  const queryRequest = {
    vector: embeddings,
    topK,
    includeMetadata: true,
  };
  try {
    const queryResult = await pineconeIndex.query({
      queryRequest,
    });
    return (
      queryResult.matches?.map((match) => ({
        ...match,
        metadata: match.metadata as Metadata,
      })) || []
    );
  } catch (e) {
    console.log("Error querying embeddings: ", e);
    throw new Error(`Error querying embeddings: ${e as string}`);
  }
};
