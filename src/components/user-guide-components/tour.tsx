"use client";

import React, { useState, useEffect, MutableRefObject } from "react";
import { Tour, Modal, Button } from "antd";
import type { TourProps } from "antd";
import Image from "next/image";
import FileUploadContent from "../upload-files/file-upload";
import { useRouter } from "next/navigation"
import { useUploadManager } from "../upload-files/upload-manager";
import { useWasm } from "../WasmProvider";
import { useUserContext } from "@/contexts/user-context";
import { updateUserTourPreference } from "@/utils/user-utils";

interface TourComponentProps {
    startTour: boolean,
    reportsRef: MutableRefObject<null>;
    regulatoryFrameworksRef: MutableRefObject<null>;
    filesRef: MutableRefObject<null>;
    tasksRef: MutableRefObject<null>,
    newReportButtonRef: MutableRefObject<null>,
}

const TourComponent: React.FC<TourComponentProps> = ({ startTour, reportsRef, regulatoryFrameworksRef, filesRef, tasksRef, newReportButtonRef }) => {
    const [open, setOpen] = useState(startTour);

    const [currentStep, setCurrentStep] = useState(0)
    const uploadManager = useUploadManager()
    const router = useRouter();

    const [showTourEndModal, setShowTourEndModal] = useState(false);
    const { user } = useUserContext()
    const { wasmModule } = useWasm()

    const handleDoNotShowAgain = async () => {
        console.log("DONTSHOWASGIN", user, wasmModule)
        if (user && wasmModule) {
            await updateUserTourPreference(wasmModule, user.id, false);
        }
        setShowTourEndModal(false);
    };

    const handleContinueLater = () => {
        setShowTourEndModal(false);
    };

    useEffect(() => {
        if (startTour) {
            setOpen(true);
        }
    }, [startTour]);

    useEffect(() => {
        if (!uploadManager.isUploading && (uploadManager.uploadedFiles > 0 || uploadManager.failedFiles.length || uploadManager.filesAlreadyExisted)) {
            if (uploadManager.uploadedFiles > 0 || uploadManager.filesAlreadyExisted) {
                setTimeout(() => {
                    setCurrentStep(currentStep + 1)
                    router.push("/reports?uploadSuccess=true");
                }, 100);
            }
        }
    }, [uploadManager, router]);

    const steps: TourProps["steps"] = [
        {
            title: "Reports",
            description: <div>A report is a <strong>gap analysis</strong> of up to thousands of documents against a selected regulatory framework</div>,
            cover: (
                <img
                    alt="tour.png"
                    src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
                />
            ),
            placement: "right",
            target: () => reportsRef.current,
        },
        {
            title: "Regulatory Frameworks",
            description: "Regulatory frameworks are structured into Sections, Groups, and Requirements, providing a systematic approach to managing compliance in well-defined, manageable segments.",
            placement: "right",
            cover: (
                <img
                    alt="tour.png"
                    src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
                />
            ),
            target: () => regulatoryFrameworksRef.current,
        },
        // {
        //     title: "Tasks",
        //     description: "Tasks are automatically generated based on report findings, enabling you to track implementation progress using a structured Kanban board.",
        //     cover: (
        //         <img
        //             alt="tour.png"
        //             src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
        //         />
        //     ),
        //     placement: "right",
        //     target: () => tasksRef.current,
        // },
        {
            title: "Files",
            cover: (
                <img
                    alt="tour.png"
                    src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
                />
            ),
            description: "Files are exported from your QMS or Technical File and uploaded for automated compliance assessment, helping to identify areas for improvement.",
            placement: "right",
            target: () => filesRef.current,
        },
        {
            title: "Get started - upload your first documents",
            description: <div className="pb-4"><FileUploadContent onClose={() => console.log("close")} /></div>,
            target: null,
        },
        {
            title: "You're ready. ",
            cover: (
                <img
                    alt="tour.png"
                    src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
                />
            ),
            description: "Crete your first report by clicking the button and following the instructions",
            target: () => document.querySelector('[data-tour="new-report-button"]') as HTMLElement || null,
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (open && currentStep === steps.length - 1) {
                const tourElements = document.querySelectorAll(".ant-tour");

                let isClickInside = false;
                tourElements.forEach((el) => {
                    if (el.contains(event.target as Node)) {
                        isClickInside = true;
                    }
                });

                if (!isClickInside) {
                    handleDoNotShowAgain();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, currentStep]);

    const handleStepChange = (newStep: number) => {
        setCurrentStep(newStep);
    };



    const handleCloseTour = () => {
        if (currentStep === steps.length - 1) {
            handleDoNotShowAgain();
        } else {
            setOpen(false);
            setShowTourEndModal(true);
        }
    };

    const handleFinish = () => {
        handleDoNotShowAgain()
        setOpen(false)
    }

    return (
        <>
            <Tour open={open} onChange={handleStepChange} current={currentStep} onClose={handleCloseTour} steps={steps} onFinish={handleFinish} />
            <Modal
                title="Exit Tour"
                open={showTourEndModal}
                onCancel={handleContinueLater}
                footer={[
                    <Button key="cancel" onClick={handleContinueLater}>Continue Later</Button>,
                    <Button key="disable" color="danger" variant="outlined" onClick={handleDoNotShowAgain}>Do Not Show Again</Button>,
                ]}
            >
                <p>Would you like to continue the tour later or disable it permanently?</p>
            </Modal>
        </>
    );
    ;
};

export default TourComponent;
