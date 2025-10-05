import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BrainCircuit, 
  Users, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Star,
  PlayCircle,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-neutral-900">InterviewAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container-max section-padding">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Master Your
                <span className="text-primary-500"> Tech Interviews</span>
                <br />
                with AI-Powered Practice
              </h1>
              <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                Get personalized feedback, practice with real interview questions, and build confidence 
                with our advanced AI interview assistant designed for modern developers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Start Free Practice
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="btn-secondary text-lg px-8 py-4 flex items-center">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose InterviewAI?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven interview techniques 
              to give you the edge you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-full text-2xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="container-max section-padding">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have improved their interview skills with InterviewAI
            </p>
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-max section-padding">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BrainCircuit className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">InterviewAI</span>
            </div>
            <div className="text-neutral-400">
              © 2024 InterviewAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Questions",
    description: "Get personalized interview questions based on your experience level and target role."
  },
  {
    icon: Target,
    title: "Real-time Feedback",
    description: "Receive instant, detailed feedback on your answers with actionable improvement tips."
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed analytics and performance metrics."
  },
  {
    icon: Users,
    title: "Multiple Roles",
    description: "Practice for various positions from junior developer to senior architect roles."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your practice sessions and data are completely secure and confidential."
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get scored feedback immediately after completing each interview question."
  }
]

const steps = [
  {
    title: "Upload Resume",
    description: "Upload your resume and let our AI analyze your background and skills."
  },
  {
    title: "Take Practice Interview",
    description: "Answer AI-generated questions tailored to your experience and target role."
  },
  {
    title: "Get Detailed Feedback",
    description: "Receive comprehensive feedback with scores and improvement suggestions."
  }
]

const stats = [
  { value: "10K+", label: "Practice Sessions" },
  { value: "95%", label: "Success Rate" },
  { value: "500+", label: "Happy Users" },
  { value: "24/7", label: "Available" }
]

export default LandingPage