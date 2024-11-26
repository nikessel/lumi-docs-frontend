import type { ThemeConfig } from 'antd';
const colors = require('./src/styles/colors');

export const selectedTheme = "defaultTheme"

export const antdconfig: ThemeConfig = {
    token: {
        colorPrimary: colors[selectedTheme].primary,
        colorBgLayout: colors[selectedTheme].bg_content,
        colorTextDescription: colors[selectedTheme].text_secondary,
    },
    components: {
        Layout: {
            siderBg: colors[selectedTheme].bg_primary,
        },
        Button: {
            defaultHoverColor: colors[selectedTheme].fg_primary_dim,
            defaultHoverBorderColor: "none",
            colorLink: colors[selectedTheme].primary,
            colorLinkHover: colors[selectedTheme].primary
        },
        Menu: {
            itemBg: colors[selectedTheme].bg_primary,
            itemColor: colors[selectedTheme].fg_primary,
            itemSelectedBg: colors[selectedTheme].bg_secondary,
            itemSelectedColor: colors[selectedTheme].fg_primary,
            itemHoverColor: colors[selectedTheme].fg_secondary_dim,
        },
    }
};