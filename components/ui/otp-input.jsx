"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * OTP Input Component
 * Displays 6 individual input boxes for OTP entry
 */
export function OTPInput({ value = "", onChange, disabled = false, className }) {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const inputRefs = useRef([]);

    // Initialize with value if provided
    useEffect(() => {
        if (value) {
            const digits = value.split("").slice(0, 6);
            const newOtp = [...Array(6).fill("")];
            digits.forEach((digit, index) => {
                newOtp[index] = digit;
            });
            setOtp(newOtp);
        } else {
            setOtp(Array(6).fill(""));
        }
    }, [value]);

    const handleChange = (index, digit) => {
        // Only allow numbers
        if (digit && !/^\d$/.test(digit)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Call onChange with combined value
        const combinedValue = newOtp.join("");
        onChange?.(combinedValue);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        const digits = pastedData.split("").filter((char) => /^\d$/.test(char));
        
        if (digits.length > 0) {
            const newOtp = [...Array(6).fill("")];
            digits.forEach((digit, index) => {
                if (index < 6) {
                    newOtp[index] = digit;
                }
            });
            setOtp(newOtp);
            const combinedValue = newOtp.join("");
            onChange?.(combinedValue);
            
            // Focus the next empty input or the last one
            const nextEmptyIndex = newOtp.findIndex((val) => !val);
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className={cn("flex gap-2 justify-center", className)}>
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-12 text-center text-lg font-semibold",
                        "focus:ring-2 focus:ring-primary focus:border-primary",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                />
            ))}
        </div>
    );
}

