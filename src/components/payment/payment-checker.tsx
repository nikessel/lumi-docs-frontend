"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { message } from "antd"; // Import Ant Design notification
import { ConfigProvider } from "antd"; // Context holder for Ant Design
import { createReport, validateReportInput } from "@/utils/report-utils/create-report-utils";
import { useWasm } from "../WasmProvider";
import { useCreateReportStore } from "@/stores/create-report-store";

export default function PaymentChecker() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const { wasmModule } = useWasm()
    const [api, contextHolder] = message.useMessage(); // Ant Design notification context
    const [creatingReport, setCreatingReport] = useState(false)
    const newReportCreated = useCreateReportStore((state) => state.newReportCreated)
    const setNewReportCreated = useCreateReportStore((state) => state.setNewReportCreated)

    const key = "creating-report";

    useEffect(() => {
        if (newReportCreated.id && newReportCreated.status === "pending") {
            api.open({
                key,
                type: "loading",
                content: "Initiating report generation",
                duration: 0,
            });
        } else if (newReportCreated.id && newReportCreated.status === "processing") {
            api.open({
                key,
                type: "success",
                content: "Report is being generated.",
                duration: 3,
            });
            setNewReportCreated({ id: "", status: undefined })
        }
    }, [newReportCreated])

    // useEffect(() => {
    //     if (successfulResponseRecieved && reportsBeingRefetched) {
    //         api.open({
    //             key,
    //             type: "loading",
    //             content: "Creating report ...",
    //             duration: 0,
    //         });
    //     }

    //     if (!reportsBeingRefetched && successfulResponseRecieved) {
    //         //change to success message
    //         api.open({
    //             key,
    //             type: "success",
    //             content: "Report is being generated.",
    //             duration: 3,
    //         });
    //         setSuccessfulResponseRecieved(false)
    //     }
    // }, [reportsBeingRefetched, successfulResponseRecieved])


    useEffect(() => {
        if (!sessionId || !wasmModule || creatingReport) return;
        // Show "Checking payment..." loading notification
        setCreatingReport(true)
        const key = "payment-check";

        // api.open({
        //     key,
        //     message: "Checking payment...",
        //     description: "We are verifying your payment. Please wait.",
        //     duration: 0,
        //     type: "info",
        // });

        // Fetch payment details
        fetch(`/api/checkout_sessions?session_id=${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    // Close loading notification and show an error notification
                    api.error("Payment Check Failed");
                    return;
                }

                const currentTime = Math.floor(Date.now() / 1000);
                const sessionCreationTime = data.created

                // Verify if the session was created within the last 10 minutes
                const isWithinTenMinutes = currentTime - sessionCreationTime <= 600;

                if (data.payment_status === "paid" && isWithinTenMinutes) {

                    const valRep = validateReportInput()

                    const createReportInput = !valRep.error ? valRep.input : undefined

                    const { resetState, selectedSections } = useCreateReportStore.getState();

                    resetState()

                    if (createReportInput) {
                        createReport(wasmModule, createReportInput)
                        // setSuccessfulResponseRecieved(true)
                    } else if (!createReportInput && selectedSections.length > 0) {
                        api.error("An input error ocurred when creating the report")
                    }

                    // api.success({
                    //     key,
                    //     message: "Payment Successful",
                    //     description: "Your payment was successful! We are preparing your report.",
                    // });

                } else {
                    api.error("Payment Failed");
                }
                const url = new URL(window.location.href);
                url.searchParams.delete("session_id");
                window.history.replaceState({}, document.title, url.toString());
            })
            .catch((err) => {
                api.error("An error ocurred");
            });
    }, [wasmModule]);

    // Render nothing, but include context holder for notifications
    return <ConfigProvider>{contextHolder}</ConfigProvider>;
}
