import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: FileText,
    title: 'Smart Invoice Management',
    description: 'Create, send, and track professional invoices with ease. Automated reminders and payment tracking.',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Organize your customer database with detailed profiles and payment history.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    description: 'Get insights into your revenue, payment patterns, and business growth.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-level security with automatic data backups and compliance features.',
  },
]

const benefits = [
  'Professional invoice templates',
  'Automated payment reminders',
  'Multi-currency support',
  'Real-time payment tracking',
  'Customer portal access',
  'Mobile-responsive design',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">InvoicePro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container-responsive text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-3 h-3 mr-1" />
              Now with AI-powered features
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Streamline Your 
              <span className="text-primary"> Invoice Management</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create professional invoices, track payments, and manage customers 
              with our intuitive platform designed for modern businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by thousands of businesses worldwide
              </p>
              <div className="flex items-center justify-center space-x-8 opacity-60">
                <Globe className="w-6 h-6" />
                <span className="text-sm font-medium">Global</span>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium">Secure</span>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium">Fast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-secondary/10">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to save you time and help your business grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-spacing">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why choose InvoicePro?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of businesses that have streamlined their invoicing 
                process and improved their cash flow.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link href="/sign-up">
                  <Button size="lg">
                    Get Started Today
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Invoice #INV-0001</h3>
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span>Acme Corporation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">₪5,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600">Paid on time</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Automatically sent reminder</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-responsive text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to streamline your invoicing?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of businesses already using InvoicePro to manage their invoices efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-75">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container-responsive py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">InvoicePro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 InvoicePro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}