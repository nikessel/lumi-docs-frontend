'use client';
import React from "react";
import { Anchor, Alert, Affix } from "antd";
import Typography from "@/components/typography";
import Image from "next/image";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

const generateAnchorItems = () => {
    return [
        {
            key: "chapter-introduction",
            href: "#chapter-introduction",
            title: "Introduction",
            children: [
                { key: "chapter-introduction-key-concepts", href: "#chapter-introduction-key-concepts", title: "Key Concepts" },
                { key: "chapter-introduction-regulatory-frameworks", href: "#chapter-introduction-regulatory-frameworks", title: "Regulatory Frameworks" },
                { key: "chapter-introduction-how-it-works", href: "#chapter-introduction-how-it-works", title: "How LumiDocs Works" }
            ]
        },
        {
            key: "chapter-getting-started",
            href: "#chapter-getting-started",
            title: "Getting Started",
            children: [
                { key: "chapter-getting-started-account-setup", href: "#chapter-getting-started-account-setup", title: "Setting Up Your Account" }
            ]
        }
    ];
};

const DocumentationPage: React.FC = () => {
    const { signup } = useAuth()

    return (
        <div className="flex gap-6">
            <Affix offsetTop={70}>
                <div className="bg-gray-50 rounded-lg p-4 h-80">
                    <Anchor items={generateAnchorItems()} />
                </div>
            </Affix>

            <div className="w-full">
                {/* Chapter: Introduction */}
                <div id="chapter-introduction" className="mb-10">
                    <Typography textSize="h3">Introduction</Typography>
                    <Typography color="primary" textSize="default" className="leading-5">
                        LumiDocs is an AI-powered platform that simplifies regulatory compliance for medical device companies by:
                    </Typography>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Automating review of regulatory documents with fine-tuned AI models</li>
                        <li>Empowering all employees to write high-quality and compliant documentation</li>
                        <li>Allowing teams to collaborate by auto-generating tasks and implementation suggestions</li>
                    </ul>
                    <div className="my-4">
                        <Image src="/dashboard.png" alt="Dashboard showing the LumiDocs interface" width={800} height={400} />
                    </div>
                    <Alert
                        message="Create your account here"
                        type="info"
                        showIcon
                        className="w-full cursor-pointer"
                        onClick={() => signup()}
                    />

                    {/* Key Concepts */}
                    <div id="chapter-introduction-key-concepts" className="mt-6">
                        <Typography textSize="h5">Key Concepts</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            LumiDocs is a simple software that will save you countless hours and financial resources on automating your compliance efforts.
                        </Typography>

                        {/* Regulatory Frameworks */}
                        <div id="chapter-introduction-regulatory-frameworks" className="mt-4">
                            <Typography textSize="h6">Regulatory Frameworks</Typography>
                            <ul className="list-disc pl-6">
                                <li>A Regulatory Framework (e.g., MDR or ISO 13485) is a structured collection of requirements manufacturers must or choose to comply with.</li>
                                <li>Frameworks are divided into sections, groups, and requirements, providing a clear overview of compliance.</li>
                                <li>Sign in and navigate to Regulatory Frameworks to see the latest supported standards.</li>
                            </ul>
                            <Alert message="Coming Soon: Easily compare regulatory frameworks to identify gaps in compliance." type="info" showIcon />
                        </div>

                        {/* How LumiDocs Works */}
                        <div id="chapter-introduction-how-it-works" className="mt-4">
                            <Typography textSize="h5">How LumiDocs Works</Typography>
                            <ul className="list-disc pl-6">
                                <li>Upload your documentation as searchable PDFs.</li>
                                <li>Select your regulatory framework, such as ISO 13485 or MDR.</li>
                                <li>Review a detailed compliance report and implement suggested improvements.</li>
                            </ul>
                            <Alert message="Need help getting started? Visit our setup guide for detailed instructions." type="info" showIcon />
                        </div>
                    </div>
                </div>

                {/* Chapter: Getting Started */}
                <div id="chapter-getting-started" className="mb-10">
                    <Typography textSize="h3">Getting Started</Typography>

                    {/* Setting Up Your Account */}
                    <div id="chapter-getting-started-account-setup" className="mt-4">
                        <Typography textSize="h5">Setting Up Your Account</Typography>
                        <ul className="list-disc pl-6">
                            <li>Create an account</li>
                            <li>Verify your email</li>
                            <li>Log in to the dashboard</li>
                        </ul>
                        <Typography color="primary" textSize="default">
                            <a href="/setup-guide" className="text-blue-500 underline">
                                Read more about account setup.
                            </a>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;


// 'use client'
// import React, { ReactElement } from "react";
// import { Layout, Anchor, Table, Alert, Affix } from "antd";
// import type { DocumentationData, ContentItem, Chapter } from "./documentation-types";
// import documentationData from "./documentation.json";
// import Typography from "@/components/typography";
// import Image from "next/image";
// import Dashboard from "@/assets/dashboard.png"


// const { Content, Sider } = Layout;

// const RenderChapter: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
//     return (
//         <div
//             key={`${chapter.id}`}
//             id={`${chapter.id}`}
//             className="w-full"
//         >
//             <Typography textSize="h3">{chapter.title}</Typography>
//             {chapter.content
//                 .map((item, index) => (
//                     <div
//                         key={`${chapter.id}-sub-${index}`}
//                         id={`${chapter.id}-sub-${index}`}
//                         className="w-full my-4 "
//                     >
//                         {item.type === "SubHeader" && <Typography textSize="h5" >{item.text}</Typography>}
//                         {item.type === "SubSubHeader" && <Typography textSize="h6" >{item.text}</Typography>}
//                         {item.type === "Text" && <Typography color={item.color} textSize={item.size} className="leading-5">{item.text}</Typography>}
//                         {item.type === "Callout" && (
//                             <div
//                                 className={`${item.url ? "cursor-pointer" : ""}`}
//                                 onClick={() => {
//                                     if (item.url) {
//                                         window.open(item.url, "_blank", "noopener,noreferrer");
//                                     }
//                                 }}>
//                                 <Alert
//                                     message={item.text}
//                                     type={item.calloutType || "info"}
//                                     showIcon
//                                     className="w-full"

//                                 />
//                             </div>
//                         )}
//                         {item.type === "List" && (
//                             <ul className="list-disc pl-6">
//                                 {item.listItems?.map((listItem, i) => (
//                                     <li key={`${chapter.id}-list-${index}-${i}`} className="mb-2">
//                                         {listItem}
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                         {item.type === "Image" && item.src && (
//                             <div className="my-4">
//                                 <Image
//                                     src={item.src}
//                                     alt={item.alt || "Image"}
//                                     width={800}
//                                     height={400}
//                                     className=""
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 ))}
//         </div>
//     );
// };

// const Page: React.FC = () => {
//     const { title, chapters } = documentationData as DocumentationData;

//     const generateAnchorItems = (chapters: Chapter[]) => {
//         return chapters.map((chapter) => {
//             const children = chapter.content
//                 .filter((item) => item.type === "SubHeader" || item.type === "SubSubHeader")
//                 .map((subItem, index) => ({
//                     key: `${chapter.id}-sub-${index}`,
//                     href: `#${chapter.id}-sub-${index}`,
//                     title: subItem.text,
//                 }));

//             return {
//                 key: chapter.id,
//                 href: `#${chapter.id}`,
//                 title: chapter.title,
//                 children: children.length > 0 ? children : undefined,
//             };
//         });
//     };

//     return (
//         <div className="flex gap-6">
//             <Affix offsetTop={70}>
//                 <div className="bg-gray-50 rounded-lg p-4 h-80">
//                     <Anchor items={generateAnchorItems(chapters)} />
//                 </div>
//             </Affix>
//             <div className="w-full">
//                 {chapters.map((chapter) => (
//                     <div key={chapter.id} id={chapter.id} style={{ marginBottom: "24px" }}>
//                         <RenderChapter chapter={chapter} />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Page;
