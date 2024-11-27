import React from "react";
import Image from "next/image";
import Logo from "@/assets/logo.svg";

interface LogoSectionProps {
    collapsed: boolean;
}

const SiderLogo: React.FC<LogoSectionProps> = ({ collapsed }) => {
    return (
        <div className="flex justify-center items-center transition-all duration-300 h-28">
            <Image
                src={Logo}
                alt="Logo"
                className={`transition-all duration-300 ${collapsed ? "w-8" : "w-16"}`}
            />
        </div>
    );
};

export default SiderLogo;
