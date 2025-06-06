import React, { useState, useRef, useEffect, type FC } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebaseAuth/firebaseAuth";
import type { ConfirmationResult } from "firebase/auth";
import { useLogin } from "@/hooks/uselogin";
import { useNavigate } from "react-router-dom";

interface OtpProp {
  userId: string;
  phone: string;
  password: string;
  role: string;
}

const OtpBox: FC<OtpProp> = ({ userId, phone, password, role }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>("");
  const [seconds, setSeconds] = useState<number>(60);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [recaptchaReady, setRecaptchaReady] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const {
    mutate,
    // isPending,
    // isError,
    // isSuccess,
    // data: userData,
    // error: mutateError,
  } = useLogin();
  // Initialize reCAPTCHA on mount
  useEffect(() => {
    const initializeRecaptcha = async () => {
      try {
        if (!recaptchaContainerRef.current) {
          throw new Error("reCAPTCHA container not found");
        }

        // Clear any existing reCAPTCHA
        if (verifierRef.current) {
          verifierRef.current.clear();
          verifierRef.current = null;
        }

        // Create new reCAPTCHA instance
        verifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          {
            size: "normal",
            callback: () => {
              console.log("reCAPTCHA solved");
              setError("");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
              setError("reCAPTCHA verification expired. Please try again.");
              setRecaptchaReady(false);
            },
            "error-callback": () => {
              console.log("reCAPTCHA error");
              setError("reCAPTCHA verification failed. Please try again.");
              setRecaptchaReady(false);
            },
          }
        );

        await verifierRef.current.render();
        console.log("reCAPTCHA initialized");
        setRecaptchaReady(true);
      } catch (err) {
        console.error("reCAPTCHA initialization error:", err);
        setError("Failed to initialize reCAPTCHA. Please refresh the page.");
        setRecaptchaReady(false);

        // Attempt to recover by clearing and retrying
        if (verifierRef.current) {
          verifierRef.current.clear();
          verifierRef.current = null;
        }
      }
    };

    initializeRecaptcha();

    return () => {
      // Cleanup on unmount
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
        } catch (e) {
          console.warn("Error clearing reCAPTCHA:", e);
        }
        verifierRef.current = null;
      }
      stopCountdown();
    };
  }, []);

  // Auto-send OTP when reCAPTCHA is ready
  useEffect(() => {
    if (recaptchaReady) {
      const timer = setTimeout(() => {
        sendOtp();
      }, 500); // Small delay to ensure reCAPTCHA is fully ready

      return () => clearTimeout(timer);
    }
  }, [recaptchaReady]);

  const sendOtp = async () => {
    try {
      setIsSending(true);
      setError("");
      setSuccess("");

      if (!verifierRef.current) {
        throw new Error("reCAPTCHA not initialized");
      }

      const result = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        verifierRef.current
      );

      setConfirmationResult(result);
      setSuccess("OTP sent successfully!");
      setOtpInput(true);
      startCountdown();
    } catch (err) {
      console.error("Error sending OTP", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);

      // Special handling for network errors
      if (errorMessage.includes("network-request-failed")) {
        setError("Network error. Please check your connection and try again.");
      }

      // Reset and reinitialize reCAPTCHA
      await resetRecaptcha();
    } finally {
      setIsSending(false);
    }
  };

  const resetRecaptcha = async () => {
    try {
      if (verifierRef.current) {
        verifierRef.current.clear();
        verifierRef.current = null;
      }

      if (recaptchaContainerRef.current) {
        verifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          {
            size: "normal",
            callback: () => {
              console.log("reCAPTCHA solved");
              setError("");
            },
          }
        );

        await verifierRef.current.render();
        setRecaptchaReady(true);
      }
    } catch (err) {
      console.error("Error resetting reCAPTCHA:", err);
      setError(
        "Failed to reset security verification. Please refresh the page."
      );
      setRecaptchaReady(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) {
        throw new Error("No OTP confirmation result");
      }

      if (otp.length !== 6) {
        throw new Error("Please enter a 6-digit OTP");
      }

      setIsVerifying(true);
      setError("");

      const result = await confirmationResult.confirm(otp);
      console.log("OTP verified successfully", result.user);
      const idToken = await result.user.getIdToken();
      console.log("idtoken is ", idToken);
      setSuccess("Phone number verified successfully!");

      // Continue with your registration logic here
      // await registerUser(userId, phone, password, role);

      const userData = {
        userId,
        phone,
        password,
        role,
      };
      await mutate(
        { idToken, data: userData },
        {
          onSuccess: (data: unknown) => {
            console.log("boki token", data);
            if (data) {
              console.log("Auto-login response:", userData);
              if (userData.role === "admin") {
                navigate("/admin-home", { replace: true });
              } else navigate("/subadmin-home", { replace: true });
            }
          },
          onError: (mutateError) => {
            console.error("Verification failed:", mutateError.message);
          },
        }
      );
    } catch (err) {
      console.error("OTP verification failed", err);
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const startCountdown = () => {
    stopCountdown();
    setSeconds(60);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 gap-6 h-full">
      <h3 className="font-medium text-lg">Enter OTP</h3>

      {error && (
        <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm mb-2 text-center">{success}</div>
      )}

      {otpInput ? (
        <>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            onComplete={() => console.log("OTP completed:", otp)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full mt-2"
            onClick={verifyOtp}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>

          {seconds > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend OTP in {seconds} {seconds === 1 ? "second" : "seconds"}
            </p>
          ) : (
            <Button
              className="w-full mt-2"
              onClick={sendOtp}
              disabled={isSending || !recaptchaReady}
            >
              {isSending ? "Sending..." : "Resend OTP"}
            </Button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            id="recaptcha-container"
            ref={recaptchaContainerRef}
            className="min-h-[78px] flex justify-center"
          ></div>
          <Button onClick={sendOtp} disabled={isSending || !recaptchaReady}>
            {isSending ? "Initializing..." : "Send OTP"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OtpBox;
