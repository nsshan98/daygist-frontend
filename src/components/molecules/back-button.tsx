"use client";

import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/employees")}
            className="mt-1"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    );
}
