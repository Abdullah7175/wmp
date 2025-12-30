"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DaakCategoriesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/efiling/daak/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast({
                title: "Error",
                description: "Failed to load categories",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/efiling/daak/categories?id=${categoryToDelete.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Category deleted successfully",
                });
                fetchCategories();
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to delete category",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast({
                title: "Error",
                description: "Failed to delete category",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleToggleActive = async (category) => {
        try {
            const res = await fetch('/api/efiling/daak/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: category.id,
                    is_active: !category.is_active
                })
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: `Category ${category.is_active ? 'deactivated' : 'activated'} successfully`,
                });
                fetchCategories();
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to update category",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating category:', error);
            toast({
                title: "Error",
                description: "Failed to update category",
                variant: "destructive",
            });
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Daak Categories</h1>
                    <p className="text-gray-600 mt-1">Manage categories for daak/letters</p>
                </div>
                <Button onClick={() => router.push('/efiling/daak/categories/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Search className="w-5 h-5 mr-2" />
                        Search Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by name, code, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Categories ({filteredCategories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading categories...</span>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No categories found</p>
                            {searchTerm && (
                                <p className="text-sm mt-2">Try adjusting your search term</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="py-3 px-4 font-medium">Name</th>
                                            <th className="py-3 px-4 font-medium">Code</th>
                                            <th className="py-3 px-4 font-medium">Description</th>
                                            <th className="py-3 px-4 font-medium">Color</th>
                                            <th className="py-3 px-4 font-medium">Status</th>
                                            <th className="py-3 px-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCategories.map(cat => (
                                            <tr key={cat.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{cat.name}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline">{cat.code}</Badge>
                                                </td>
                                                <td className="py-3 px-4 max-w-xs truncate">
                                                    {cat.description || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {cat.color ? (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-6 h-6 rounded border border-gray-300"
                                                                style={{ backgroundColor: cat.color }}
                                                            />
                                                            <span className="text-xs text-gray-500">{cat.color}</span>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={cat.is_active ? "default" : "secondary"}
                                                        className={cat.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                    >
                                                        {cat.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/efiling/daak/categories/${cat.id}/edit`)}
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleActive(cat)}
                                                        >
                                                            {cat.is_active ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(cat)}
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            {filteredCategories.length > 0 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={filteredCategories.length}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the category "{categoryToDelete?.name}". 
                            This action cannot be undone. Categories that are in use cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

