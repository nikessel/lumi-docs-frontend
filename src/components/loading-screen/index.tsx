'use client'
import React from 'react';
import Image from "next/image";
import Logo from "@/assets/logo-text.svg";
import "@/styles/globals.css"

const LoadingLogoScreen = () => {

    return (
        <div className="text-center p-12 ">
            <div className="flex justify-center mt-10">
                <Image
                    src={Logo}
                    alt="Logo"
                    width={200}
                />
            </div>

            <div className="mt-6 flex justify-center">
                <div className="loader">
                    <div className="blue-line"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingLogoScreen;