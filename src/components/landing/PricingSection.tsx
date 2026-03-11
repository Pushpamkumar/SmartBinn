'use client'

// Pricing section
// SaaS-style pricing plans

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/shared/Button'

interface PricingPlan {
  name: string
  description: string
  price: number
  period: string
  features: string[]
  highlighted?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for small municipalities',
    price: 299,
    period: '/month',
    features: [
      'Up to 50 bins',
      'Real-time monitoring',
      'Basic alerts',
      'Web dashboard',
      'Email support',
      '1 admin user',
    ],
  },
  {
    name: 'Professional',
    description: 'For growing cities and districts',
    price: 799,
    period: '/month',
    features: [
      'Up to 500 bins',
      'Real-time monitoring',
      'Advanced alerts',
      'Mobile app',
      'Route optimization',
      '5 admin users',
      'Priority support',
      'API access',
      'Custom reports',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large-scale operations',
    price: 2499,
    period: '/month',
    features: [
      'Unlimited bins',
      'Real-time monitoring',
      'Advanced alerts',
      'Mobile app',
      'Route optimization',
      'Unlimited admin users',
      '24/7 support',
      'Advanced API',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
]

export const PricingSection: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale from startups to enterprise. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-lg border transition-all duration-300 ${
                plan.highlighted
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl md:scale-105'
                  : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {/* Highlighted badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Billed monthly. Cancel anytime.
                  </p>
                </div>

                {/* CTA Button */}
                <Link href="/auth/login" className="block w-full mb-8">
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                {/* Features list */}
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            All plans include 30-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
