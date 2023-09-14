"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";
import StyledComponentsRegistry from "@/lib/AntdRegistry";

function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [client] = React.useState(new QueryClient());

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 8,
          fontSize: 16,
        },
        components: {
          Input: {
            fontSize: 16,
          },
        },
      }}
    >
      <QueryClientProvider client={client}>
        <SessionProvider session={session}>{children}</SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default Providers;
