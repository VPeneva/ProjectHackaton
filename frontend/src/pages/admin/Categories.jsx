import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { useInstitutions } from '@/hooks/useInstitutions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Tag,
    Plus,
    Trash2,
    ArrowLeft,
    Loader2,
    Building2,
} from 'lucide-react'
import { toast } from 'sonner'

function CategoryRow({ category, onDelete }) {
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(category.id)
        setDeleting(false)
    }

    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.institution && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {category.institution.name}
                            </p>
                        )}
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"? Reports using this category will be affected.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}

export default function Categories() {
    const [searchParams] = useSearchParams()
    const preselectedInstitution = searchParams.get('institution') || ''

    const [dialogOpen, setDialogOpen] = useState(false)
    const [newName, setNewName] = useState('')
    const [selectedInstitution, setSelectedInstitution] = useState(preselectedInstitution)
    const [filterInstitution, setFilterInstitution] = useState(preselectedInstitution)

    const { data: institutions } = useInstitutions()
    const { data: categories, isLoading, isError } = useCategories(filterInstitution || undefined)
    const createCategory = useCreateCategory()
    const deleteCategory = useDeleteCategory()

    useEffect(() => {
        if (preselectedInstitution) {
            setSelectedInstitution(preselectedInstitution)
            setFilterInstitution(preselectedInstitution)
        }
    }, [preselectedInstitution])

    const handleCreate = async () => {
        if (!newName.trim()) {
            toast.error('Please enter a category name')
            return
        }
        if (!selectedInstitution) {
            toast.error('Please select an institution')
            return
        }

        try {
            await createCategory.mutateAsync({
                name: newName,
                institutionId: parseInt(selectedInstitution),
            })
            setNewName('')
            setDialogOpen(false)
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteCategory.mutateAsync(id)
        } catch (error) {
            // Error handled by mutation
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage report categories for each institution.
                        </p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                                Create a category linked to an institution.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Institution</label>
                                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutions?.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id.toString()}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Category Name</label>
                                <Input
                                    placeholder="Category name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={createCategory.isPending}>
                                {createCategory.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add Category
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <Select value={filterInstitution || "all"} onValueChange={(val) => setFilterInstitution(val === "all" ? "" : val)}>
                    <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Filter by institution" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Institutions</SelectItem>
                        {institutions?.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id.toString()}>
                                {inst.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Categories List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border-0 shadow-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-48 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Failed to load categories. Please try again.</p>
                    </CardContent>
                </Card>
            ) : categories?.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            {filterInstitution
                                ? 'No categories for this institution.'
                                : 'Add your first category to start organizing reports.'}
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {categories.map((category) => (
                        <CategoryRow
                            key={category.id}
                            category={category}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
