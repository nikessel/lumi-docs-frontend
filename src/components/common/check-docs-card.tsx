"use client";

import React from "react";
import { Card, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import docBackground from "@/assets/svgs/doc_background.svg";

const HelpCard: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {

    return (
        <Card
            className="transition-all duration-300 hover:opacity-50"
            style={{
                width: !collapsed ? 180 : 60,
                height: !collapsed ? 140 : 60,
                backgroundImage: `url(${docBackground.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
            }}
            onClick={() => window.open("/documentation", "_blank")}
        >
            {!collapsed ? (
                <>
                    <div className="flex items-center space-x-2 mb-2">
                        <QuestionCircleOutlined style={{ fontSize: 20 }} />
                        <span className="text-sm font-semibold">Need help?</span>
                    </div>
                    <span className="text-xs mt-4">Please check our docs</span>
                    <Button size="small" className="mt-2">
                        Go to Docs
                    </Button>
                </>
            ) : (
                <QuestionCircleOutlined style={{ fontSize: 24, color: "#fff" }} />
            )}
        </Card>
    );
};

export default HelpCard;
