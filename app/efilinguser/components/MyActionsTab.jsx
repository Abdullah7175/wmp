'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Send,
    PenLine,
    FilePlus,
    MessageSquare,
    CheckCircle2,
    Activity,
    Calendar,
    Clock,
    FileText,
    ArrowRight,
    BookOpen,
    X,
    Loader2,
    Paperclip,
} from 'lucide-react';

const PERIODS = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: 'all', label: 'All time' },
    { key: 'custom', label: 'Custom' },
];

const ACTION_CARDS = [
    {
        key: 'marked',
        title: 'Marked',
        hint: 'Files you marked to others',
        icon: Send,
        accent: 'from-indigo-500 to-blue-600',
        ring: 'ring-indigo-200',
        text: 'text-indigo-700',
        badge: 'bg-indigo-100 text-indigo-800',
    },
    {
        key: 'signed',
        title: 'Signed',
        hint: 'Files you signed',
        icon: PenLine,
        accent: 'from-emerald-500 to-teal-600',
        ring: 'ring-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800',
    },
    {
        key: 'created',
        title: 'Created',
        hint: 'Files you created',
        icon: FilePlus,
        accent: 'from-sky-500 to-cyan-600',
        ring: 'ring-sky-200',
        text: 'text-sky-700',
        badge: 'bg-sky-100 text-sky-800',
    },
    {
        key: 'comments',
        title: 'Comments',
        hint: 'Notes you added',
        icon: MessageSquare,
        accent: 'from-amber-500 to-orange-500',
        ring: 'ring-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
    },
];

const TYPE_STYLES = {
    marked: { label: 'Marked', className: 'bg-indigo-100 text-indigo-800', icon: Send },
    signed: { label: 'Signed', className: 'bg-emerald-100 text-emerald-800', icon: PenLine },
    created: { label: 'Created', className: 'bg-sky-100 text-sky-800', icon: FilePlus },
    commented: { label: 'Comment', className: 'bg-amber-100 text-amber-800', icon: MessageSquare },
    completed: { label: 'Completed', className: 'bg-violet-100 text-violet-800', icon: CheckCircle2 },
    attachment: { label: 'Attachment', className: 'bg-rose-100 text-rose-800', icon: Paperclip },
    other: { label: 'Action', className: 'bg-slate-100 text-slate-700', icon: Activity },
};

function formatDateTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDayHeading(ymd) {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(yesterdayDate);

    if (ymd === today) return 'Today';
    if (ymd === yesterday) return 'Yesterday';
    return new Date(`${ymd}T00:00:00+05:00`).toLocaleDateString('en-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function eventDay(timestamp) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(timestamp));
}

export default function MyActionsTab() {
    const router = useRouter();
    const [period, setPeriod] = useState('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const loadActions = async (nextPeriod = period, from = customFrom, to = customTo) => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ period: nextPeriod });
            if (nextPeriod === 'custom' && from) {
                params.set('from', from);
                params.set('to', to || from);
            }
            const res = await fetch(`/api/efiling/my-actions?${params.toString()}`, {
                cache: 'no-store',
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed to load actions');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError('Could not load your action diary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActions('month');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePeriodChange = (key) => {
        setPeriod(key);
        setSelectedCategory(null);
        if (key !== 'custom') {
            loadActions(key);
        }
    };

    const applyCustomRange = () => {
        if (!customFrom) return;
        setPeriod('custom');
        setSelectedCategory(null);
        loadActions('custom', customFrom, customTo || customFrom);
    };

    const summary = data?.summary;
    const selectedFiles = selectedCategory ? data?.filesByCategory?.[selectedCategory] || [] : [];
    const selectedMeta = ACTION_CARDS.find((card) => card.key === selectedCategory);
    const SelectedIcon = selectedMeta?.icon;

    const groupedTimeline = useMemo(() => {
        const events = data?.timeline || [];
        const groups = [];
        const index = new Map();
        for (const event of events) {
            const day = eventDay(event.timestamp);
            if (!index.has(day)) {
                index.set(day, groups.length);
                groups.push({ date: day, events: [] });
            }
            groups[index.get(day)].events.push(event);
        }
        return groups;
    }, [data?.timeline]);

    const maxDaily = Math.max(1, ...(data?.dailyBreakdown || []).map((d) => d.total));

    return (
        <div className="space-y-5">
            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-5 text-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-200" />
                                <h2 className="text-xl font-semibold tracking-tight">My Actions</h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-300">
                                Your personal diary of files you marked, signed, and created.
                            </p>
                        </div>
                        <div className="rounded-lg bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
                            <div className="text-2xl font-bold">{summary?.totalEvents ?? 0}</div>
                            <div className="text-xs text-slate-300">
                                {data?.period?.label || 'actions'} · {summary?.totalFiles ?? 0} files
                            </div>
                        </div>
                    </div>
                </div>
                <CardContent className="pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {PERIODS.map((item) => (
                            <Button
                                key={item.key}
                                size="sm"
                                variant={period === item.key ? 'default' : 'outline'}
                                className={period === item.key ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}
                                onClick={() => handlePeriodChange(item.key)}
                            >
                                {item.key === 'custom' ? <Calendar className="mr-1.5 h-3.5 w-3.5" /> : null}
                                {item.label}
                            </Button>
                        ))}
                    </div>
                    {period === 'custom' && (
                        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
                                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
                                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-white" />
                            </div>
                            <Button onClick={applyCustomRange} disabled={!customFrom}>
                                Apply
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-16 text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading your action diary...
                    </CardContent>
                </Card>
            ) : error ? (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="py-8 text-center">
                        <p className="mb-3 text-sm text-red-700">{error}</p>
                        <Button variant="outline" onClick={() => loadActions()}>Retry</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {ACTION_CARDS.map((card) => {
                            const Icon = card.icon;
                            const stats = summary?.[card.key] || { files: 0, events: 0 };
                            const isActive = selectedCategory === card.key;
                            return (
                                <button
                                    key={card.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(isActive ? null : card.key)}
                                    className={`group text-left rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
                                        isActive ? `ring-2 ${card.ring} border-transparent` : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={`rounded-lg bg-gradient-to-br ${card.accent} p-2 text-white shadow-sm`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            {isActive ? 'Hide' : 'View'}
                                        </span>
                                    </div>
                                    <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                                        {stats.files}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-800">{card.title}</div>
                                    <p className="mt-0.5 text-xs text-slate-500">{card.hint}</p>
                                    <p className="mt-2 text-[11px] text-slate-400">
                                        {stats.events} {stats.events === 1 ? 'action' : 'actions'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {selectedCategory && selectedMeta && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {SelectedIcon && <SelectedIcon className={`h-5 w-5 ${selectedMeta.text}`} />}
                                        {selectedMeta.title} files
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} in {data?.period?.label?.toLowerCase() || 'this period'}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {selectedFiles.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-slate-500">
                                        No {selectedMeta.title.toLowerCase()} files in this period.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={`${file.file_id}-${index}`}
                                                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-semibold text-slate-900">{file.file_number}</span>
                                                        {file.marked_to && (
                                                            <Badge className={selectedMeta.badge}>
                                                                To {file.marked_to}
                                                                {file.marked_to_role ? ` · ${file.marked_to_role}` : ''}
                                                            </Badge>
                                                        )}
                                                        {file.signature_type && (
                                                            <Badge className={selectedMeta.badge}>
                                                                {String(file.signature_type).replace(/_/g, ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 truncate text-sm text-slate-600">{file.subject}</p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {formatDateTime(file.timestamp)}
                                                        {file.remarks ? ` · ${file.remarks}` : ''}
                                                        {file.comment_text ? ` · ${String(file.comment_text).slice(0, 80)}` : ''}
                                                    </p>
                                                </div>
                                                {file.file_id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/efilinguser/files/${file.file_id}`)}
                                                    >
                                                        View file
                                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {(data?.dailyBreakdown || []).length > 1 && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Activity by day</CardTitle>
                                <CardDescription>How much you did across the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2 overflow-x-auto pb-2">
                                    {[...(data.dailyBreakdown || [])].reverse().map((day) => (
                                        <div key={day.date} className="flex min-w-[42px] flex-col items-center gap-1">
                                            <div className="flex h-24 w-6 items-end rounded-sm bg-slate-100">
                                                <div
                                                    className="w-full rounded-sm bg-gradient-to-t from-blue-700 to-sky-400"
                                                    style={{ height: `${Math.max(8, (day.total / maxDaily) * 100)}%` }}
                                                    title={`${day.total} actions`}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {day.date.slice(8)}/{day.date.slice(5, 7)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-slate-500" />
                                Action diary
                            </CardTitle>
                            <CardDescription>
                                Latest actions appear first. This is a notebook of what you have done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {groupedTimeline.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                    <p className="font-medium">No actions in this period</p>
                                    <p className="mt-1 text-sm">Mark, sign, or create a file and it will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {groupedTimeline.map((group) => (
                                        <div key={group.date}>
                                            <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 bg-white/90 py-1 backdrop-blur-sm">
                                                <div className="h-px flex-1 bg-slate-200" />
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                    {formatDayHeading(group.date)}
                                                </span>
                                                <div className="h-px flex-1 bg-slate-200" />
                                            </div>
                                            <div className="relative space-y-3 pl-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
                                                {group.events.map((event) => {
                                                    const style = TYPE_STYLES[event.type] || TYPE_STYLES.other;
                                                    const Icon = style.icon;
                                                    const canOpenFile = event.type === 'attachment'
                                                        ? Boolean(event.can_open_file)
                                                        : Boolean(event.file_id);
                                                    const fileHref = canOpenFile && event.file_id
                                                        ? `/efilinguser/files/${event.file_id}`
                                                        : null;
                                                    const attachmentHref = event.file_url || event.thumbnail_url;
                                                    return (
                                                        <div key={event.id} className="relative">
                                                            <span className="absolute -left-4 top-4 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 shadow-sm" />
                                                            <div className="rounded-lg border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50/70">
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div className="flex min-w-0 flex-1 gap-3">
                                                                        {event.type === 'attachment' && event.thumbnail_url && (
                                                                            <a
                                                                                href={attachmentHref}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="shrink-0"
                                                                                title={event.attachment_name || 'Preview attachment'}
                                                                            >
                                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                <img
                                                                                    src={event.thumbnail_url}
                                                                                    alt={event.attachment_name || 'Attachment'}
                                                                                    className="h-16 w-16 rounded-md border border-slate-200 object-cover bg-slate-50"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                            </a>
                                                                        )}
                                                                        {event.type === 'attachment' && !event.thumbnail_url && attachmentHref && (
                                                                            <a
                                                                                href={attachmentHref}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500"
                                                                                title="Open uploaded file"
                                                                            >
                                                                                <Paperclip className="h-5 w-5" />
                                                                            </a>
                                                                        )}
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <Badge className={style.className}>
                                                                                    <Icon className="mr-1 h-3 w-3" />
                                                                                    {style.label}
                                                                                </Badge>
                                                                                <span className="text-xs text-slate-400">{formatTime(event.timestamp)}</span>
                                                                                {event.still_assigned && (
                                                                                    <Badge className="bg-emerald-100 text-emerald-800">Still with you</Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="mt-2 text-sm font-medium text-slate-900">
                                                                                {event.description}
                                                                                {event.type === 'attachment' && event.uploaded_to_label ? ` · ${event.uploaded_to_label}` : ''}
                                                                            </p>
                                                                            {canOpenFile && event.file_number && event.file_number !== 'N/A' && fileHref && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="mt-1 text-sm font-semibold text-blue-700 hover:underline"
                                                                                    onClick={() => router.push(fileHref)}
                                                                                >
                                                                                    {event.file_number}
                                                                                </button>
                                                                            )}
                                                                            {event.file_subject && event.file_subject !== 'N/A' && (
                                                                                <p className="mt-1 truncate text-xs text-slate-500">{event.file_subject}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {fileHref ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="shrink-0"
                                                                            onClick={() => router.push(fileHref)}
                                                                        >
                                                                            Open
                                                                        </Button>
                                                                    ) : event.type === 'attachment' && attachmentHref ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="shrink-0"
                                                                            onClick={() => window.open(attachmentHref, '_blank', 'noopener,noreferrer')}
                                                                        >
                                                                            View file
                                                                        </Button>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
