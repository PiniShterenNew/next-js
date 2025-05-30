import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Get Started</h1>
        <p className="text-muted-foreground mt-2">
          Create your account to start managing invoices
        </p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "bg-card border border-border shadow-lg"
          }
        }}
      />
    </div>
  )
}