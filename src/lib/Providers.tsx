"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { appTheme } from "@/config/theme";

function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [client] = React.useState(new QueryClient());

  return (
    <ConfigProvider theme={appTheme}>
      <QueryClientProvider client={client}>
        <SessionProvider session={session}>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default Providers;
