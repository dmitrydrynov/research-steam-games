import { ThemeConfig, theme } from "antd";

export const appTheme: ThemeConfig = {
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
};
