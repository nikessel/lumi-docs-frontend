"use client";

import React from "react";
import { Button } from "antd";
import Image from "next/image";
import { useAuth } from "@/components/Auth0";
import Typography from "../typography";

const LoginPrompt: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="mt-8 mb-16">
            <Typography className="mb-8 flex justify-center" textSize="h2">
                Please login to view this content
            </Typography>
            <div className="flex justify-center">
                <Image
                    src={require("@/assets/undraw_secure-login_m11a.svg")}
                    alt="Signed Out Illustration"
                    width={400}
                    height={400}
                    className="mb-6"
                />
            </div>
            <div className="flex justify-center">
                <Button type="primary" onClick={login}>Login</Button>
            </div>
        </div>
    );
};

export default LoginPrompt;
