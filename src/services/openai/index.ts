import { OpenAI as OpenAIAPI } from "openai";
import GPT4Tokenizer from "gpt4-tokenizer";
import { stripIndents } from "common-tags";
import { prisma } from "../prisma";

class OpenAI {
  private static instance: OpenAI;
  openai: OpenAIAPI;

  private constructor() {
    this.openai = new OpenAIAPI({ apiKey: process.env.OPENAI_API_KEY });
  }

  static getInstance() {
    if (!OpenAI.instance) {
      OpenAI.instance = new OpenAI();
    }

    return OpenAI.instance;
  }

  async generateEmbedding(document: string) {
    try {
      const tokenizer = new GPT4Tokenizer({ type: "gpt4" });
      let preparedСontent = document.replace(/\n/g, " ");
      const estimatedTokenCount = tokenizer.estimateTokenCount(preparedСontent);

      preparedСontent =
        estimatedTokenCount > 8191
          ? preparedСontent.slice(0, 8191)
          : preparedСontent;

      const moderation = await this.moderationInput(preparedСontent);
      if (moderation) throw Error("There are flagged content");

      const embeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: preparedСontent,
      });

      const [{ embedding }] = embeddingResponse.data;

      return { preparedСontent, embedding, usage: embeddingResponse.usage };
    } catch (error) {
      throw error;
    }
  }

  async moderationInput(input: string) {
    try {
      const moderationResponse = await this.openai.moderations.create({
        input,
      });

      const [results] = moderationResponse.results;

      if (results.flagged) {
        return {
          error: "Flagged content",
          flagged: true,
          categories: results.categories,
        };
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  async searchGames(prompt: string) {
    const tokenizer = new GPT4Tokenizer({ type: "gpt4" });
    let tokenCount = 0;
    let contextText = "";

    const { embedding: queryEmbedding, usage: embeddingUsage } =
      await this.generateEmbedding(prompt);
    const records = await prisma.gameEmbedding.findByEmbedding(queryEmbedding);

    for (let i = 0; i < records.length; i++) {
      const document = records[i];
      const content = document.content;
      const estimatedTokenCount = tokenizer.estimateTokenCount(content);
      tokenCount += estimatedTokenCount;

      if (tokenCount > 16000) {
        break;
      }

      console.log(
        `[Embedding Document #${document.gameId}]. Token count = ${tokenCount} (max: 16000)`
      );

      contextText += `${content.trim()}---\n`;
    }

    if (contextText.length == 0) return { data: [] };

    const completionResponse = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "You are a guru in game development industry. Tell us about the games described: what players like about them and what they don’t like or are missing",
        },
        {
          role: "user",
          content: stripIndents`
					Prompt: ${prompt}.

					"""${contextText}"""
					`,
        },
      ],
      temperature: 0.35,
    });

    const {
      usage: usageCompletion,
      choices: [{ message }],
    } = completionResponse;

    return {
      answer: message?.content,
      usage: {
        embedding: embeddingUsage,
        completion: usageCompletion,
        total:
          embeddingUsage.total_tokens + (usageCompletion?.total_tokens || 0),
      },
      data: records.map((r) => ({
        gameId: r.gameId,
        similarity: r.similarity,
      })),
    };
  }
}

const globalForOpenAI = globalThis as unknown as {
  openAI: OpenAI | undefined;
};

export const openAI = globalForOpenAI.openAI ?? OpenAI.getInstance();

if (process.env.NODE_ENV !== "production") globalForOpenAI.openAI = openAI;
