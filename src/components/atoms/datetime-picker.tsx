"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/atoms/popover";
import { Input } from "@/components/atoms/input";

// Helper function to format date with timezone offset (e.g., "2026-02-27T10:00:00+06:00")
const formatToISOWithOffset = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Get timezone offset in +HH:MM format
    const tzOffset = -date.getTimezoneOffset();
    const tzSign = tzOffset >= 0 ? "+" : "-";
    const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
    const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
};

export const DateTimePicker = React.forwardRef<
    HTMLButtonElement,
    {
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
    }
>(({ value, onChange, placeholder = "Pick date and time", ...props }, ref) => {
    const dateValue = value ? new Date(value) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    {...props}
                    variant={"secondary"}
                    className={cn(
                        "w-full pl-3 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    {dateValue ? (
                        format(dateValue, "dd-MM-yyyy HH:mm")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(selectedDate) => {
                        if (selectedDate) {
                            const current = dateValue || new Date();
                            selectedDate.setHours(current.getHours());
                            selectedDate.setMinutes(current.getMinutes());
                            onChange(formatToISOWithOffset(selectedDate));
                        }
                    }}
                    disabled={(date) => date > new Date()}
                />
                <div className="p-3 border-t">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Time:</span>
                        <Input
                            type="time"
                            value={dateValue ? format(dateValue, "HH:mm") : ""}
                            onChange={(e) => {
                                const timeStr = e.target.value;
                                if (timeStr) {
                                    const [hours, minutes] = timeStr.split(":");
                                    const newDate = dateValue ? new Date(dateValue) : new Date();
                                    newDate.setHours(parseInt(hours, 10));
                                    newDate.setMinutes(parseInt(minutes, 10));
                                    onChange(formatToISOWithOffset(newDate));
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});
DateTimePicker.displayName = "DateTimePicker";
