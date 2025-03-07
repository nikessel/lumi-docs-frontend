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
                { key: "chapter-getting-started-account-setup", href: "#chapter-getting-started-account-setup", title: "Setting Up Your Account" },
                { key: "chapter-getting-started-first-steps", href: "#chapter-getting-started-first-steps", title: "First Steps" }
            ]
        },
        {
            key: "chapter-features",
            href: "#chapter-features",
            title: "Features",
            children: [
                { key: "chapter-features-dashboard", href: "#chapter-features-dashboard", title: "Dashboard" },
                { key: "chapter-features-reports", href: "#chapter-features-reports", title: "Reports" },
                { key: "chapter-features-files", href: "#chapter-features-files", title: "File Management" },
                { key: "chapter-features-tasks", href: "#chapter-features-tasks", title: "Task Management" }
            ]
        },
        {
            key: "chapter-settings",
            href: "#chapter-settings",
            title: "Settings & Configuration",
            children: [
                { key: "chapter-settings-preferences", href: "#chapter-settings-preferences", title: "User Preferences" },
                { key: "chapter-settings-notifications", href: "#chapter-settings-notifications", title: "Notifications" }
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
                                <li>A Regulatory Framework (e.g., ISO 14155 or ISO 13485) is a structured collection of requirements manufacturers must or choose to comply with.</li>
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
                                <li>Select your regulatory framework, such as ISO 13485 or 14155.</li>
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

                    {/* First Steps */}
                    <div id="chapter-getting-started-first-steps" className="mt-6">
                        <Typography textSize="h5">First Steps</Typography>
                        <ol className="list-decimal pl-6">
                            <li>Upload your documentation files in PDF format</li>
                            <li>Navigate to the Reports section to create your first report</li>
                            <li>Select your regulatory framework and documents for analysis</li>
                            <li>Review the generated compliance report and implement suggested improvements</li>
                        </ol>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for first steps illustration]</Typography>
                        </div>
                    </div>
                </div>

                {/* Chapter: Features */}
                <div id="chapter-features" className="mb-10">
                    <Typography textSize="h3">Features</Typography>

                    {/* Dashboard */}
                    <div id="chapter-features-dashboard" className="mt-4">
                        <Typography textSize="h5">Dashboard</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            The dashboard provides a comprehensive overview of your compliance status, including:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Recent reports and their status</li>
                            <li>Pending tasks and deadlines</li>
                            <li>Compliance metrics and trends</li>
                            <li>Quick access to key features</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for dashboard screenshot]</Typography>
                        </div>
                    </div>

                    {/* Reports */}
                    <div id="chapter-features-reports" className="mt-6">
                        <Typography textSize="h5">Reports</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            Create and manage compliance reports with ease:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Generate detailed compliance assessments</li>
                            <li>Track progress over time</li>
                            <li>Export reports in various formats</li>
                            <li>Collaborate with team members</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for reports interface screenshot]</Typography>
                        </div>
                    </div>

                    {/* File Management */}
                    <div id="chapter-features-files" className="mt-6">
                        <Typography textSize="h5">File Management</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            Efficiently manage your documentation:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Upload and organize PDF documents</li>
                            <li>Search through document content</li>
                            <li>Version control and history</li>
                            <li>Secure storage and access control</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for file management interface screenshot]</Typography>
                        </div>
                    </div>

                    {/* Task Management */}
                    <div id="chapter-features-tasks" className="mt-6">
                        <Typography textSize="h5">Task Management</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            Streamline your compliance workflow:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Automatically generated tasks from reports</li>
                            <li>Task assignment and tracking</li>
                            <li>Priority management</li>
                            <li>Progress monitoring</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for task management interface screenshot]</Typography>
                        </div>
                    </div>
                </div>

                {/* Chapter: Settings & Configuration */}
                <div id="chapter-settings" className="mb-10">
                    <Typography textSize="h3">Settings & Configuration</Typography>

                    {/* User Preferences */}
                    <div id="chapter-settings-preferences" className="mt-4">
                        <Typography textSize="h5">User Preferences</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            Customize your LumiDocs experience:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Theme selection (Light/Dark mode)</li>
                            <li>Acceptance criteria thresholds</li>
                            <li>Custom view settings</li>
                            <li>Language preferences</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for settings interface screenshot]</Typography>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div id="chapter-settings-notifications" className="mt-6">
                        <Typography textSize="h5">Notifications</Typography>
                        <Typography color="primary" textSize="default" className="leading-5">
                            Stay informed about important updates:
                        </Typography>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Email notifications for task assignments</li>
                            <li>Report completion alerts</li>
                            <li>Deadline reminders</li>
                            <li>System updates and announcements</li>
                        </ul>
                        <div className="my-4 bg-red-100 p-4 rounded">
                            <Typography textSize="default">[Placeholder for notifications settings screenshot]</Typography>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
