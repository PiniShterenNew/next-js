'use client'

import { useSettings } from '@/hooks/use-settings'
import { SettingsForm } from '@/components/forms/settings-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings as SettingsIcon, 
  User, 
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Database
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { UpdateUserSettingsData } from '@/types'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const { user } = useUser()
  const { settings, loading, error, updateSettings } = useSettings()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const t = useTranslations('settings')

  const handleSubmit = async (data: UpdateUserSettingsData) => {
    await updateSettings(data)
  }

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Export data functionality coming soon')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Account deletion functionality coming soon')
    setShowDeleteDialog(false)
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">{t('form.error')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {t('form.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{t('account.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('account.name')}:</span>
                <span className="text-sm text-muted-foreground">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('account.email')}:</span>
                <span className="text-sm text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('account.status')}:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t('account.active')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('account.memberSince')}:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(user.createdAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Settings Form */}
      {loading ? (
        <SettingsFormSkeleton />
      ) : (
        <SettingsForm
          settings={settings}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      )}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <span>{t('export.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('export.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('export.description')}
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              {t('export.button')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-destructive">{t('delete.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('delete.description')}
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('delete.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Statistics */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{t('statistics.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="gap-2">
                <p className="text-sm font-medium">{t('statistics.nextNumber')}:</p>
                <p className="text-2xl font-bold">
                  {settings.invoicePrefix}-{settings.nextInvoiceNumber.toString().padStart(4, '0')}
                </p>
              </div>
              <div className="gap-2">
                <p className="text-sm font-medium">{t('statistics.taxRate')}:</p>
                <p className="text-2xl font-bold">
                  {Number(settings.taxRate)}%
                  {Number(settings.taxRate) === 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({t('statistics.disabled')})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>{t('delete.confirmTitle')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.confirmDescription')}
              <ul className="list-disc list-inside mt-2 gap-1">
                <li>{t('delete.confirmList.item1')}</li>
                <li>{t('delete.confirmList.item2')}</li>
                <li>{t('delete.confirmList.item3')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete.button')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SettingsFormSkeleton() {
  return (
    <div className="gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent className="gap-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="form-group">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}