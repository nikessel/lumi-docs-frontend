'use client'
import React, { ReactElement } from "react";
import { Layout, Anchor, Table, Alert, Affix } from "antd";
import type { DocumentationData, ContentItem, Chapter } from "./documentation-types";
import documentationData from "./documentation.json";
import Typography from "@/components/typography";
import Image from "next/image";
import Dashboard from "@/assets/dashboard.png"


const { Content, Sider } = Layout;

const RenderChapter: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
    return (
        <div
            key={`${chapter.id}`}
            id={`${chapter.id}`}
            className="w-full"
        >
            <Typography textSize="h3">{chapter.title}</Typography>
            {chapter.content
                .map((item, index) => (
                    <div
                        key={`${chapter.id}-sub-${index}`}
                        id={`${chapter.id}-sub-${index}`}
                        className="w-full my-4 "
                    >
                        {item.type === "SubHeader" && <Typography textSize="h5" >{item.text}</Typography>}
                        {item.type === "SubSubHeader" && <Typography textSize="h6" >{item.text}</Typography>}
                        {item.type === "Text" && <Typography color={item.color} textSize={item.size} className="leading-5">{item.text}</Typography>}
                        {item.type === "Callout" && (
                            <div
                                className={`${item.url ? "cursor-pointer" : ""}`}
                                onClick={() => {
                                    if (item.url) {
                                        window.open(item.url, "_blank", "noopener,noreferrer");
                                    }
                                }}>
                                <Alert
                                    message={item.text}
                                    type={item.calloutType || "info"}
                                    showIcon
                                    className="w-full"

                                />
                            </div>
                        )}
                        {item.type === "List" && (
                            <ul className="list-disc pl-6">
                                {item.listItems?.map((listItem, i) => (
                                    <li key={`${chapter.id}-list-${index}-${i}`} className="mb-2">
                                        {listItem}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {item.type === "Image" && item.src && (
                            <div className="my-4">
                                <Image
                                    src={item.src}
                                    alt={item.alt || "Image"}
                                    width={800}
                                    height={400}
                                    className=""
                                />
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
};

const Page: React.FC = () => {
    const { title, chapters } = documentationData as DocumentationData;

    const generateAnchorItems = (chapters: Chapter[]) => {
        return chapters.map((chapter) => {
            const children = chapter.content
                .filter((item) => item.type === "SubHeader" || item.type === "SubSubHeader")
                .map((subItem, index) => ({
                    key: `${chapter.id}-sub-${index}`,
                    href: `#${chapter.id}-sub-${index}`,
                    title: subItem.text,
                }));

            return {
                key: chapter.id,
                href: `#${chapter.id}`,
                title: chapter.title,
                children: children.length > 0 ? children : undefined,
            };
        });
    };

    return (
        <div className="flex gap-6">
            <Affix offsetTop={70}>
                <div className="bg-gray-50 rounded-lg p-4 h-80">
                    <Anchor items={generateAnchorItems(chapters)} />
                </div>
            </Affix>
            <div className="w-full">
                {chapters.map((chapter) => (
                    <div key={chapter.id} id={chapter.id} style={{ marginBottom: "24px" }}>
                        <RenderChapter chapter={chapter} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
