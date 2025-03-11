"use client";

import React, { useState, useEffect, MutableRefObject, useCallback } from "react";
import { Tour, Modal, Button } from "antd";
import type { TourProps } from "antd";
import FileUploadContent from "@/components/files/upload-files/file-upload";
import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import { useUserContext } from "@/contexts/user-context";
import { updateUserTourPreference } from "@/utils/user-utils";

interface TourComponentProps {
    startTour: boolean,
    reportsRef: MutableRefObject<null>;
    regulatoryFrameworksRef: MutableRefObject<null>;
    filesRef: MutableRefObject<null>;
    newReportButtonRef: MutableRefObject<null>,
}

const TourComponent: React.FC<TourComponentProps> = ({ startTour, reportsRef, regulatoryFrameworksRef, filesRef }) => {
    const [open, setOpen] = useState(startTour);
    const [currentStep, setCurrentStep] = useState(0)
    const [showTourEndModal, setShowTourEndModal] = useState(false);
    const { user } = useUserContext()
    const { wasmModule } = useWasm()

    const handleDoNotShowAgain = useCallback(async () => {
        if (user && wasmModule) {
            await updateUserTourPreference(wasmModule, user.id, false);
        }
        setShowTourEndModal(false);
    }, [user, wasmModule]);

    const handleContinueLater = () => {
        setShowTourEndModal(false);
    };

    useEffect(() => {
        if (startTour) {
            setOpen(true);
        }
    }, [startTour]);

    const steps: TourProps["steps"] = [
        {
            title: "Reports",
            description: <div>A report is a <strong>gap analysis</strong> of up to thousands of documents against a selected regulatory framework</div>,
            // cover: (
            //     <Image
            //         alt="tour.png"
            //         src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
            //         width={500}
            //         height={300}
            //     />
            // ),
            placement: "right",
            target: () => reportsRef.current,
        },
        {
            title: "Regulatory Frameworks",
            description: "Regulatory frameworks are structured into Sections, Groups, and Requirements, providing a systematic approach to managing compliance in well-defined, manageable segments.",
            placement: "right",
            // cover: (
            //     <Image
            //         alt="tour.png"
            //         src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
            //         width={500}
            //         height={300}
            //     />
            // ),
            target: () => regulatoryFrameworksRef.current,
        },
        {
            title: "Files",
            // cover: (
            //     <Image
            //         alt="tour.png"
            //         src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
            //         width={500}
            //         height={300}
            //     />
            // ),
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
            // cover: (
            //     <Image
            //         alt="tour.png"
            //         src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
            //         width={500}
            //         height={300}
            //     />
            // ),
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
    }, [open, currentStep, handleDoNotShowAgain, steps.length]);

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
