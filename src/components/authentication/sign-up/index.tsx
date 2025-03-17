import React, { useState, useEffect } from "react";
import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import { useStorage } from "@/storage";
import { Card, Form, Input, Button, Typography, Spin, message, Alert } from "antd";
import { UserSignupForm } from "@wasm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

const { Title } = Typography;


const UserSignup: React.FC = () => {
    const { wasmModule, isLoading } = useWasm();
    const [idToken] = useStorage("id_token");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userExists, setUserExists] = useState<boolean | null>(null);
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage()
    const router = useRouter()
    const { triggerReAuth } = useAuth()
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate)

    useEffect(() => {
        const checkToken = async () => {
            if (!idToken) {
                router.push("/logout");
                return;
            }

            if (!wasmModule) {
                return;
            }

            try {
                const adminResponse = await wasmModule.is_admin();
                if (adminResponse.error?.kind === "Unauthorized") {
                    router.push("/logout");
                    return;
                }
                console.log("Admin status:", adminResponse);
            } catch (err) {
                console.error("Error checking admin status:", err);
            }
        };

        checkToken();
    }, [])

    useEffect(() => {
        const initializeComponent = async () => {

            if (!wasmModule || !idToken) {
                setIsCheckingUser(false);
                return;
            }

            try {
                const existsResponse = await wasmModule.user_exists();
                if (existsResponse.output) {
                    setUserExists(existsResponse.output.output);
                }
            } catch (err) {
                messageApi.error("Error checking user existence.");
                console.error("Error checking user existence:", err);
            } finally {
                setIsCheckingUser(false);
            }
        };

        initializeComponent();
    }, [wasmModule, idToken, messageApi]);

    const handleSubmit = async (values: UserSignupForm) => {
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        if (!wasmModule) {
            setError("WASM module not loaded");
            messageApi.error("WASM module not loaded");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await wasmModule.create_user({ input: { ...values, config: {} } });
            console.log("SUBMITTING", response);
            if (response.output || response?.error?.kind === "AlreadyExists") {
                messageApi.success("Profile created successfully!");
                triggerReAuth()
                triggerUpdate("user")
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1000);
            }
        } catch (err) {
            setError("Failed to create user.");
            messageApi.error("Failed to create user. Please try again.");
            console.error("Error creating user:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || isCheckingUser) {
        return (
            <div className="flex items-center justify-center p-4">
                <Spin size="large" />
            </div>
        );
    }

    if (userExists) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <Alert message="User Already Signed Up" type="info" showIcon />
            </Card>
        );
    }

    return (

        <Card className="mt-24 w-full max-w-2xl mx-auto">
            {contextHolder}
            <Title level={3} style={{ textAlign: "center" }}>
                Please complete your profile
            </Title>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                {success && <Alert message="Profile created successfully!" type="success" showIcon className="mb-4" />}

                <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "First name is required" }]}>
                    <Input placeholder="Enter your first name" />
                </Form.Item>

                <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Last name is required" }]}>
                    <Input placeholder="Enter your last name" />
                </Form.Item>

                <Form.Item name="job_title" label="Job Title">
                    <Input placeholder="Enter your job title (optional)" />
                </Form.Item>

                <Form.Item name="company" label="Company">
                    <Input placeholder="Enter your company (optional)" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                        {isSubmitting ? "Creating Profile..." : "Create Profile"}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UserSignup;