"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button, Steps } from "antd";
import Typography from "@/components/common/typography";
import { useFilesContext } from "@/contexts/files-context";
import TourComponent from "./tour";
import { useRouter } from "next/navigation";

const InitialSteps = () => {
    const { files } = useFilesContext();
    const [startTour, setStartTour] = useState(false)
    const router = useRouter()

    return (
        <div className="flex flex-col items-center text-center p-6">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl flex items-center">Get started</div>
                <Button type="primary" onClick={() => router.push(files.length > 1 ? "/reports" : "/files")}>
                    Go to {files.length > 1 ? "Reports" : "Files"}
                </Button>
            </div>

            {/* Illustration */}
            <Image
                src={require("@/assets/svgs/undraw_start-building_7gui.svg")}
                alt="Signed Out Illustration"
                width={400}
                height={400}
                className="my-6"
            />

            {/* Steps */}
            <Steps direction="vertical" className="mt-6 w-full max-w-md">
                <Steps.Step
                    status={files.length > 1 ? "finish" : "wait"}
                    title="Upload Files"
                    description="Upload the necessary files for analysis."
                />
                <Steps.Step
                    status="wait"
                    title="Navigate to Reports"
                    description="Select your framework, details, and documents for analysis."
                />
            </Steps>
            {/* <TourComponent startTour={startTour}/> */}
        </div>
    );
};

export default InitialSteps;
