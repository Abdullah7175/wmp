"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/efiling/file-categories?id=${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setName(data.name || "");
                setDescription(data.description || "");
                setIsActive(Boolean(data.is_active));
            }
        })();
    }, [params.id]);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch('/api/efiling/file-categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Number(params.id), name, description, is_active: isActive })
            });
            router.push('/efiling/categories');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active" />
                            <label htmlFor="active">Active</label>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
