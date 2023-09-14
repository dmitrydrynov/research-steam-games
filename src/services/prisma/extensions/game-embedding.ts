import { createId } from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

export type MatchGameEmbedding = {
  gameId: string;
  content: string;
  similarity: number;
};

interface CreateEmbeddingInput {
  gameId: string;
  embedding: number[];
  content: string;
}

interface UpdateEmbeddingInput {
  recordEmbeddingId: string;
  embedding: number[];
  content: string;
}

export default Prisma.defineExtension((client) => {
  return client.$extends({
    name: "game-embedding-extenstion",
    model: {
      gameEmbedding: {
        createEmbedding: async ({
          gameId,
          embedding,
          content,
        }: CreateEmbeddingInput) => {
          return await client.$queryRawUnsafe(
            `INSERT INTO "GameEmbedding" ("id", "gameId", "embedding", "content", "updatedAt") VALUES (\'${createId()}\', \'${gameId}\', \'[` +
              embedding.toString() +
              "]\', \'" +
              content +
              "\', NOW()::timestamp);"
          );
        },
        updateEmbedding: async ({
          recordEmbeddingId,
          embedding,
          content,
        }: UpdateEmbeddingInput) => {
          return await client.$queryRawUnsafe(
            'UPDATE "GameEmbedding" SET embedding = \'[' +
              embedding.toString() +
              ']\', "updatedAt" = NOW()::timestamp, "content" = \'' +
              content +
              "\' WHERE id = \'" +
              recordEmbeddingId +
              "\';"
          );
        },
        findByEmbedding: async (searchEmbedding: number[]) => {
          const records: MatchGameEmbedding[] = await client.$queryRawUnsafe(
            "select * from match_gameembedding('[" +
              searchEmbedding.toString() +
              "]', 0.77, 10, 50);"
          );

          return records;
        },
      },
    },
  });
});
