import type { ThemeConfig } from 'antd';
const theme = require('./src/styles/theme');

export const selectedTheme = "defaultTheme"

export const antdconfig: ThemeConfig = {
    token: {
        colorPrimary: theme.colors.primary,
        colorBgLayout: theme.colors.bg_content,
        colorTextDescription: theme.colors.text_secondary,
    },
    components: {
        Layout: {
            siderBg: theme.colors.bg_primary,
        },
        Button: {
            defaultHoverColor: theme.colors.fg_primary_dim,
            defaultHoverBorderColor: "none",
            colorLink: theme.colors.primary,
            colorLinkHover: theme.colors.primary,
        },
        Menu: {
            itemBg: theme.colors.bg_primary,
            itemColor: theme.colors.fg_primary,
            itemSelectedBg: theme.colors.bg_secondary,
            itemSelectedColor: theme.colors.fg_primary,
        },
    },
};