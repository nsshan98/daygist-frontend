"use client";

import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    href?: string;
}

export function BackButton({ href }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="mt-1"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    );
}
