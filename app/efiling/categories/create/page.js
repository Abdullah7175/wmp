"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/efiling/file-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            if (res.ok) router.push('/efiling/categories');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create Category</CardTitle>
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
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
