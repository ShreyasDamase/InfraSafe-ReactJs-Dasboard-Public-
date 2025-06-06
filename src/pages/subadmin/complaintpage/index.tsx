import React, { useEffect, useState } from "react";
import { useWS } from "@/service/WSProvider";
import { useGetComplaint } from "@/hooks/useGetComplaint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  User,
  Phone,
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

type ZoneComplaintPayload = {
  complaint: any;
  zone: string;
};

type ComplaintStatus = "pending" | "assigned" | "resolved";

function ComplaintPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "all">(
    "all"
  );
  const [selectedHelper, setSelectedHelper] = useState<string>("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"live" | "assigned" | "resolved">(
    "live"
  );

  const socket = useWS();
  const {
    data: initialComplaints,
    isLoading,
    error,
  } = useGetComplaint("Pimplegurav_Zone");

  // Set initial complaints when fetched
  useEffect(() => {
    if (initialComplaints?.complaints?.length) {
      const formattedComplaints = initialComplaints.complaints.map(
        (c: any) => ({
          ...c,
          status: "pending",
          assignedHelper: null,
        })
      );
      setComplaints(formattedComplaints);
      setFilteredComplaints(formattedComplaints);
    }
  }, [initialComplaints]);

  // Filter complaints based on department and status
  useEffect(() => {
    let result = [...complaints];

    if (selectedDepartment !== "all") {
      result = result.filter((c) => c.complaintName === selectedDepartment);
    }

    if (selectedStatus !== "all") {
      result = result.filter((c) => c.status === selectedStatus);
    }

    setFilteredComplaints(result);
  }, [selectedDepartment, selectedStatus, complaints]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleZoneComplaint = ({ complaint, zone }: ZoneComplaintPayload) => {
      console.log("📡 [DEBUG] Received complaint for zone:", zone);
      setComplaints((prev) => [
        { ...complaint, status: "pending", assignedHelper: null },
        ...prev,
      ]);
    };

    socket.on("zoneComplaint", handleZoneComplaint);
    socket.on("helpersInZone", ({ zone, helpers }) => {
      console.log("Helpers in zone:", zone, helpers);
      setHelpers(helpers);
    });

    return () => {
      socket.off("zoneComplaint", handleZoneComplaint);
      socket.off("helpersInZone");
    };
  }, [socket]);

  const assignHelper = (complaintId: string) => {
    if (!selectedHelper) return;

    setComplaints((prev) =>
      prev.map((c) =>
        c._id === complaintId
          ? { ...c, status: "assigned", assignedHelper: selectedHelper }
          : c
      )
    );

    // Here you would typically emit a socket event to notify the helper
    socket.emit("assignHelper", { complaintId, helperId: selectedHelper });

    setSelectedHelper("");
    setSelectedComplaint(null);
  };

  const markAsResolved = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c._id === complaintId ? { ...c, status: "resolved" } : c
      )
    );

    // Here you would typically emit a socket event to notify the system
    // socket.emit("resolveComplaint", { complaintId });
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "assigned":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Wrench className="h-3 w-3" /> Assigned
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      {/* Left sidebar - Helpers and filters */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              <span>Available Helpers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {helpers.length === 0 ? (
              <p className="text-sm text-gray-500">
                No helpers available in this zone.
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {helpers.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <Avatar>
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${h.name}`}
                        />
                        <AvatarFallback>{h.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{h.name}</p>
                        <p className="text-xs text-gray-500">
                          {h.department} • {h.departmentPost}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <Select onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="electrical_fault">Electrical</SelectItem>
                  <SelectItem value="road_damage">Road</SelectItem>
                  <SelectItem value="water_issue">Water</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                onValueChange={(value: ComplaintStatus | "all") =>
                  setSelectedStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content - Complaints */}
      <div className="md:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Complaint Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value)}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="live">Live Complaints</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="live">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints
                      .filter((c) => c.status === "pending")
                      .map((c, i) => (
                        <TableRow key={i}>
                          <TableCell>{getStatusBadge(c.status)}</TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {c.complaintName.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.address}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {c.complaintDetail}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{c.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{c.user?.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComplaint(c)}
                            >
                              Assign Helper
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="assigned">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints
                      .filter((c) => c.status === "assigned")
                      .map((c, i) => {
                        const helper = helpers.find(
                          (h) => h.helperId === c.assignedHelper
                        );
                        return (
                          <TableRow key={i}>
                            <TableCell>{getStatusBadge(c.status)}</TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {c.complaintName.replace(/_/g, " ")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {c.address}
                              </div>
                            </TableCell>
                            <TableCell>
                              {helper ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={`https://ui-avatars.com/api/?name=${helper.name}`}
                                    />
                                    <AvatarFallback>
                                      {helper.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{helper.name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Unknown</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{c.user?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => markAsResolved(c._id)}
                              >
                                Mark Resolved
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="resolved">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Resolved By</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints
                      .filter((c) => c.status === "resolved")
                      .map((c, i) => {
                        const helper = helpers.find(
                          (h) => h.helperId === c.assignedHelper
                        );
                        return (
                          <TableRow key={i}>
                            <TableCell>{getStatusBadge(c.status)}</TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {c.complaintName.replace(/_/g, " ")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {c.address}
                              </div>
                            </TableCell>
                            <TableCell>
                              {helper ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={`https://ui-avatars.com/api/?name=${helper.name}`}
                                    />
                                    <AvatarFallback>
                                      {helper.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{helper.name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">System</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{c.user?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date().toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dialog */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Helper</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">
                    {selectedComplaint.complaintName.replace(/_/g, " ")}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedComplaint.complaintDetail}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Helper
                  </label>
                  <Select onValueChange={setSelectedHelper}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a helper" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpers.filter(
                        (h) =>
                          h.department === selectedComplaint.complaintDepartment
                      ).length > 0 ? (
                        helpers
                          .filter(
                            (h) =>
                              h.department ===
                              selectedComplaint.complaintDepartment
                          )
                          .map((h, i) => (
                            <SelectItem key={i} value={h.helperId}>
                              {h.name} ({h.departmentPost})
                            </SelectItem>
                          ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          No helpers available for this department
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => assignHelper(selectedComplaint._id)}
                disabled={!selectedHelper}
              >
                Assign
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ComplaintPage;
