"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RoleGroupsPage() {
    const [loading, setLoading] = useState(true);
    const [roleGroups, setRoleGroups] = useState([]);
    const router = useRouter();

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/efiling/role-groups');
            const data = await res.json();
            setRoleGroups(data.roleGroups || []);
        } catch (e) {
            console.error('Failed to load role groups', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this role group?')) return;
        try {
            const res = await fetch(`/api/efiling/role-groups?id=${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Role Groups</h1>
                <Link href="/efiling/role-groups/create">
                    <Button>Create Role Group</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Role Groups</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : roleGroups.length === 0 ? (
                        <div>No role groups found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="py-2 pr-4">Name</th>
                                        <th className="py-2 pr-4">Code</th>
                                        <th className="py-2 pr-4">Patterns</th>
                                        <th className="py-2 pr-4">Active</th>
                                        <th className="py-2 pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roleGroups.map(g => (
                                        <tr key={g.id} className="border-t">
                                            <td className="py-2 pr-4">{g.name}</td>
                                            <td className="py-2 pr-4">{g.code}</td>
                                            <td className="py-2 pr-4">{Array.isArray(g.role_codes) ? g.role_codes.join(', ') : (()=>{ try { return (JSON.parse(g.role_codes||'[]')).join(', ');} catch { return ''; }})()}</td>
                                            <td className="py-2 pr-4">{g.is_active ? 'Yes' : 'No'}</td>
                                            <td className="py-2 pr-4 space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/efiling/role-groups/${g.id}/edit`)}>Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(g.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


