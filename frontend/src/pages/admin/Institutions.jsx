import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInstitutions, useCreateInstitution, useDeleteInstitution } from '@/hooks/useInstitutions'
import { useInstitutionUsers, useCreateInstitutionUser, useDeleteInstitutionUser } from '@/hooks/useAdmin'
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
    Users,
} from 'lucide-react'
import { toast } from 'sonner'

function InstitutionRow({ institution, onDelete, onManageUsers }) {
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(institution.id)
        setDeleting(false)
    }

    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold uppercase">{institution.name}</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {institution._count?.categories || 0} categories
                        </p>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {institution._count?.users || 0} portal users
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to={`/admin/categories?institution=${institution.id}`}
                        className="font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                    >
                        <Tag className="h-4 w-4 inline mr-1" />
                        MANAGE CATEGORIES
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageUsers(institution)}
                    >
                        <Users className="h-4 w-4 mr-1" />
                        PORTAL USERS
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                aria-label="Delete institution"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-display text-2xl uppercase">DELETE INSTITUTION</AlertDialogTitle>
                                <AlertDialogDescription className="font-mono text-xs uppercase tracking-wider">
                                    Are you sure you want to delete "{institution.name}"? This will also delete all associated categories.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>CANCEL</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting ? 'DELETING...' : 'DELETE'}
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
    const [manageDialogOpen, setManageDialogOpen] = useState(false)
    const [selectedInstitution, setSelectedInstitution] = useState(null)
    const [newUserName, setNewUserName] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')

    const { data: institutions, isLoading, isError, error } = useInstitutions()
    const createInstitution = useCreateInstitution()
    const deleteInstitution = useDeleteInstitution()
    const { data: institutionUsers = [] } = useInstitutionUsers(selectedInstitution?.id)
    const createInstitutionUser = useCreateInstitutionUser(selectedInstitution?.id)
    const deleteInstitutionUser = useDeleteInstitutionUser(selectedInstitution?.id)

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

    const handleOpenUsers = (institution) => {
        setSelectedInstitution(institution)
        setManageDialogOpen(true)
    }

    const handleCreateInstitutionUser = async () => {
        if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
            toast.error('Name, email, and password are required')
            return
        }

        await createInstitutionUser.mutateAsync({
            name: newUserName.trim(),
            email: newUserEmail.trim(),
            password: newUserPassword,
        })

        setNewUserName('')
        setNewUserEmail('')
        setNewUserPassword('')
    }

    const handleDeleteInstitutionUser = async (userId) => {
        await deleteInstitutionUser.mutateAsync(userId)
    }

    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load institutions. Please try again.'

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8 border-b-3 border-foreground pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin" aria-label="Back to admin">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-5xl uppercase">INSTITUTIONS</h1>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-2">
                            Manage government institutions that receive reports.
                        </p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            ADD INSTITUTION
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl uppercase">ADD NEW INSTITUTION</DialogTitle>
                            <DialogDescription className="font-mono text-xs uppercase tracking-wider">
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
                                CANCEL
                            </Button>
                            <Button onClick={handleCreate} disabled={createInstitution.isPending}>
                                {createInstitution.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                ADD INSTITUTION
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Institutions List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Skeleton className="w-10 h-10" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-48 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            ) : institutions?.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 border-3 border-foreground flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-8 w-8 text-foreground" />
                        </div>
                        <h3 className="font-display text-2xl uppercase mb-2">NO INSTITUTIONS YET</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                            Add your first institution to start organizing reports.
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            ADD FIRST INSTITUTION
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
                            onManageUsers={handleOpenUsers}
                        />
                    ))}
                </div>
            )}

            {/* Institution Users Dialog */}
            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl uppercase">INSTITUTION PORTAL USERS</DialogTitle>
                        <DialogDescription className="font-mono text-xs uppercase tracking-wider">
                            Manage accounts that can access the institution portal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-wider font-medium">Create new account</p>
                            <Input
                                placeholder="Name"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                            <Input
                                placeholder="Email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="Temporary password"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                            />
                            <Button
                                onClick={handleCreateInstitutionUser}
                                disabled={createInstitutionUser.isPending}
                            >
                                {createInstitutionUser.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Users className="h-4 w-4 mr-2" />
                                )}
                                CREATE PORTAL USER
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-wider font-medium">Existing accounts</p>
                            {institutionUsers.length === 0 ? (
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No portal users yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {institutionUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between border-3 border-foreground p-2"
                                        >
                                            <div>
                                                <p className="text-sm font-medium uppercase">{user.name}</p>
                                                <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                aria-label="Delete portal user"
                                                onClick={() => handleDeleteInstitutionUser(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
                            CLOSE
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
