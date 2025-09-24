"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/efiling/categories');
                const data = res.ok ? await res.json() : [];
                setCategories(Array.isArray(data) ? data : []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const deactivate = async (id) => {
        await fetch('/api/efiling/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: false }) });
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: false } : c));
    };

    const remove = async (id) => {
        await fetch(`/api/efiling/categories?id=${id}`, { method: 'DELETE' });
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">File Categories</h1>
                <Link href="/efiling/categories/create"><Button>Create Category</Button></Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : categories.length === 0 ? (
                        <div>No categories found</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Code</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Department</th>
                                    <th className="py-2">Work Related</th>
                                    <th className="py-2">Active</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} className="border-t">
                                        <td className="py-2">{cat.name}</td>
                                        <td className="py-2">{cat.code || '-'}</td>
                                        <td className="py-2 max-w-xs truncate">{cat.description || '-'}</td>
                                        <td className="py-2">{cat.department_name || '-'}</td>
                                        <td className="py-2">{cat.is_work_related ? 'Yes' : 'No'}</td>
                                        <td className="py-2">{cat.is_active ? 'Yes' : 'No'}</td>
                                        <td className="py-2 flex gap-2">
                                            <Link href={`/efiling/categories/${cat.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
                                            {cat.is_active ? (
                                                <Button variant="outline" size="sm" onClick={() => deactivate(cat.id)}>Deactivate</Button>
                                            ) : null}
                                            <Button variant="destructive" size="sm" onClick={() => remove(cat.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
