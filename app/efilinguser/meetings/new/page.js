"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    X,
    Plus,
    Save,
    Calendar as CalendarIcon,
    MapPin,
    Video,
    Clock,
    Users,
    ArrowLeft,
    Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEfilingUser } from "@/context/EfilingUserContext";
import { cn } from "@/lib/utils";
import { isExternalUser } from "@/lib/efilingRoleHelpers";
import SearchableSelect from "@/components/ui/searchable-select";

function CreateMeetingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { efilingUserId, roleCode, loading: profileLoading } = useEfilingUser();

    useEffect(() => {
        if (!profileLoading && isExternalUser(roleCode)) {
            toast({
                title: "Access Restricted",
                description: "External users cannot create meetings. Redirecting...",
                variant: "destructive",
            });
            router.push("/efilinguser/meetings");
        }
    }, [profileLoading, roleCode, router, toast]);

    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);

    const prefilledDate = searchParams.get("date") || "";

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        agenda: "",
        meeting_type: "IN_PERSON",
        meeting_date: prefilledDate,
        start_time: "",
        end_time: "",
        venue_address: "",
        meeting_link: "",
        department_id: "",
    });

    const [attendees, setAttendees] = useState([]);
    const [externalAttendees, setExternalAttendees] = useState([]);
    const [showAttendeeModal, setShowAttendeeModal] = useState(false);
    const [showExternalModal, setShowExternalModal] = useState(false);
    const [attendeeType, setAttendeeType] = useState("USER");
    const [attendeeOptions, setAttendeeOptions] = useState([]);
    const [selectedAttendeeId, setSelectedAttendeeId] = useState("");

    const [externalForm, setExternalForm] = useState({
        email: "",
        name: "",
        designation: "",
        organization: "",
    });

    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [duration, setDuration] = useState(30);

    const generateTimeSlots = (dur) => {
        const slots = [];
        for (let hour = 8; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                const totalMinutes = minute + dur;
                const endHour = hour + Math.floor(totalMinutes / 60);
                const endMinute = totalMinutes % 60;
                const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
                slots.push({ start: time, end: endTime });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots(duration);

    useEffect(() => {
        fetchDepartments();
        fetchRoles();
        fetchRoleGroups();
        fetchTeams();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (prefilledDate && !formData.meeting_date) {
            setFormData((prev) => ({ ...prev, meeting_date: prefilledDate }));
        }
    }, [prefilledDate]);

    useEffect(() => {
        if (attendeeType === "USER") {
            setAttendeeOptions(
                users.map((u) => ({
                    id: u.id,
                    name: u.designation || u.employee_id || `User ${u.id}`,
                    designation: u.designation,
                }))
            );
        } else if (attendeeType === "ROLE") {
            setAttendeeOptions(roles.map((r) => ({ id: r.id, name: r.name, title: r.name })));
        } else if (attendeeType === "ROLE_GROUP") {
            setAttendeeOptions(roleGroups.map((rg) => ({ id: rg.id, name: rg.name, title: rg.name })));
        } else if (attendeeType === "TEAM") {
            setAttendeeOptions(teams);
        }
    }, [attendeeType, users, roles, roleGroups, teams]);

    useEffect(() => {
        if (selectedTimeSlot) {
            setFormData((prev) => ({
                ...prev,
                start_time: selectedTimeSlot.start,
                end_time: selectedTimeSlot.end,
            }));
        }
    }, [selectedTimeSlot, duration]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/efiling/departments");
            if (res.ok) {
                const data = await res.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/efiling/roles");
            if (res.ok) {
                const data = await res.json();
                setRoles(data.roles || []);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchRoleGroups = async () => {
        try {
            const res = await fetch("/api/efiling/role-groups");
            if (res.ok) {
                const data = await res.json();
                setRoleGroups(data.roleGroups || []);
            }
        } catch (error) {
            console.error("Error fetching role groups:", error);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/efiling/users?is_active=true");
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setTeams(
                    list.map((u) => ({
                        id: u.id,
                        name: u.designation || u.employee_id || `User ${u.id}`,
                        title: u.designation,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/efiling/users?is_active=true");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const addAttendee = () => {
        if (selectedAttendeeId) {
            const option = attendeeOptions.find((opt) => opt.id.toString() === selectedAttendeeId);
            if (option) {
                const exists = attendees.some((a) => a.type === attendeeType && a.id === option.id);
                if (!exists) {
                    setAttendees([
                        ...attendees,
                        {
                            type: attendeeType,
                            id: option.id,
                            name: option.name || option.designation || option.title || "Unknown",
                        },
                    ]);
                }
            }
        }
        setSelectedAttendeeId("");
        setShowAttendeeModal(false);
    };

    const addExternalAttendee = () => {
        if (externalForm.email && externalForm.name) {
            const exists = externalAttendees.some((e) => e.email === externalForm.email);
            if (!exists) {
                setExternalAttendees([...externalAttendees, { ...externalForm }]);
                setExternalForm({ email: "", name: "", designation: "", organization: "" });
                setShowExternalModal(false);
            } else {
                toast({
                    title: "Error",
                    description: "This email is already added",
                    variant: "destructive",
                });
            }
        }
    };

    const removeAttendee = (index) => {
        setAttendees(attendees.filter((_, i) => i !== index));
    };

    const removeExternalAttendee = (index) => {
        setExternalAttendees(externalAttendees.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.meeting_date || !formData.start_time || !formData.end_time) {
            toast({
                title: "Error",
                description: "Title, date, start time, and end time are required",
                variant: "destructive",
            });
            return;
        }

        if (formData.meeting_type === "IN_PERSON" && !formData.venue_address) {
            toast({
                title: "Error",
                description: "Venue address is required for in-person meetings",
                variant: "destructive",
            });
            return;
        }

        if (formData.meeting_type === "VIRTUAL" && !formData.meeting_link) {
            toast({
                title: "Error",
                description: "Meeting link is required for virtual meetings",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                department_id: formData.department_id || null,
                attendees: attendees,
                external_attendees: externalAttendees,
            };

            const res = await fetch("/api/efiling/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Meeting created successfully",
                });
                router.push("/efilinguser/meetings");
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to create meeting",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating meeting:", error);
            toast({
                title: "Error",
                description: "Failed to create meeting",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDisplayDate = (ymd) => {
        if (!ymd) return "Not selected";
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const meetingTypeLabel = {
        IN_PERSON: "In person",
        VIRTUAL: "Virtual",
        HYBRID: "Hybrid",
    };

    const totalGuests = attendees.length + externalAttendees.length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2 -ml-2 text-slate-600"
                            onClick={() => router.push("/efilinguser/meetings")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Back to calendar
                        </Button>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            Schedule meeting
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Set the details, pick a date and time, then invite attendees
                        </p>
                    </div>
                    {(formData.meeting_date || selectedTimeSlot) && (
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                                Summary
                            </p>
                            <p className="font-medium text-slate-900">
                                {formatDisplayDate(formData.meeting_date)}
                            </p>
                            <p className="text-slate-600">
                                {selectedTimeSlot
                                    ? `${formatTime(selectedTimeSlot.start)} – ${formatTime(selectedTimeSlot.end)}`
                                    : "Select a time"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Details */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Meeting details</CardTitle>
                                <CardDescription>Title, type, venue, and notes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">
                                        Meeting title <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="e.g. Monthly progress review"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Duration</Label>
                                    <Select
                                        value={duration.toString()}
                                        onValueChange={(value) => {
                                            const newDuration = parseInt(value, 10);
                                            setDuration(newDuration);
                                            if (selectedTimeSlot) {
                                                const [hours, minutes] =
                                                    selectedTimeSlot.start.split(":");
                                                const startHour = parseInt(hours, 10);
                                                const startMinute = parseInt(minutes, 10);
                                                const totalMinutes = startMinute + newDuration;
                                                const endHour =
                                                    startHour + Math.floor(totalMinutes / 60);
                                                const endMinute = totalMinutes % 60;
                                                const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
                                                setSelectedTimeSlot({
                                                    ...selectedTimeSlot,
                                                    end: endTime,
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 min</SelectItem>
                                            <SelectItem value="30">30 min</SelectItem>
                                            <SelectItem value="45">45 min</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                        Meeting type
                                    </Label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: "IN_PERSON", icon: MapPin, label: "In person" },
                                            { value: "VIRTUAL", icon: Video, label: "Virtual" },
                                            { value: "HYBRID", icon: Building2, label: "Hybrid" },
                                        ].map(({ value, icon: Icon, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({ ...formData, meeting_type: value })
                                                }
                                                className={cn(
                                                    "flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition flex flex-col items-center gap-1",
                                                    formData.meeting_type === value
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(formData.meeting_type === "IN_PERSON" ||
                                    formData.meeting_type === "HYBRID") && (
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">
                                            Venue address{" "}
                                            {formData.meeting_type === "IN_PERSON" && (
                                                <span className="text-rose-500">*</span>
                                            )}
                                        </Label>
                                        <Input
                                            value={formData.venue_address}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    venue_address: e.target.value,
                                                })
                                            }
                                            placeholder="Conference room / office address"
                                            className="mt-1.5"
                                        />
                                    </div>
                                )}

                                {(formData.meeting_type === "VIRTUAL" ||
                                    formData.meeting_type === "HYBRID") && (
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">
                                            Meeting link{" "}
                                            {formData.meeting_type === "VIRTUAL" && (
                                                <span className="text-rose-500">*</span>
                                            )}
                                        </Label>
                                        <Input
                                            value={formData.meeting_link}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    meeting_link: e.target.value,
                                                })
                                            }
                                            placeholder="https://meet.google.com/..."
                                            className="mt-1.5"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Department</Label>
                                    <Select
                                        value={formData.department_id || undefined}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                department_id: value === "none" ? "" : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Optional department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Brief overview of the meeting"
                                        rows={3}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Agenda</Label>
                                    <Textarea
                                        value={formData.agenda}
                                        onChange={(e) =>
                                            setFormData({ ...formData, agenda: e.target.value })
                                        }
                                        placeholder="Key discussion points…"
                                        rows={3}
                                        className="mt-1.5"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-lg">Attendees</CardTitle>
                                        <CardDescription>
                                            {totalGuests === 0
                                                ? "Invite internal or external guests"
                                                : `${totalGuests} guest${totalGuests === 1 ? "" : "s"} invited`}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="shrink-0">
                                        <Users className="w-3 h-3 mr-1" />
                                        You host
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAttendeeModal(true)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        Add guests
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowExternalModal(true)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        External
                                    </Button>
                                </div>

                                {totalGuests === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                                        No attendees yet — add people who should join
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-56 overflow-y-auto">
                                        {attendees.map((attendee, index) => (
                                            <div
                                                key={`int-${index}`}
                                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-800 truncate">
                                                        {attendee.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 capitalize">
                                                        {String(attendee.type || "")
                                                            .toLowerCase()
                                                            .replace("_", " ")}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttendee(index)}
                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                    aria-label="Remove attendee"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {externalAttendees.map((attendee, index) => (
                                            <div
                                                key={`ext-${index}`}
                                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-800 truncate">
                                                        {attendee.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {attendee.email}
                                                        {attendee.organization
                                                            ? ` · ${attendee.organization}`
                                                            : ""}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExternalAttendee(index)}
                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                    aria-label="Remove external attendee"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Date & time */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-lg">Date & time</CardTitle>
                                        <CardDescription>
                                            Choose a day, then pick an available slot
                                        </CardDescription>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                                        <Calendar
                                            value={formData.meeting_date}
                                            onChange={(date) => {
                                                setFormData({ ...formData, meeting_date: date });
                                                setSelectedTimeSlot(null);
                                            }}
                                            minDate={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>

                                    <div>
                                        {formData.meeting_date ? (
                                            <>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Available times
                                                    </Label>
                                                    <span className="text-xs text-slate-500">
                                                        {formatDisplayDate(formData.meeting_date)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[340px] overflow-y-auto pr-1">
                                                    {timeSlots.map((slot, index) => {
                                                        const isSelected =
                                                            selectedTimeSlot?.start === slot.start;
                                                        return (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => setSelectedTimeSlot(slot)}
                                                                className={cn(
                                                                    "px-2 py-2.5 text-sm rounded-lg border transition-colors font-medium",
                                                                    isSelected
                                                                        ? "bg-slate-900 text-white border-slate-900"
                                                                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                                                                )}
                                                            >
                                                                {formatTime(slot.start)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {selectedTimeSlot && (
                                                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                                                        <span className="font-medium">Booked slot: </span>
                                                        {formatTime(selectedTimeSlot.start)} –{" "}
                                                        {formatTime(selectedTimeSlot.end)} ·{" "}
                                                        {meetingTypeLabel[formData.meeting_type]}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6">
                                                <CalendarIcon className="w-10 h-10 mb-3 text-slate-300" />
                                                <p className="font-medium text-slate-700">Select a date</p>
                                                <p className="text-sm mt-1">
                                                    Available time slots will appear here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="py-4 px-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-sm text-slate-600">
                            {formData.title ? (
                                <span className="font-medium text-slate-900">{formData.title}</span>
                            ) : (
                                <span>Untitled meeting</span>
                            )}
                            {formData.meeting_date && selectedTimeSlot && (
                                <span className="text-slate-500">
                                    {" "}
                                    · {formatDisplayDate(formData.meeting_date)} ·{" "}
                                    {formatTime(selectedTimeSlot.start)}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !formData.meeting_date || !selectedTimeSlot}
                                className="min-w-[150px]"
                            >
                                {loading ? (
                                    "Creating…"
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Book meeting
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showAttendeeModal} onOpenChange={setShowAttendeeModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add attendee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Attendee type</Label>
                            <Select value={attendeeType} onValueChange={setAttendeeType}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ROLE">Role</SelectItem>
                                    <SelectItem value="ROLE_GROUP">Role group</SelectItem>
                                    <SelectItem value="TEAM">Team</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>
                                Select {attendeeType.replace("_", " ").toLowerCase()}
                            </Label>
                            <div className="mt-1.5">
                                <SearchableSelect
                                    value={selectedAttendeeId}
                                    onValueChange={setSelectedAttendeeId}
                                    options={attendeeOptions}
                                    getValue={(o) => String(o.id)}
                                    getLabel={(o) =>
                                        o.name || o.designation || o.title || `ID: ${o.id}`
                                    }
                                    placeholder={`Search ${attendeeType.toLowerCase().replace("_", " ")}…`}
                                    emptyText="No options available"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAttendeeModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={addAttendee} disabled={!selectedAttendeeId}>
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showExternalModal} onOpenChange={setShowExternalModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add external attendee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={externalForm.email}
                                onChange={(e) =>
                                    setExternalForm({ ...externalForm, email: e.target.value })
                                }
                                placeholder="email@example.com"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={externalForm.name}
                                onChange={(e) =>
                                    setExternalForm({ ...externalForm, name: e.target.value })
                                }
                                placeholder="Full name"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Designation</Label>
                            <Input
                                value={externalForm.designation}
                                onChange={(e) =>
                                    setExternalForm({
                                        ...externalForm,
                                        designation: e.target.value,
                                    })
                                }
                                placeholder="Optional"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Organization</Label>
                            <Input
                                value={externalForm.organization}
                                onChange={(e) =>
                                    setExternalForm({
                                        ...externalForm,
                                        organization: e.target.value,
                                    })
                                }
                                placeholder="Optional"
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowExternalModal(false);
                                setExternalForm({
                                    email: "",
                                    name: "",
                                    designation: "",
                                    organization: "",
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={addExternalAttendee}
                            disabled={!externalForm.email || !externalForm.name}
                        >
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function CreateMeetingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
                    Loading…
                </div>
            }
        >
            <CreateMeetingForm />
        </Suspense>
    );
}
