"use client";

import { useMutation } from "@tanstack/react-query";
import styles from "./page.module.scss";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { useState } from "react";
import { BiSolidMessageDetail } from "react-icons/bi";
import ReactMarkdown from "react-markdown";
import { Game } from "@prisma/client";
import Image from "next/image";
import { removeTags } from "@/helpers/text";
import dayjs from "dayjs";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

export const ChatContent = () => {
  const [query, setQuery] = useState("");
  const [gameList, setGameList] = useState<(Game & { similarity: number })[]>(
    []
  );
  const {
    data,
    mutateAsync: search,
    isLoading,
    isSuccess,
  } = useMutation(
    (data: { query: string }) => axios.post("/api/search", data),
    {
      onSuccess: async ({ data }) => {
        if (!data.data.data) {
          message.warning("Write your query");
          return;
        }

        for (const game of data.data.data) {
          const gameData = await fetchGameData({ gameId: game.gameId });

          setGameList((prev) => [
            ...prev,
            { ...gameData.data, similarity: game.similarity },
          ]);
        }
      },
    }
  );

  const { mutateAsync: fetchGameData } = useMutation(
    (data: { gameId: string }) => axios.get<Game>(`/api/game/${data.gameId}`)
  );

  const handleSearch = async () => {
    setGameList([]);
    await search({ query });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Row justify={"center"}>
        <Title>AI Games Research</Title>
      </Row>
      <TextArea
        rows={4}
        placeholder="Prompt here..."
        maxLength={1500}
        showCount
        autoSize={{ minRows: 1, maxRows: 5 }}
        size="large"
        onChange={(e) => setQuery(e.target.value)}
        readOnly={isLoading && !isSuccess}
      />
      <Button
        type="primary"
        size="large"
        onClick={handleSearch}
        loading={isLoading && !isSuccess}
      >
        Search
      </Button>
      {!!data?.data.data.answer && (
        <Alert
          message="Recommendations"
          description={
            <ReactMarkdown linkTarget="_blank">
              {data.data.data.answer}
            </ReactMarkdown>
          }
          type="info"
          showIcon
          icon={<BiSolidMessageDetail />}
        />
      )}

      <Row gutter={[16, 16]}>
        {gameList
          .filter((game) => game.data !== null)
          .map((game) => (
            <Col
              key={game.id}
              xs={{ span: 24 }}
              md={{ span: 12 }}
              lg={{ span: 8 }}
              xxl={{ span: 6 }}
            >
              <Card
                bordered={false}
                hoverable
                actions={[
                  <Link
                    key="steam-link"
                    href={`https://store.steampowered.com/app/${game.referenceId}`}
                    target="_blank"
                  >
                    Go to Steam
                  </Link>,
                  !!(game.data as any)?.metacritic && (
                    <Link
                      key="steam-link"
                      href={(game.data as any)?.metacritic}
                      target="_blank"
                    >
                      Metacritic
                    </Link>
                  ),
                ]}
                cover={
                  <div className={styles.cover}>
                    <Image
                      alt={game.title + " cover"}
                      src={(game.data as any)?.header_image}
                      // width={230}
                      // height={107}
                      // style={{ borderRadius: 0 }}
                      fill
                    />
                  </div>
                }
              >
                <Card.Meta
                  title={
                    <Row justify={"space-between"} align="middle">
                      <Text
                        strong
                        style={{ fontSize: 16, whiteSpace: "pre-wrap" }}
                      >
                        {game.title}
                      </Text>
                      <Text style={{ fontSize: 12 }} color={""}>
                        Match {Math.round(game.similarity * 100)}%
                      </Text>
                    </Row>
                  }
                  description={
                    <Space direction="vertical">
                      {!!game.description && (
                        <Paragraph
                          ellipsis={{ rows: 4 }}
                          style={{ fontSize: 14 }}
                        >
                          {removeTags(game.description)}
                        </Paragraph>
                      )}
                      {!!(game.data as any)?.developers && (
                        <Text>
                          <Text strong>Developers: </Text>
                          {(game.data as any)?.developers.join(", ")}
                        </Text>
                      )}
                      {!!(game.data as any)?.platforms && (
                        <Text>
                          <Text strong>Platforms: </Text>
                          {Object.keys((game.data as any)?.platforms).join(
                            ", "
                          )}
                        </Text>
                      )}
                      <Text>
                        <Text strong>Release: </Text>
                        {(game.data as any)?.release_date.date}
                      </Text>
                      {!!(game.lastNews as any)[0]?.date && (
                        <Text>
                          <Text strong>Updated: </Text>
                          {dayjs((game.lastNews as any)[0]?.date * 1000).format(
                            "D MMM, YYYY"
                          )}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
      </Row>
    </Space>
  );
};
