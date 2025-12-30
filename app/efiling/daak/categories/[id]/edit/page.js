"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditDaakCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        color: "#3B82F6",
        is_active: true
    });

    useEffect(() => {
        if (params.id) {
            fetchCategory();
        }
    }, [params.id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/efiling/daak/categories?id=${params.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.category) {
                    setFormData({
                        name: data.category.name || "",
                        code: data.category.code || "",
                        description: data.category.description || "",
                        color: data.category.color || "#3B82F6",
                        is_active: data.category.is_active !== undefined ? data.category.is_active : true
                    });
                } else {
                    throw new Error('Category not found');
                }
            } else {
                throw new Error('Failed to load category');
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            toast({
                title: "Error",
                description: "Failed to load category data",
                variant: "destructive",
            });
            router.push('/efiling/daak/categories');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = "Name is required";
        }
        
        if (!formData.code || formData.code.trim().length === 0) {
            newErrors.code = "Code is required";
        } else if (formData.code.trim().length < 2) {
            newErrors.code = "Code must be at least 2 characters";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form",
                variant: "destructive",
            });
            return;
        }
        
        setSaving(true);
        try {
            const res = await fetch('/api/efiling/daak/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: parseInt(params.id),
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    description: formData.description.trim() || null,
                    color: formData.color || null,
                    is_active: formData.is_active
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast({
                    title: "Success",
                    description: "Category updated successfully",
                });
                router.push('/efiling/daak/categories');
            } else {
                throw new Error(data.error || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to update category",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading category data...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Daak Category</h1>
                    <p className="text-gray-600 mt-1">Update category information</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                    <CardDescription>Update the details for this category</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Official Letter"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="e.g., OFF"
                                    className={errors.code ? "border-red-500" : ""}
                                    maxLength={10}
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.code}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">Unique code for this category (max 10 characters)</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the purpose of this category..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleInputChange('color', e.target.value)}
                                    className="w-20 h-10"
                                />
                                <Input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => handleInputChange('color', e.target.value)}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Color used for category badges and display</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Configuration</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active Category
                                </Label>
                            </div>
                            <p className="text-sm text-gray-500">
                                Active categories are available for selection when creating daak
                            </p>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !formData.name || !formData.code}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Category
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

