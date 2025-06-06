"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BASE_URL } from "@/service/config";
import { zones } from "@/utils/zone";
const roles = ["subadmin"];
const genders = ["Male", "Female", "Other"];

type FormData = {
  name: string;
  role: string;
  gender: string;
  dob: Date | undefined;
  phone: string;
  adhaarNo: string;
  country: string;
  states: string;
  pinCode: string;
  address: string;
  zone: {
    name: string;
    area: {
      type: string;
      coordinates: number[][][];
    };
  };
  profileImage: FileList | null;
  documents: FileList | null;
};

export default function SubAdminForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      role: "",
      gender: "",
      dob: undefined,
      phone: "",
      adhaarNo: "",
      country: "",
      states: "",
      pinCode: "",
      address: "",
      zone: {
        name: "",
        area: {
          type: "Polygon",
          coordinates: [],
        },
      },
      profileImage: null,
      documents: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();

    // Append simple fields
    formData.append("name", data.name);
    formData.append("role", data.role);
    formData.append("gender", data.gender);
    if (data.dob) formData.append("dob", data.dob.toISOString());
    formData.append("phone", data.phone);
    formData.append("adhaarNo", data.adhaarNo);
    formData.append("country", data.country);
    formData.append("states", data.states);
    formData.append("pinCode", data.pinCode);
    formData.append("address", data.address);

    // Append zone as JSON string
    formData.append("zone", JSON.stringify(data.zone));

    // Append files
    if (data.profileImage && data.profileImage.length > 0) {
      formData.append("profileImage", data.profileImage[0]);
    }

    if (data.documents) {
      Array.from(data.documents).forEach((file, index) => {
        formData.append(`documents`, file);
      });
    }
    console.log("--- FormData Contents ---");

    // Log regular fields
    console.log("Regular Fields:");
    for (const [key, value] of formData.entries()) {
      if (typeof value !== "object") {
        console.log(`${key}: ${value}`);
      }
    }

    // Log files
    console.log("\nFiles:");
    if (data.profileImage && data.profileImage.length > 0) {
      console.log(
        `profileImage: ${data.profileImage[0].name} (${data.profileImage[0].type})`
      );
    }
    if (data.documents) {
      Array.from(data.documents).forEach((file, index) => {
        console.log(`document ${index + 1}: ${file.name} (${file.type})`);
      });
    }

    // Log zone object
    console.log("\nZone Object:");
    console.log(data.zone);
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/register-subadmin`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Optional: Add timeout
          timeout: 30000, // 30 seconds
        }
      );

      console.log("Success:", response.data);

      // Handle success
      if (response.data.success) {
        // Example success handling:
        alert("SubAdmin created successfully!");
        // router.push('/subadmins'); // Redirect if using Next.js
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);

      // Handle error
      if (error.response?.data?.errors) {
        // Display validation errors
        alert(
          `Validation errors: ${JSON.stringify(error.response.data.errors)}`
        );
      } else {
        alert(error.response?.data?.message || "Failed to create SubAdmin");
      }
    }
  };

  const dob = watch("dob");
  const selectedZone = watch("zone");

  return (
    <Card className="max-w-xl mx-auto mt-10 p-4 shadow-xl">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label>Name</Label>
            <Input {...register("name", { required: "Name is required" })} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <Label>Role</Label>
            <Select
              onValueChange={(value) => setValue("role", value)}
              value={watch("role")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-sm">Role is required</p>
            )}
          </div>

          {/* Gender Dropdown */}
          <div>
            <Label>Gender</Label>
            <Select
              onValueChange={(value) => setValue("gender", value)}
              value={watch("gender")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-sm">Gender is required</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={(date) => setValue("dob", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dob && (
              <p className="text-red-500 text-sm">Date of birth is required</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            <Input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Aadhaar Number */}
          <div>
            <Label>Adhaar Number</Label>
            <Input
              {...register("adhaarNo", {
                required: "Adhaar number is required",
                pattern: {
                  value: /^[0-9]{12}$/,
                  message: "Please enter a valid 12-digit Adhaar number",
                },
              })}
            />
            {errors.adhaarNo && (
              <p className="text-red-500 text-sm">{errors.adhaarNo.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <Label>Country</Label>
            <Input
              {...register("country", { required: "Country is required" })}
            />
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <Label>State</Label>
            <Input {...register("states", { required: "State is required" })} />
            {errors.states && (
              <p className="text-red-500 text-sm">{errors.states.message}</p>
            )}
          </div>

          {/* Pin Code */}
          <div>
            <Label>Pin Code</Label>
            <Input
              {...register("pinCode", {
                required: "Pin code is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Please enter a valid 6-digit pin code",
                },
              })}
            />
            {errors.pinCode && (
              <p className="text-red-500 text-sm">{errors.pinCode.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* Zone Dropdown */}
          <div>
            <Label>Zone</Label>
            <Select
              onValueChange={(value) => {
                const selected = zones.find((zone) => zone.name === value);
                if (selected) {
                  setValue("zone", selected);
                }
              }}
              value={selectedZone?.name || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.name} value={zone.name}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.zone && (
              <p className="text-red-500 text-sm">Zone is required</p>
            )}
          </div>

          {/* Profile Image */}
          <div>
            <Label>Profile Image</Label>
            <Input
              type="file"
              accept="image/*"
              {...register("profileImage", {
                required: "Profile image is required",
              })}
            />
            {errors.profileImage && (
              <p className="text-red-500 text-sm">
                {errors.profileImage.message}
              </p>
            )}
          </div>

          {/* Documents */}
          <div>
            <Label>Documents (Multiple allowed)</Label>
            <Input
              type="file"
              multiple
              accept="application/pdf,image/*"
              {...register("documents")}
            />
          </div>

          <Button type="submit" className="w-full">
            Create SubAdmin
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
