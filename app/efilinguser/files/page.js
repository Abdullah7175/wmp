"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Plus, 
    Search, 
    Filter, 
    FileText, 
    Edit, 
    Eye, 
    Send, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Building2,
    User,
    Calendar,
    ArrowRight,
    FileEdit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logEfilingUserAction, EFILING_ACTIONS } from '@/lib/efilingUserActionLogger';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function FilesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [profile, setProfile] = useState(null);
    const [myFiles, setMyFiles] = useState([]);
    const [assignedToMe, setAssignedToMe] = useState([]);

    // Assign modal state
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignFileId, setAssignFileId] = useState(null);
    const [candidateUsers, setCandidateUsers] = useState([]);
    const [selectedToUserId, setSelectedToUserId] = useState('');

    const ROLE = { XEN: 18, SE: 19, CE: 25, COO: 26, CEO: 24, PC: 28, IAO_II: 27, BUDGET: 31, ADLFA: 30, FINANCE: 29 };

    const filterFilesByDepartment = (files, userProfile) => {
        if (!userProfile) return files;
        
        const userRole = userProfile.efiling_role?.code;
        const userDepartment = userProfile.department_id;
        
        // Water department users can only see water files
        if ([6, 7, 8, 9].includes(userDepartment)) {
            return files.filter(file => ['WB', 'WTM', 'WD', 'WE_EM'].includes(file.file_type?.code));
        }
        
        // Sewerage department users can only see sewerage files
        if ([10, 19].includes(userDepartment)) {
            return files.filter(file => ['SEP', 'SEW_EM'].includes(file.file_type?.code));
        }
        
        // Admin users can see all files
        if (userRole === 'SYS_ADMIN') {
            return files;
        }
        
        return files;
    };

    const getRoleDisplayName = (roleCode) => {
        const roleMap = {
            'WAT_XEN_MMB': 'XEN MIR BAHAR',
            'WAT_XEN_SHAH': 'XEN SHAHFAISAL',
            'WAT_XEN_KOR': 'XEN KORANGI',
            'WAT_XEN_NAZ': 'XEN NAZIMABAD',
            'WAT_XEN_LIA': 'XEN LIAQATABAD',
            'WAT_XEN_JIN': 'XEN JINNAH',
            'WAT_XEN_NN': 'XEN NORTH NAZIMABAD',
            'WAT_XEN_MAL': 'XEN MALIR',
            'WAT_XEN_CHE': 'XEN CHANESAR',
            'WAT_XEN_GULS': 'XEN GULSHANIQBAL',
            'WAT_XEN_SAD': 'XEN SADDAR',
            'WAT_XEN_MAN': 'XEN MANGOPIR',
            'WAT_XEN_LAN': 'XEN LANDHI',
            'WAT_XEN_MOM': 'XEN MOMINABAD',
            'WAT_XEN_BAL': 'XEN BALDIA',
            'WAT_XEN_NK': 'XEN NEWKARACHI',
            'WAT_XEN_MOD': 'XEN MODEL',
            'WAT_XEN_LIAR': 'XEN LIARI',
            'WAT_XEN_KEA': 'XEN KEAMARI',
            'WAT_XEN_GAD': 'XEN GADAP',
            'WAT_XEN_CLI': 'XEN CLIFTON',
            'WAT_XEN_IH': 'XEN IBRAHIM HYDERI',
            'WAT_XEN_ORA': 'XEN ORANGI',
            'WAT_XEN_SAF': 'XEN SAFOORA',
            'WAT_XEN_SOG': 'XEN SOHRAB GOTH',
            'SEW_XEN_MMB': 'SEW XEN MIR BAHAR',
            'SEW_XEN_SHAH': 'SEW XEN SHAHFAISAL',
            'SEW_XEN_KOR': 'SEW XEN KORANGI',
            'SEW_XEN_NAZ': 'SEW XEN NAZIMABAD',
            'SEW_XEN_LIA': 'SEW XEN LIAQATABAD',
            'SEW_XEN_JIN': 'SEW XEN JINNAH',
            'SEW_XEN_NN': 'SEW XEN NORTH NAZIMABAD',
            'SEW_XEN_MAL': 'SEW XEN MALIR',
            'SEW_XEN_CHE': 'SEW XEN CHANESAR',
            'SEW_XEN_GULS': 'SEW XEN GULSHANIQBAL',
            'SEW_XEN_SAD': 'SEW XEN SADDAR',
            'SEW_XEN_MAN': 'SEW XEN MANGOPIR',
            'SEW_XEN_LAN': 'SEW XEN LANDHI',
            'SEW_XEN_MOM': 'SEW XEN MOMINABAD',
            'SEW_XEN_BAL': 'SEW XEN BALDIA',
            'SEW_XEN_NK': 'SEW XEN NEWKARACHI',
            'SEW_XEN_MOD': 'SEW XEN MODEL',
            'SEW_XEN_LIAR': 'SEW XEN LIARI',
            'SEW_XEN_KEA': 'SEW XEN KEAMARI',
            'SEW_XEN_GAD': 'SEW XEN GADAP',
            'SEW_XEN_CLI': 'SEW XEN CLIFTON',
            'SEW_XEN_IH': 'SEW XEN IBRAHIM HYDERI',
            'SEW_XEN_ORA': 'SEW XEN ORANGI',
            'SEW_XEN_SAF': 'SEW XEN SAFOORA',
            'SEW_XEN_SOG': 'SEW XEN SOHRAB GOTH',
            'SE_CEN': 'SE CENTRAL',
            'SE_EAST': 'SE EAST',
            'SE_WEST': 'SE WEST',
            'SE_SOUTH': 'SE SOUTH',
            'SE_KOR': 'SE KORANGI',
            'SE_MAL': 'SE MALIR',
            'SE_KEA': 'SE KEAMARI',
            'CE_WAT': 'CE WATER',
            'CE_SEW': 'CE SEWERAGE',
            'COO': 'COO',
            'CEO': 'CEO',
            'PC': 'PC',
            'IAO_II': 'IAO II',
            'BUDGET': 'BUDGET',
            'ADLFA': 'ADLFA',
            'FINANCE': 'FINANCE',
            'CON_': 'CONSULTANT'
        };
        
        return roleMap[roleCode] || roleCode;
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchProfile();
        }
    }, [session?.user?.id]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
            if (res.ok) {
                const p = await res.json();
                setProfile(p);
            }
        } catch (e) {
            console.error('Failed to load profile', e);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchFiles();
            fetchDepartments();
            fetchStatuses();
        }
    }, [session?.user?.id]);

    useEffect(() => {
        filterFiles();
    }, [searchTerm, statusFilter, departmentFilter, files]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // First, get the efiling_users.id for this user
            const userMappingRes = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
            let efilingUserId = session.user.id; // fallback
            let userProfile = null;
            
            if (userMappingRes.ok) {
                const userMapping = await userMappingRes.json();
                efilingUserId = userMapping.efiling_user_id || session.user.id;
                userProfile = userMapping;
                console.log('Files page - Mapped user ID:', session.user.id, 'to efiling user ID:', efilingUserId);
            }
            
            // Fetch user's created files and assigned files using efiling_users.id
            const [myFilesRes, assignedFilesRes] = await Promise.all([
                fetch(`/api/efiling/files?created_by=${efilingUserId}`),
                fetch(`/api/efiling/files?assigned_to=${efilingUserId}`)
            ]);

            const myFiles = myFilesRes.ok ? await myFilesRes.json() : { files: [] };
            const assignedFiles = assignedFilesRes.ok ? await assignedFilesRes.json() : { files: [] };
            
            // Filter files based on user's department and role
            const filteredMyFiles = filterFilesByDepartment(myFiles.files || [], userProfile);
            const filteredAssignedFiles = filterFilesByDepartment(assignedFiles.files || [], userProfile);
            
            const isAdmin = session?.user?.role === 1;
            const enrich = (arr) => (arr || []).map(f => ({
                ...f,
                is_admin: isAdmin,
                is_creator: f.created_by === efilingUserId
            }));

            setMyFiles(enrich(filteredMyFiles));
            setAssignedToMe(enrich(filteredAssignedFiles));
            
            // Combine and deduplicate files for unified filtering if needed
            const allFiles = [...enrich(filteredMyFiles), ...enrich(filteredAssignedFiles)];
            const uniqueFiles = allFiles.filter((file, index, self) => 
                index === self.findIndex(f => f.id === file.id)
            );
            
            console.log('My files fetched from API:', uniqueFiles);
            setFiles(uniqueFiles);
            
            // Log files access
            if (session?.user?.id) {
                logEfilingUserAction({
                    user_id: session.user.id,
                    action_type: EFILING_ACTIONS.FILE_VIEWED,
                    description: `Accessed files list - found ${uniqueFiles.length} files`,
                    entity_type: 'files_list',
                    entity_name: 'My Files List'
                });
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast({
                title: "Error",
                description: "Failed to load your files",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await fetch('/api/efiling/file-status');
            if (response.ok) {
                const data = await response.json();
                setStatuses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const filterFiles = () => {
        let filtered = files;

        if (searchTerm) {
            filtered = filtered.filter(file =>
                file.file_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(file => file.status_id == statusFilter);
        }

        if (departmentFilter && departmentFilter !== 'all') {
            filtered = filtered.filter(file => file.department_id == departmentFilter);
        }

        setFilteredFiles(filtered);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'DRAFT': { variant: 'secondary', icon: FileText },
            'IN_PROGRESS': { variant: 'default', icon: Clock },
            'PENDING_APPROVAL': { variant: 'default', icon: AlertCircle },
            'APPROVED': { variant: 'default', icon: CheckCircle },
            'REJECTED': { variant: 'destructive', icon: AlertCircle },
            'COMPLETED': { variant: 'default', icon: CheckCircle }
        };

        const config = statusConfig[status] || { variant: 'secondary', icon: FileText };
        const IconComponent = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <IconComponent className="w-3 h-3" />
                {status?.replace('_', ' ')}
            </Badge>
        );
    };

    const formatTimeRemaining = (deadline, breached) => {
        if (!deadline) return '-';
        const now = Date.now();
        const diffMs = new Date(deadline).getTime() - now;
        if (breached || diffMs <= 0) return 'Breached';
        const mins = Math.floor(diffMs / 60000);
        const days = Math.floor(mins / 1440);
        const hours = Math.floor((mins % 1440) / 60);
        const minutes = mins % 60;
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const openAssignModal = async (fileId) => {
        if (!profile) {
            toast({ title: 'Profile not loaded', variant: 'destructive' });
            return;
        }
        setAssignFileId(fileId);
        setSelectedToUserId('');
        setAssignOpen(true);
        try {
            const res = await fetch('/api/efiling/users?is_active=true');
            const users = res.ok ? await res.json() : [];
            // Filter candidates based on rules from current user role
            const myRole = profile.efiling_role_id;
            const myDept = profile.department_id;
            const isConsultant = profile.is_consultant === true;

            let rolesAllowed = [];
            let requireSameDept = false;
            let allowConsultant = false;
            if (myRole === ROLE.XEN) { rolesAllowed = [ROLE.SE]; requireSameDept = true; }
            else if (myRole === ROLE.SE) { rolesAllowed = [ROLE.CE]; requireSameDept = true; allowConsultant = true; }
            else if (myRole === ROLE.CE) { rolesAllowed = [ROLE.COO, ROLE.XEN, ROLE.PC]; }
            else if (myRole === ROLE.COO) { rolesAllowed = [ROLE.CEO]; }
            else if (myRole === ROLE.CEO) { rolesAllowed = [ROLE.CE]; }
            else if (myRole === ROLE.PC) { rolesAllowed = [ROLE.IAO_II]; }
            else if (myRole === ROLE.IAO_II) { rolesAllowed = [ROLE.COO]; }
            else if (myRole === ROLE.BUDGET) { rolesAllowed = [ROLE.ADLFA]; }
            else if (myRole === ROLE.ADLFA) { rolesAllowed = [ROLE.FINANCE]; }

            const candidates = users.filter(u => {
                const roleOk = rolesAllowed.includes(u.efiling_role_id) || (allowConsultant && u.is_consultant === true);
                const deptOk = requireSameDept ? (u.department_id === myDept) : true;
                // For consultant path: if selecting consultant from SE, allow only consultants
                if (allowConsultant && rolesAllowed.includes(ROLE.CE) === false) {
                    // SE -> Consultant case
                    return (u.is_consultant === true) && deptOk;
                }
                return roleOk && deptOk;
            });
            setCandidateUsers(candidates);
        } catch (e) {
            console.error('Failed to load users', e);
            setCandidateUsers([]);
        }
    };

    const submitAssign = async () => {
        if (!assignFileId || !selectedToUserId) {
            toast({ title: 'Please select a user', variant: 'destructive' });
            return;
        }
        try {
            const res = await fetch(`/api/efiling/files/${assignFileId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to_user_id: parseInt(selectedToUserId), current_user_id: session.user.id, remarks: '' })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Assignment failed');
            }
            toast({ title: 'Assigned', description: 'File has been assigned.' });
            setAssignOpen(false);
            setAssignFileId(null);
            await fetchFiles();
        } catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const handleCreateFile = () => {
        // Log file creation attempt
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.FILE_CREATED,
                description: 'Initiated new file creation',
                entity_type: 'file_creation',
                entity_name: 'New E-Filing File'
            });
        }
        router.push('/efilinguser/files/new');
    };

    const handleEditDocument = (fileId) => {
        // Log document edit action
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.DOCUMENT_EDITED,
                description: `Initiated document editing for file ${fileId}`,
                file_id: fileId
            });
        }
        router.push(`/efilinguser/files/${fileId}/edit-document`);
    };

    const handleViewFile = (fileId) => {
        // Log file view action
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.FILE_VIEWED,
                description: `Viewed file ${fileId}`,
                file_id: fileId
            });
        }
        router.push(`/efilinguser/files/${fileId}`);
    };

    const handleMarkTo = (fileId) => {
        openAssignModal(fileId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading files...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                    <p className="text-gray-600 mt-2">Files I created or that are assigned to me</p>
                </div>
                <Button onClick={handleCreateFile} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New File
                </Button>
            </div>

            <Tabs defaultValue="assigned">
                <TabsList>
                    <TabsTrigger value="mine">My Files</TabsTrigger>
                    <TabsTrigger value="assigned">Marked To Me</TabsTrigger>
                </TabsList>

                <TabsContent value="mine">
                    {renderFilesTable(myFiles, getStatusBadge, formatTimeRemaining)}
                </TabsContent>

                <TabsContent value="assigned">
                    {renderFilesTable(assignedToMe, getStatusBadge, formatTimeRemaining)}
                </TabsContent>
            </Tabs>
                        </div>
    );
}

function renderFilesTable(rows, getStatusBadge, formatTimeRemaining) {
    return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                    Files ({rows.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {rows.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No files found</h3>
                        <p className="text-sm mb-4">No files in this list</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Number</TableHead>
                                        <TableHead>Subject</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Currently Marked To</TableHead>
                                    <TableHead>Last Signed By</TableHead>
                                        <TableHead>Status</TableHead>
                                    <TableHead>TAT</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {rows.map((file) => (
                                        <TableRow key={file.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span>{file.file_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate" title={file.subject}>
                                                    {file.subject || 'No subject'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                            <span className="text-sm">{file.creator_user_name || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                { (file.current_assignee_user_name || file.assigned_to_name) ? (
                                                    <>
                                                        {file.assigned_to_role_name && (
                                                            <Badge variant="secondary">{getRoleDisplayName(file.assigned_to_role_name)}</Badge>
                                                        )}
                                                        <span>{getRoleDisplayName(file.assigned_to_role_name) || file.current_assignee_user_name || file.assigned_to_name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">Unassigned</span>
                                                )}
                                                </div>
                                            </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{getRoleDisplayName(file.last_signed_by_role_name) || file.last_signed_by_name || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(file.status_code)}
                                            </TableCell>
                                        <TableCell>
                                            <span className={`text-sm ${file.sla_breached ? 'text-red-600' : 'text-gray-700'}`}>
                                                {formatTimeRemaining(file.sla_deadline, file.sla_breached)}
                                            </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{new Date(file.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/efilinguser/files/${file.id}` }>
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                {(file.is_creator || file.is_admin) && (
                                                    <Button variant="outline" size="sm" onClick={() => window.location.href = `/efilinguser/files/${file.id}/edit-document` }>
                                                        <FileEdit className="w-4 h-4 mr-1" />
                                                        Edit
                                                            </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
    );
} 