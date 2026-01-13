"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Search, Building2, Shield, UserCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Team member roles - these are the subordinates that can be added to teams
const TEAM_MEMBER_ROLES = ['AEE', 'SUB-Engineer', 'AOO', 'AO', 'DAO'];

// Manager roles - these are the team leaders who can have teams
const MANAGER_ROLE_CODES = [
    'XEN', 'RE', 'EE', 'SE', 'CE', 'MD', 'CEO', 'COO', 'CFO', 'CCO', 
    'DIRECTOR', 'COMMITTEE', 'CIA', 'DMD',
    // Common variations
    'EXECUTIVE_ENGINEER', 'SUPERINTENDENT_ENGINEER', 'CHIEF_ENGINEER',
    'DIRECTOR', 'CHIEF_EXECUTIVE_OFFICER', 'CHIEF_OPERATING_OFFICER',
    'CHIEF_FINANCIAL_OFFICER', 'CHIEF_COMERCIAL_OFFICER',
    'DEPUTY_MANAGING_DIRECTOR',
    // Medical and audit roles
    'DIRECTOR_MEDICAL_SERVICES', 'DIRECTOR MEDICAL SERVICES', 'DMS',
    'MEDICAL_SCRUTINY_COMMITTEE', 'MEDICAL SCRUTINY COMMITTEE', 'MSC',
    'CHIEF_INTERNAL_AUDITOR', 'CHIEF INTERNAL AUDITOR','XEN_VPR'
];

const MANAGER_ROLE_NAMES = [
    'EXECUTIVE ENGINEER', 'XEN', 'X-EN',
    'RESIDENT ENGINEER', 'RE',
    'SUPERINTENDENT ENGINEER', 'SENIOR ENGINEER', 'SE',
    'CHIEF ENGINEER', 'CE',
    'MANAGING DIRECTOR', 'MD',
    'CHIEF EXECUTIVE OFFICER', 'CEO',
    'CHIEF OPERATING OFFICER', 'COO',
    'CHIEF FINANCIAL OFFICER', 'CFO',
    'CHIEF COMERCIAL OFFICER', 'CCO',
    'DIRECTOR', 'COMMITTEE', 'CIA',
    'DEPUTY MANAGING DIRECTOR', 'DMD',
    // Medical and audit roles
    'DIRECTOR MEDICAL SERVICES', 'DMS',
    'MEDICAL SCRUTINY COMMITTEE', 'MSC',
    'CHIEF INTERNAL AUDITOR'
];

// Helper function to check if a user is a manager
const isManager = (user) => {
    const roleCode = (user.role_code || '').toUpperCase();
    const roleName = (user.role_name || '').toUpperCase();
    
    // First, explicitly exclude team member roles to avoid false positives
    // This must be checked FIRST before checking for manager roles
    const teamMemberIndicators = ['AEE', 'SUB-ENGINEER', 'SUBENGINEER', 'SUB_ENGINEER', 'SUB-ENGR', 'SUBENGR', 'AOO', 'AO', 'DAO'];
    const isTeamMember = teamMemberIndicators.some(indicator => {
        const indicatorUpper = indicator.toUpperCase();
        // Check if role code starts with or exactly matches team member roles
        return roleCode === indicatorUpper || 
               roleCode.startsWith(indicatorUpper + '_') ||
               roleCode.includes('_' + indicatorUpper + '_') ||
               roleCode.endsWith('_' + indicatorUpper) ||
               // Also check role name
               roleName === indicatorUpper ||
               roleName.includes(' ' + indicatorUpper) ||
               roleName.includes(indicatorUpper + ' ');
    });
    
    if (isTeamMember) {
        return false; // Exclude team members from managers
    }
    
    // Check manager role codes with more precise matching
    // For "EE", make sure it doesn't match "AEE" (already excluded above, but double-check)
    const matchesRoleCode = MANAGER_ROLE_CODES.some(mr => {
        const mrUpper = mr.toUpperCase();
        
        // Special handling for "EE" - must not be preceded by "A"
        if (mrUpper === 'EE' || mrUpper.includes('EXECUTIVE_ENGINEER')) {
            // Only match if it's EE (not AEE) - check it's at start or after underscore, and not after 'A'
            if (roleCode.startsWith('AEE') || roleCode.includes('_AEE') || roleCode.includes(' AEE')) {
                return false; // Don't match AEE
            }
            // Match EE or EXECUTIVE_ENGINEER
            return roleCode === 'EE' ||
                   roleCode === 'EXECUTIVE_ENGINEER' ||
                   roleCode.startsWith('EE_') ||
                   roleCode.includes('_EE_') ||
                   roleCode.endsWith('_EE') ||
                   roleCode.includes('EXECUTIVE_ENGINEER');
        }
        
        // For other roles, use exact match or match as whole word (with underscore boundaries)
        return roleCode === mrUpper ||
               roleCode.startsWith(mrUpper + '_') ||
               roleCode.includes('_' + mrUpper + '_') ||
               roleCode.endsWith('_' + mrUpper);
    });
    
    // Check manager role names
    const matchesRoleName = MANAGER_ROLE_NAMES.some(mrn => {
        const mrnUpper = mrn.toUpperCase();
        // Skip if it's EXECUTIVE ENGINEER and role name contains AEE (Assistant Executive Engineer)
        if ((mrnUpper.includes('EXECUTIVE ENGINEER') || mrnUpper === 'EE' || mrnUpper === 'XEN') && 
            (roleName.includes('ASSISTANT EXECUTIVE ENGINEER') || roleName.includes('AEE'))) {
            return false;
        }
        // Check if role name contains the manager role name as a whole word
        return roleName === mrnUpper ||
               roleName.includes(' ' + mrnUpper + ' ') ||
               roleName.startsWith(mrnUpper + ' ') ||
               roleName.endsWith(' ' + mrnUpper);
    });
    
    return matchesRoleCode || matchesRoleName;
};

