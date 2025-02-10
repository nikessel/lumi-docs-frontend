export const logLumiDocsContext = (message: string, type: "success" | "warning" | "error") => {
    const colors = {
        success: "background: #4CAF50; color: white;", // Green
        warning: "background: #FFC107; color: black;", // Yellow
        error: "background: #F44336; color: white;" // Red
    };

    console.log(
        `%c lumi-docs-context `,
        `font-weight: bold; border-radius: 4px; padding: 2px 4px; ${colors[type]}`,
        message
    );
};
