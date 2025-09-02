'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CreateFileType() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        code: '',
        requiresApproval: true
    });

    useEffect(() => {
        if (session?.user) {
            loadCategories();
        }
    }, [session]);

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/efiling/file-categories?is_active=true');
            if (response.ok) {
                const data = await response.json();
                console.log('Categories loaded:', data);
                setCategories(data.categories || []);
            } else {
                console.error('Failed to load categories:', response.status);
                const errorData = await response.json();
                console.error('Categories error data:', errorData);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleInputChange = (field, value) => {
        console.log(`Setting ${field} to:`, value);
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.categoryId || !formData.code) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            
            const response = await fetch('/api/efiling/file-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: session.user.id,
                    ipAddress: '127.0.0.1',
                    userAgent: navigator.userAgent
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "File type created successfully",
                });
                router.push('/efiling/file-types');
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to create file type",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error creating file type:', error);
            toast({
                title: "Error",
                description: "Failed to create file type",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return <div>Please sign in to access this page.</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create File Type</h1>
                    <p className="text-muted-foreground">
                        Define a new file type with its workflow requirements
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Define the essential details for this file type
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">File Type Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Water Bulk Work Order"
                                />
                            </div>

                            <div>
                                <Label htmlFor="code">File Type Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="e.g., WB_WO"
                                />
                            </div>

                            <div>
                                <Label htmlFor="categoryId">Category *</Label>
                                <Select 
                                    value={formData.categoryId || undefined} 
                                    onValueChange={(value) => handleInputChange('categoryId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category">
                                            {formData.categoryId && categories.find(cat => cat.id == formData.categoryId)?.name}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the purpose and scope of this file type..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="requiresApproval"
                                checked={formData.requiresApproval}
                                onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                            />
                            <Label htmlFor="requiresApproval">Requires approval workflow</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !formData.name || !formData.categoryId || !formData.code}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create File Type
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
