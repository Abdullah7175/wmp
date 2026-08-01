"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Calendar as CalendarIcon,
    Plus,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Video,
    Users,
    Clock,
    Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEfilingUser } from "@/context/EfilingUserContext";
import { isExternalUser } from "@/lib/efilingRoleHelpers";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function toYmd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseMeetingDate(value) {
    if (!value) return null;
    // meeting_date may be Date string or YYYY-MM-DD
    const s = String(value).slice(0, 10);
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function formatTime(time) {
    if (!time) return "";
    const parts = String(time).slice(0, 5).split(":");
    const hour = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

export default function MeetingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { efilingUserId, roleCode } = useEfilingUser();
    const isExternal = isExternalUser(roleCode);

    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState([]);
    const [activeTab, setActiveTab] = useState("attending");
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayDialogOpen, setDayDialogOpen] = useState(false);

    const monthStart = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
    const monthEnd = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), [currentMonth]);

    useEffect(() => {
        if (efilingUserId) fetchMeetings();
    }, [efilingUserId, activeTab, currentMonth]);

    const fetchMeetings = async () => {
        if (!efilingUserId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: "1",
                limit: "200",
                date_from: toYmd(monthStart),
                date_to: toYmd(monthEnd),
            });

            if (activeTab === "attending") params.append("attending_meetings", "true");
            else if (activeTab === "my_meetings") params.append("my_meetings", "true");

            const res = await fetch(`/api/efiling/meetings?${params}`);
            if (res.ok) {
                const data = await res.json();
                setMeetings(data.meetings || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch meetings",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
            toast({
                title: "Error",
                description: "Failed to fetch meetings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const meetingsByDate = useMemo(() => {
        const map = {};
        for (const meeting of meetings) {
            const d = parseMeetingDate(meeting.meeting_date);
            if (!d) continue;
            const key = toYmd(d);
            if (!map[key]) map[key] = [];
            map[key].push(meeting);
        }
        Object.keys(map).forEach((key) => {
            map[key].sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")));
        });
        return map;
    }, [meetings]);

    const calendarDays = useMemo(() => {
        const daysInMonth = monthEnd.getDate();
        const firstWeekday = monthStart.getDay();
        const cells = [];
        for (let i = 0; i < firstWeekday; i++) cells.push(null);
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
        }
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [currentMonth, monthStart, monthEnd]);

    const todayKey = toYmd(new Date());
    const selectedDayMeetings = selectedDay ? meetingsByDate[toYmd(selectedDay)] || [] : [];

    const openDay = (date) => {
        if (!date) return;
        setSelectedDay(date);
        setDayDialogOpen(true);
    };

    const statusTone = (status) => {
        switch (status) {
            case "SCHEDULED":
                return "bg-sky-100 text-sky-800 border-sky-200";
            case "ONGOING":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "COMPLETED":
                return "bg-slate-100 text-slate-700 border-slate-200";
            case "CANCELLED":
                return "bg-rose-100 text-rose-800 border-rose-200";
            case "POSTPONED":
                return "bg-amber-100 text-amber-800 border-amber-200";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const typeIcon = (type) => {
        if (type === "VIRTUAL") return <Video className="w-3.5 h-3.5" />;
        if (type === "HYBRID") return <Video className="w-3.5 h-3.5" />;
        return <MapPin className="w-3.5 h-3.5" />;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 text-slate-500 text-sm mb-2">
                            <CalendarIcon className="w-4 h-4" />
                            Meeting calendar
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Days with meetings are marked — click a day to view details
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                                )
                            }
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const now = new Date();
                                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                            }}
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                                )
                            }
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        {!isExternal && (
                            <Button onClick={() => router.push("/efilinguser/meetings/new")}>
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-white border">
                            <TabsTrigger value="attending">Attending</TabsTrigger>
                            <TabsTrigger value="my_meetings">Organized by me</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <p className="text-sm text-slate-500">
                        {meetings.length} meeting{meetings.length === 1 ? "" : "s"} this month
                    </p>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
                            {WEEKDAYS.map((d) => (
                                <div
                                    key={d}
                                    className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="py-24 text-center text-slate-500">Loading calendar…</div>
                        ) : (
                            <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
                                {calendarDays.map((date, idx) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={`empty-${idx}`}
                                                className="min-h-[110px] md:min-h-[130px] bg-slate-50/80"
                                            />
                                        );
                                    }
                                    const key = toYmd(date);
                                    const dayMeetings = meetingsByDate[key] || [];
                                    const isToday = key === todayKey;
                                    const hasMeetings = dayMeetings.length > 0;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => openDay(date)}
                                            className={cn(
                                                "min-h-[110px] md:min-h-[130px] bg-white p-2 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400",
                                                isToday && "ring-1 ring-inset ring-slate-900/20"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span
                                                    className={cn(
                                                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                                        isToday
                                                            ? "bg-slate-900 text-white"
                                                            : "text-slate-700"
                                                    )}
                                                >
                                                    {date.getDate()}
                                                </span>
                                                {hasMeetings && (
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {dayMeetings.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {dayMeetings.slice(0, 3).map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className={cn(
                                                            "rounded px-1.5 py-1 text-[10px] md:text-xs leading-tight border truncate",
                                                            statusTone(m.status)
                                                        )}
                                                        title={`${m.title} · ${formatTime(m.start_time)}`}
                                                    >
                                                        <span className="font-medium">
                                                            {formatTime(m.start_time)}
                                                        </span>{" "}
                                                        {m.title}
                                                    </div>
                                                ))}
                                                {dayMeetings.length > 3 && (
                                                    <p className="text-[10px] text-slate-500 px-1">
                                                        +{dayMeetings.length - 3} more
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDay
                                ? selectedDay.toLocaleDateString(undefined, {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "Meetings"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDayMeetings.length === 0
                                ? "No meetings scheduled on this day."
                                : `${selectedDayMeetings.length} meeting${selectedDayMeetings.length === 1 ? "" : "s"}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDayMeetings.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm">
                            Nothing scheduled. You can create a meeting for this day.
                            {!isExternal && (
                                <div className="mt-4">
                                    <Button
                                        onClick={() => {
                                            const d = selectedDay ? toYmd(selectedDay) : "";
                                            router.push(
                                                d
                                                    ? `/efilinguser/meetings/new?date=${d}`
                                                    : "/efilinguser/meetings/new"
                                            );
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Schedule meeting
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayMeetings.map((meeting) => (
                                <Card
                                    key={meeting.id}
                                    className="border-slate-200 shadow-none cursor-pointer hover:border-slate-400 transition"
                                    onClick={() => router.push(`/efilinguser/meetings/${meeting.id}`)}
                                >
                                    <CardHeader className="pb-2 pt-4 px-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <CardTitle className="text-base font-semibold leading-snug">
                                                {meeting.title}
                                            </CardTitle>
                                            <Badge variant="outline" className={cn("shrink-0", statusTone(meeting.status))}>
                                                {meeting.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4 space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {formatTime(meeting.start_time)} – {formatTime(meeting.end_time)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {typeIcon(meeting.meeting_type)}
                                            <span className="capitalize">
                                                {String(meeting.meeting_type || "")
                                                    .toLowerCase()
                                                    .replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {meeting.total_attendees ||
                                                (meeting.internal_attendee_count || 0) +
                                                    (meeting.external_attendee_count || 0)}{" "}
                                            attendees
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/efilinguser/meetings/${meeting.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Open details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
