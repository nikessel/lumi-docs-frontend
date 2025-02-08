"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { message } from "antd";
import { ConfigProvider } from "antd";
import { createReport, validateReportInput } from "@/utils/report-utils/create-report-utils";
import { useWasm } from "../WasmProvider";
import { useCreateReportStore } from "@/stores/create-report-store";

export default function PaymentChecker() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const { wasmModule } = useWasm()
    const [api, contextHolder] = message.useMessage();
    const newReportCreated = useCreateReportStore((state) => state.newReportCreated)
    const setNewReportCreated = useCreateReportStore((state) => state.setNewReportCreated)

    const creatingReportRef = useRef<boolean>(false);

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
        } else if (newReportCreated.status === "error") {
            api.open({
                key,
                type: "error",
                content: newReportCreated.message || "An error occurred creating the report. ",
                duration: 3,
            });
            setNewReportCreated({ id: "", status: undefined })
        }
    }, [newReportCreated, api, setNewReportCreated])

    useEffect(() => {

        if (!sessionId || !wasmModule || creatingReportRef.current) return;
        creatingReportRef.current = true;

        fetch(`/api/checkout_sessions?session_id=${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
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

                    const { resetState } = useCreateReportStore.getState();

                    resetState()

                    if (createReportInput) {
                        createReport(wasmModule, createReportInput)

                    } else {
                        api.error("An input error ocurred when creating the report")
                    }

                } else {
                    api.error("Payment Failed");
                }
                const url = new URL(window.location.href);
                url.searchParams.delete("session_id");
                window.history.replaceState({}, document.title, url.toString());
            })
            .catch(() => {
                api.error("An error ocurred");
            });
    }, [wasmModule, api, sessionId]);

    return <ConfigProvider>{contextHolder}</ConfigProvider>;
}
