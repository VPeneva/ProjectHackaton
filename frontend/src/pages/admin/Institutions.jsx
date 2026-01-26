import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInstitutions, useCreateInstitution, useDeleteInstitution } from '@/hooks/useInstitutions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    Building2,
    Plus,
    Trash2,
    ArrowLeft,
    Loader2,
    Tag,
} from 'lucide-react'
import { toast } from 'sonner'

function InstitutionRow({ institution, onDelete }) {
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(institution.id)
        setDeleting(false)
    }

    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{institution.name}</h3>
                        <p className="text-xs text-muted-foreground">
                            {institution._count?.categories || 0} categories
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to={`/admin/categories?institution=${institution.id}`}
                        className="text-sm text-primary hover:underline"
                    >
                        <Tag className="h-4 w-4 inline mr-1" />
                        Manage Categories
                    </Link>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Institution</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{institution.name}"? This will also delete all associated categories.
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
                </div>
            </CardContent>
        </Card>
    )
}

export default function Institutions() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newName, setNewName] = useState('')

    const { data: institutions, isLoading, isError } = useInstitutions()
    const createInstitution = useCreateInstitution()
    const deleteInstitution = useDeleteInstitution()

    const handleCreate = async () => {
        if (!newName.trim()) {
            toast.error('Please enter an institution name')
            return
        }

        try {
            await createInstitution.mutateAsync(newName)
            setNewName('')
            setDialogOpen(false)
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteInstitution.mutateAsync(id)
        } catch (error) {
            // Error handled by mutation
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Institutions</h1>
                        <p className="text-muted-foreground">
                            Manage government institutions that receive reports.
                        </p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Institution
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Institution</DialogTitle>
                            <DialogDescription>
                                Enter the name of the government institution.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Institution name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={createInstitution.isPending}>
                                {createInstitution.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add Institution
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Institutions List */}
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
                        <p className="text-muted-foreground">Failed to load institutions. Please try again.</p>
                    </CardContent>
                </Card>
            ) : institutions?.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Institutions Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Add your first institution to start organizing reports.
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Institution
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {institutions.map((institution) => (
                        <InstitutionRow
                            key={institution.id}
                            institution={institution}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
