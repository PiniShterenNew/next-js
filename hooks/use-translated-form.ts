// hooks/use-translated-form.ts - פתרון גלובלי לכל הטפסים

import { useForm, UseFormProps, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@/hooks/use-translation'
import { ZodSchema } from 'zod'

// פונקציה שיוצרת resolver מתורגם
function createTranslatedZodResolver<T extends FieldValues>(
  schema: ZodSchema<T>, 
  t: (key: string) => string
) {
  return async (values: T, context: any, options: any) => {
    try {
      const data = await schema.parseAsync(values)
      return {
        values: data,
        errors: {}
      }
    } catch (error: any) {
      const fieldErrors: any = {}
      
      if (error.issues) {
        error.issues.forEach((issue: any) => {
          const path = issue.path.join('.')
          const message = issue.message
          
          // אם זה מפתח תרגום (מתחיל ב-validation.) - תרגם אותו
          const translatedMessage = message.startsWith('validation.') 
            ? t(message) 
            : message
          
          fieldErrors[path] = {
            type: issue.code,
            message: translatedMessage
          }
        })
      }
      
      return {
        values: {},
        errors: fieldErrors
      }
    }
  }
}

// Hook מותאם שמשתמש ב-resolver מתורגם
export function useTranslatedForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  const { t } = useTranslation()
  
  return useForm<T>({
    ...options,
    resolver: createTranslatedZodResolver(schema, t)
  })
}

// Hook פשוט יותר שמקבל resolver קיים ומתרגם אותו
export function useFormWithTranslation<T extends FieldValues>(
  options: UseFormProps<T>
) {
  const { t } = useTranslation()
  const form = useForm<T>(options)
  
  // Override של setError כדי לתרגם הודעות ידניות
  const originalSetError = form.setError
  
  const translatedSetError = (name: any, error: any, config?: any) => {
    if (error?.message && typeof error.message === 'string' && error.message.startsWith('validation.')) {
      error.message = t(error.message)
    }
    return originalSetError(name, error, config)
  }
  
  return {
    ...form,
    setError: translatedSetError
  }
}