export default function TeamsManagement() {
    const { data: session } = useSession();
    const { toast } = useToast();
    
    const [teams, setTeams] = useState([]);
    const [managers, setManagers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState({
        manager_id: '',
        team_member_id: '',
        team_role: ''
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchTeams();
            fetchManagers();
            fetchAllUsers();
        }
    }, [session?.user?.id]);

    const fetchTeams = async () => {
        try {
            // Fetch all teams by getting teams for each manager
            const managersRes = await fetch('/api/efiling/users');
            if (managersRes.ok) {
                const usersData = await managersRes.json();
                const allManagers = Array.isArray(usersData) ? usersData : (usersData.users || []);
                
                // Filter for managers only (XEN/RE/EE/SE/CE/MD/CEO/COO/CFO/CCO/Directors/Committee/CIA/DMD)
                const managersList = allManagers.filter(isManager);
                
                const teamsData = [];
                for (const manager of managersList) {
                    const teamRes = await fetch(`/api/efiling/teams?manager_id=${manager.id}`);
                    if (teamRes.ok) {
                        const teamData = await teamRes.json();
                        if (teamData.team_members && teamData.team_members.length > 0) {
                            teamsData.push({
                                manager: manager,
                                team_members: teamData.team_members
                            });
                        }
                    }
                }
                setTeams(teamsData);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast({
                title: "Error",
                description: "Failed to load teams",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await fetch('/api/efiling/users');
            if (res.ok) {
                const data = await res.json();
                const users = Array.isArray(data) ? data : (data.users || []);
                // Filter for manager roles only (XEN/RE/EE/SE/CE/MD/CEO/COO/CFO/CCO/Directors/Committee/CIA/DMD)
                const managersList = users.filter(isManager);
                setManagers(managersList);
            }
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await fetch('/api/efiling/users');
            if (res.ok) {
                const data = await res.json();
                const users = Array.isArray(data) ? data : (data.users || []);
                setAllUsers(users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // All managers can have team members from these roles
    const getAvailableTeamRoles = (managerId) => {
        // Return the standard team member roles
        return TEAM_MEMBER_ROLES;
    };

    const handleAddTeamMember = async () => {
        if (!formData.manager_id || !formData.team_member_id || !formData.team_role) {
            toast({
                title: "Validation Error",
                description: "Please fill all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const res = await fetch('/api/efiling/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to add team member');
            }

            toast({
                title: "Success",
                description: "Team member added successfully",
            });

            setFormData({ manager_id: '', team_member_id: '', team_role: '' });
            setShowAddDialog(false);
            fetchTeams();
        } catch (error) {
            console.error('Error adding team member:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to add team member",
                variant: "destructive",
            });
        }
    };

    const handleRemoveTeamMember = async (managerId, teamMemberId) => {
        if (!confirm('Are you sure you want to remove this team member?')) {
            return;
        }

        try {
            const res = await fetch(`/api/efiling/teams?manager_id=${managerId}&team_member_id=${teamMemberId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to remove team member');
            }

            toast({
                title: "Success",
                description: "Team member removed successfully",
            });

            fetchTeams();
        } catch (error) {
            console.error('Error removing team member:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to remove team member",
                variant: "destructive",
            });
        }
    };

    const filteredTeams = teams.filter(team => {
        if (selectedManager && team.manager.id !== parseInt(selectedManager)) {
            return false;
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return team.manager.name?.toLowerCase().includes(term) ||
                   team.manager.role_name?.toLowerCase().includes(term) ||
                   team.team_members.some(member => 
                       member.name?.toLowerCase().includes(term) ||
                       member.team_role?.toLowerCase().includes(term)
                   );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg">Loading teams...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Team Management</h1>
                    <p className="text-gray-600">Manage team relationships. Team Leaders: XEN/RE/EE/SE/CE/MD/CEO/COO/CFO/CCO/Directors/Director Medical Services/Medical Scrutiny Committee/CIA/DMD → Team Members: AEE/SUB-Engineer/AOO/AO/DAO</p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Manager (Team Leader)</Label>
                                <Select
                                    value={formData.manager_id}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, manager_id: value, team_role: '' });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(manager => (
                                            <SelectItem key={manager.id} value={String(manager.id)}>
                                                {manager.name} - {manager.role_name} ({manager.role_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* <p className="text-xs text-gray-500 mt-1">
                                    Only showing: XEN, RE, EE, SE, CE, MD, CEO, COO, CFO, CCO, Directors, Committee, CIA, DMD
                                </p> */}
                            </div>

                            {formData.manager_id && (
                                <div>
                                    <Label>Team Role</Label>
                                    <Select
                                        value={formData.team_role}
                                        onValueChange={(value) => setFormData({ ...formData, team_role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getAvailableTeamRoles(formData.manager_id).map(role => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available roles: {getAvailableTeamRoles(formData.manager_id).join(', ')}
                                    </p>
                                </div>
                            )}

                            {formData.manager_id && formData.team_role && (() => {
                                const selectedManager = managers.find(m => m.id === parseInt(formData.manager_id));
                                const managerDepartmentId = selectedManager?.department_id;
                                
                                // Map team role to allowed role codes and names
                                const teamRoleMapping = {
                                    'AEE': {
                                        roleCodes: ['AEE', 'ASSISTANT_EXECUTIVE_ENGINEER', 'ASST_EXECUTIVE_ENGINEER'],
                                        roleNames: ['AEE', 'ASSISTANT EXECUTIVE ENGINEER', 'ASST EXECUTIVE ENGINEER']
                                    },
                                    'SUB-Engineer': {
                                        roleCodes: ['SUB_ENGINEER', 'SUB-ENGINEER', 'SUBENGINEER', 'SUB-ENGR', 'SUBENGR', 'SUB_ENGR'],
                                        roleNames: ['SUB ENGINEER', 'SUB-ENGINEER', 'SUBENGINEER', 'SUB ENGR', 'SUB-ENGR', 'SUBENGR']
                                    },
                                    'AOO': {
                                        roleCodes: ['AOO', 'ASSISTANT_OFFICER', 'ASST_OFFICER'],
                                        roleNames: ['AOO', 'ASSISTANT OFFICER', 'ASST OFFICER', 'ACCOUNTS OFFICER']
                                    },
                                    'AO': {
                                        roleCodes: ['AO', 'ACCOUNT_OFFICER', 'ACCOUNTS_OFFICER'],
                                        roleNames: ['AO', 'ACCOUNT OFFICER', 'ACCOUNTS OFFICER']
                                    },
                                    'DAO': {
                                        roleCodes: ['DAO', 'DISTRICT_ACCOUNT_OFFICER', 'DIS_ACCOUNT'],
                                        roleNames: ['DAO', 'DISTRICT ACCOUNT OFFICER', 'DISTRICT OFFICER']
                                    }
                                };
                                
                                const mapping = teamRoleMapping[formData.team_role] || { roleCodes: [], roleNames: [] };
                                
                                // Filter users: same department, allowed roles, not the manager, and not a manager role
                                // Inside the DialogContent, find where filteredUsers is defined:
                                const filteredUsers = allUsers.filter(user => {
                                    // 1. Get the Selected Manager's Department ID
                                    const selectedManager = managers.find(m => m.id === parseInt(formData.manager_id));
                                    const managerDepartmentId = selectedManager?.department_id;

                                    // 2. Must be from the SAME department as the selected MANAGER
                                    if (user.department_id !== managerDepartmentId) {
                                        return false;
                                    }
                                    
                                    // 3. Must not be the manager himself
                                    if (user.id === parseInt(formData.manager_id)) {
                                        return false;
                                    }
                                    
                                    // 4. Must NOT be a manager role (to prevent adding a Boss as a Subordinate)
                                    if (isManager(user)) {
                                        return false;
                                    }
                                    
                                    // 5. Check if user's role matches the selected 'Team Role' (AEE, AO, etc.)
                                    const userRoleCode = (user.role_code || '').toUpperCase();
                                    const userRoleName = (user.role_name || '').toUpperCase();
                                    
                                    const matchesRoleCode = mapping.roleCodes.some(roleCode => 
                                        userRoleCode === roleCode.toUpperCase() || userRoleCode.includes(roleCode.toUpperCase())
                                    );
                                    const matchesRoleName = mapping.roleNames.some(roleName => 
                                        userRoleName === roleName.toUpperCase() || userRoleName.includes(roleName.toUpperCase())
                                    );
                                    
                                    return matchesRoleCode || matchesRoleName;
                                });
                                
                                return (
                                    <div>
                                        <Label>Team Member</Label>
                                        <Select
                                            value={formData.team_member_id}
                                            onValueChange={(value) => setFormData({ ...formData, team_member_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredUsers.length === 0 ? (
                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                        No users found in this department with role: {formData.team_role}
                                                    </div>
                                                ) : (
                                                    filteredUsers.map(user => (
                                                        <SelectItem key={user.id} value={String(user.id)}>
                                                            {user.name} - {user.role_name} ({user.role_code})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {filteredUsers.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">
                                                No users found in department "{selectedManager?.department_name}" with role "{formData.team_role}"
                                            </p>
                                        )}
                                        {filteredUsers.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Showing {filteredUsers.length} user(s) from department "{selectedManager?.department_name}"
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => {
                                    setShowAddDialog(false);
                                    setFormData({ manager_id: '', team_member_id: '', team_role: '' });
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddTeamMember}>
                                    Add Team Member
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search by manager or team member name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedManager || "__all"} onValueChange={(value) => setSelectedManager(value === "__all" ? "" : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by manager" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all">All Managers</SelectItem>
                                {managers.map(manager => (
                                    <SelectItem key={manager.id} value={String(manager.id)}>
                                        {manager.name} - {manager.role_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Teams List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Teams ({filteredTeams.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTeams.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No teams found</p>
                            <p className="text-sm mt-1">Add team members to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredTeams.map((team) => {
                                return (
                                    <Card key={team.manager.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <UserCheck className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{team.manager.name}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">
                                                                <Shield className="w-3 h-3 mr-1" />
                                                                {team.manager.role_name} ({team.manager.role_code})
                                                            </Badge>
                                                            {team.manager.department_name && (
                                                                <Badge variant="secondary">
                                                                    <Building2 className="w-3 h-3 mr-1" />
                                                                    {team.manager.department_name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-600">
                                                    {team.team_members.length} Team Member{team.team_members.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Team Member</TableHead>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead>Department</TableHead>
                                                        <TableHead>Team Role</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {team.team_members.map((member) => (
                                                        <TableRow key={member.id}>
                                                            <TableCell className="font-medium">
                                                                {member.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {member.role_name} ({member.role_code})
                                                                </Badge>
                                                            </TableCell>
                                                                {member.department_name || team.manager.department_name || 'N/A'}                                                            <TableCell>
                                                                <Badge className="bg-blue-600">
                                                                    {member.team_role}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveTeamMember(team.manager.id, member.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

