import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OtpBox from "./otpBox";
import { useAutoLogin } from "@/hooks/useAutologin";
import { useNavigate } from "react-router-dom";

export default function LoginCard() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isOtpSend, setOtpSend] = useState<boolean>(!false);
  console.log(password);
  const { data: userData, isLoading, error } = useAutoLogin();

  useEffect(() => {
    if (userData) {
      console.log("Auto-login response:", userData);

      if (userData.role === "admin") {
        navigate("/admin-home", { replace: true });
      } else navigate("/subadmin-home", { replace: true });
    }
  }, [userData]);

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
      {isOtpSend ? (
        <div className="p-6">
          <h3 className="font-medium my-4 mb-8">Login</h3>
          <Input
            type="text"
            placeholder="User ID"
            className="mb-4"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          />
          <Input
            type="tel"
            placeholder="Phone"
            pattern="[0-9]{10}"
            maxLength={10}
            className="mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            type="password"
            placeholder="********"
            className="mb-4"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />{" "}
          <span className="text-gray-500">+91</span>
          <Select
            value={role}
            required
            onValueChange={(e) => {
              setRole(e);
              console.log(role);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="subadmin">Sub Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            className="w-full mt-2"
            onClick={() => {
              console.log(role);
              setOtpSend(!true);
            }}
          >
            Submit
          </Button>
        </div>
      ) : (
        <>
          {userId && phone && password && (
            <OtpBox
              userId={userId}
              phone={phone}
              password={password}
              role={role}
            />
          )}
        </>
      )}
    </div>
  );
}
