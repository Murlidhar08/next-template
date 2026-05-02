'use client'

import { motion } from 'framer-motion'
import { Camera, CheckCircle2, Edit3, Mail, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { BackHeader } from '@/components/back-header'
import { FooterButtons } from '@/components/footer-buttons'
import { useUserConfig } from '@/components/providers/user-config-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSwap } from '@/components/ui/loading-swap'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth/auth-client'
import { t } from '@/lib/languages/i18n'
import { getInitials } from '@/utility/commonFunction'
import { useCurrentUser } from '@/tanstacks/user'

type ProfileFormValues = {
  name: string
  email: string
  contactNo?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function EditProfilePage() {
  const router = useRouter()
  const { data: user, isLoading } = useCurrentUser()
  const { language } = useUserConfig()

  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      contactNo: user?.contactNo || '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        contactNo: user?.contactNo || '',
      })
    }
  }, [user, reset])

  if (isLoading) return <EditProfileSkeleton />;

  async function onSubmit(data: ProfileFormValues) {
    try {
      const promises = []

      promises.push(
        authClient.updateUser({
          name: data.name,
          contactNo: data.contactNo,
        })
      )

      if (data.email !== user?.email) {
        promises.push(
          authClient.changeEmail({
            newEmail: data.email,
            callbackURL: '/profile',
          })
        )
      }

      const res = await Promise.all(promises)

      const updateUserResult = res[0]
      const emailResult = res[1] ?? { error: false }

      if (updateUserResult?.error) {
        toast.error(updateUserResult.error.message || t("profile_edit.failed_to_update_profile", language))
        return
      }

      if (emailResult?.error) {
        toast.error(emailResult.error.message || t("profile_edit.failed_to_change_email", language))
        return
      }

      if (data.email !== user?.email) {
        toast.success(t("profile_edit.verify_email_notice", language))
      } else {
        toast.success(t("profile_edit.profile_updated_successfully", language))
      }

      router.refresh()
      router.push('/profile' as any)
    } catch (error) {
      toast.error(t("profile_edit.something_went_wrong", language));
      console.error('Something went wrong', error);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative w-full bg-background pb-34"
    >
      <BackHeader title={t("profile_edit.title", language)} backUrl={'/profile' as any} />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center py-10 relative">
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <AvatarImage src={user?.image || ''} />
              <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg cursor-pointer border-4 border-background"
            >
              <Camera className="h-5 w-5" />
            </motion.button>
            <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary/60">{t("profile_edit.upload_new_avatar", language)}</p>
        </motion.section>

        {/* Form Fields */}
        <motion.section variants={itemVariants} className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6">
          <Field
            label={t("profile_edit.name_label", language)}
            icon={User}
            registration={register('name', { required: t("profile_edit.name_required", language) })}
          />

          <Field
            label={t("profile.phone_number", language)}
            icon={Phone}
            registration={register('contactNo')}
            placeholder={t("profile_edit.phone_placeholder", language)}
          />

          <Field
            label={t("profile.email_address", language)}
            icon={Mail}
            type="email"
            disabled={true}
            registration={register('email', { required: t("profile_edit.email_required", language) })}
          />
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
            <CheckCircle2 size={16} className="text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("profile_edit.email_verification_notice", language)}</p>
          </div>
        </motion.section>

        {/* Submit */}
        <FooterButtons>
          <Button
            type="submit"
            className="h-14 w-auto p-8 rounded-full gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 py-2"
          >
            <LoadingSwap isLoading={isSubmitting}>
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <span className="hidden md:block">{t("profile_edit.update_profile_button", language)}</span>
              </div>
            </LoadingSwap>
          </Button>
        </FooterButtons>
      </form>
    </motion.div>
  )
}

function EditProfileSkeleton() {
  const { language } = useUserConfig()
  return (
    <div className="min-h-screen bg-background">
      <BackHeader title={t("profile_edit.title", language)} />
      <div className="flex flex-col items-center py-10 space-y-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mx-auto max-w-lg space-y-6 px-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  registration,
  type = "text",
  disabled = false,
  placeholder = "",
}: {
  label: string
  icon: React.ElementType
  registration: UseFormRegisterReturn
  type?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-60 grayscale-[0.5]" : ""}`}>
      <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative group">
        <Input
          disabled={disabled}
          type={type}
          placeholder={placeholder}
          {...registration}
          className="h-14 rounded-2xl pr-12 bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all duration-300 font-bold"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-transparent flex items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}
