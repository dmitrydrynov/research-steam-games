CREATE extension if not exists vector with schema public;

CREATE OR REPLACE FUNCTION match_gameembedding(embedding vector, match_threshold float, match_count int, min_content_length int)
returns table ("gameId" text, content text, similarity float)
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select
    "GameEmbedding"."gameId",
    "GameEmbedding".content,
    ("GameEmbedding".embedding <#> embedding) * -1 as similarity
  from "GameEmbedding"
  join "Game"
    on "GameEmbedding"."gameId" = "Game".id

  -- We only care about sections that have a useful amount of content
  where length("GameEmbedding".content) >= min_content_length

  -- The dot product is negative because of a Postgres limitation, so we negate it
  and ("GameEmbedding".embedding <#> embedding) * -1 > match_threshold

  -- OpenAI embeddings are normalized to length 1, so
  -- cosine similarity and dot product will produce the same results.
  -- Using dot product which can be computed slightly faster.
  --
  -- For the different syntaxes, see https://github.com/pgvector/pgvector
  order by "GameEmbedding".embedding <#> embedding
  
  limit match_count;
end;
$$;
