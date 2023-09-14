"use client";

import { Button, Row, Tooltip } from "antd";
import { signOut, useSession } from "next-auth/react";
import { BiExit, BiLogOut } from "react-icons/bi";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header>
      <Row justify="end">
        {!!session && (
          <Tooltip title="Sign out">
            <Button
              shape="circle"
              type="text"
              danger
              icon={<BiLogOut size={24} />}
              onClick={() => signOut({ callbackUrl: "/" })}
            />
          </Tooltip>
        )}
      </Row>
    </header>
  );
};
