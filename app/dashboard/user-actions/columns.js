"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

const getActionTypeBadge = (actionType) => {
    const variants = {
        'CREATE': 'default',
        'UPDATE': 'secondary',
        'DELETE': 'destructive',
        'VIEW': 'outline',
        'LOGIN': 'default',
        'LOGOUT': 'outline',
        'UPLOAD': 'default',
        'DOWNLOAD': 'secondary',
        'ASSIGN': 'default',
        'UNASSIGN': 'outline',
        'APPROVE': 'default',
        'REJECT': 'destructive',
        'EXPORT': 'secondary',
        'IMPORT': 'default'
    };

    return (
        <Badge variant={variants[actionType] || 'outline'}>
            {actionType}
        </Badge>
    );
};

const getUserTypeBadge = (userType) => {
    const variants = {
        'user': 'default',
        'agent': 'secondary',
        'socialmediaperson': 'outline'
    };

    const labels = {
        'user': 'User',
        'agent': 'Agent',
        'socialmediaperson': 'Media Cell'
    };

    return (
        <Badge variant={variants[userType] || 'outline'}>
            {labels[userType] || userType}
        </Badge>
    );
};

const getEntityTypeBadge = (entityType) => {
    const variants = {
        'request': 'default',
        'image': 'secondary',
        'video': 'outline',
        'user': 'default',
        'agent': 'secondary',
        'socialmediaperson': 'outline',
        'town': 'default',
        'district': 'secondary',
        'subtown': 'outline',
        'complaint_type': 'default',
        'complaint_subtype': 'secondary',
        'final_video': 'outline',
        'notification': 'default',
        'role': 'secondary'
    };

    const labels = {
        'request': 'Request',
        'image': 'Image',
        'video': 'Video',
        'user': 'User',
        'agent': 'Agent',
        'socialmediaperson': 'Media Cell',
        'town': 'Town',
        'district': 'District',
        'subtown': 'Subtown',
        'complaint_type': 'Complaint Type',
        'complaint_subtype': 'Complaint Subtype',
        'final_video': 'Final Video',
        'notification': 'Notification',
        'role': 'Role'
    };

    return (
        <Badge variant={variants[entityType] || 'outline'}>
            {labels[entityType] || entityType}
        </Badge>
    );
};

const getRoleLabel = (userType, role) => {
    if (userType === 'user') {
        const userRoles = {
            1: 'Admin',
            2: 'Manager',
            3: 'User',
            4: 'Viewer'
        };
        return userRoles[role] || `Role ${role}`;
    } else if (userType === 'agent') {
        const agentRoles = {
            1: 'Executive Engineer',
            2: 'Contractor'
        };
        return agentRoles[role] || `Role ${role}`;
    } else if (userType === 'socialmediaperson') {
        const smRoles = {
            1: 'Camera Man',
            2: 'Helper',
            3: 'Photographer',
            4: 'Video Editor',
            5: 'Content Creator',
            6: 'Social Media Manager'
        };
        return smRoles[role] || `Role ${role}`;
    }
    return `Role ${role}`;
};

export const columns = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            return <span className="font-mono text-sm">{row.getValue("id")}</span>;
        },
    },
    {
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => {
            const userType = row.original.user_type;
            const userRole = row.original.user_role;
            return (
                <div className="space-y-1">
                    <div className="font-medium">{row.getValue("user_name")}</div>
                    <div className="text-sm text-gray-500">{row.original.user_email}</div>
                    <div className="text-xs text-gray-400">
                        {getRoleLabel(userType, userRole)}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "user_type",
        header: "User Type",
        cell: ({ row }) => {
            return getUserTypeBadge(row.getValue("user_type"));
        },
    },
    {
        accessorKey: "action_type",
        header: "Action",
        cell: ({ row }) => {
            return getActionTypeBadge(row.getValue("action_type"));
        },
    },
    {
        accessorKey: "entity_type",
        header: "Entity",
        cell: ({ row }) => {
            const entityType = row.getValue("entity_type");
            const entityId = row.original.entity_id;
            const entityName = row.original.entity_name;
            
            return (
                <div className="space-y-1">
                    {getEntityTypeBadge(entityType)}
                    {entityName && (
                        <div className="text-sm text-gray-600">{entityName}</div>
                    )}
                    {entityId && (
                        <div className="text-xs text-gray-400">ID: {entityId}</div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "ip_address",
        header: "IP Address",
        cell: ({ row }) => {
            const ip = row.getValue("ip_address");
            return ip ? (
                <span className="font-mono text-sm text-gray-600">{ip}</span>
            ) : (
                <span className="text-gray-400 text-sm">-</span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Timestamp",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="space-y-1">
                    <div className="text-sm font-medium">
                        {date.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                        {date.toLocaleTimeString()}
                    </div>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const action = row.original;
            
            return (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            // Show details in a modal or expand row
                            console.log('Action details:', action);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    {action.entity_id && action.entity_type && (
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href={`/dashboard/${action.entity_type}/${action.entity_id}`}>
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            );
        },
    },
]; 