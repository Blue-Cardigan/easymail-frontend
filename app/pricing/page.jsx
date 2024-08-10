'use client'

import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '#',
    priceMonthly: '£49',
    priceAnnually: '£470',
    description: 'Perfect for small organizations or single campaigns.',
    features: [
      '1 active campaign',
      'Up to 500 letters generated per month',
      'Basic analytics',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    href: '#',
    priceMonthly: '£99',
    priceAnnually: '£950',
    description: 'Ideal for growing organizations with multiple campaigns.',
    features: [
      '5 active campaigns',
      'Up to 2,000 letters generated per month',
      'Advanced analytics',
      'Priority email support',
      'Custom campaign branding',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: 'Custom',
    priceAnnually: 'Custom',
    description: 'For large organizations with high-volume needs.',
    features: [
      'Unlimited active campaigns',
      'Unlimited letters generated',
      'Real-time analytics dashboard',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
    ],
    featured: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Pricing() {
    const [frequency, setFrequency] = useState('monthly')
  
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-grow bg-white">
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-base font-semibold leading-7 text-[#77c2af]">Pricing</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Choose the right plan for your campaign
                </p>
              </div>
              <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                Empower your supporters with AI-generated letters. Select the plan that best fits your organization's needs.
              </p>
              <div className="mt-16 flex justify-center">
                <RadioGroup
                  value={frequency}
                  onChange={setFrequency}
                  className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
                >
                  <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
                  <RadioGroup.Option
                    value="monthly"
                    className={({ checked }) =>
                      classNames(
                        checked ? 'bg-[#77c2af] text-white' : 'text-gray-500',
                        'cursor-pointer rounded-full px-2.5 py-1'
                      )
                    }
                  >
                    Monthly
                  </RadioGroup.Option>
                  <RadioGroup.Option
                    value="annually"
                    className={({ checked }) =>
                      classNames(
                        checked ? 'bg-[#77c2af] text-white' : 'text-gray-500',
                        'cursor-pointer rounded-full px-2.5 py-1'
                      )
                    }
                  >
                    Annually
                  </RadioGroup.Option>
                </RadioGroup>
              </div>
              <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={classNames(
                      tier.featured ? 'ring-2 ring-[#77c2af]' : 'ring-1 ring-gray-200',
                      'rounded-3xl p-8 xl:p-10'
                    )}
                  >
                    <div className="flex items-center justify-between gap-x-4">
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.featured ? 'text-[#77c2af]' : 'text-gray-900',
                          'text-lg font-semibold leading-8'
                        )}
                      >
                        {tier.name}
                      </h3>
                      {tier.featured ? (
                        <p className="rounded-full bg-[#77c2af]/10 px-2.5 py-1 text-xs font-semibold leading-5 text-[#77c2af]">
                          Most popular
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                    <p className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-4xl font-bold tracking-tight text-gray-900">
                        {frequency === 'monthly' ? tier.priceMonthly : tier.priceAnnually}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-gray-600">
                        /{frequency === 'monthly' ? 'month' : 'year'}
                      </span>
                    </p>
                    <a
                      href={tier.href}
                      aria-describedby={tier.id}
                      className={classNames(
                        tier.featured
                          ? 'bg-[#77c2af] text-white shadow-sm hover:bg-[#5ba08d]'
                          : 'text-[#77c2af] ring-1 ring-inset ring-[#77c2af] hover:ring-[#5ba08d]',
                        'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#77c2af]'
                      )}
                    >
                      {tier.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                    </a>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <CheckIcon className="h-6 w-5 flex-none text-[#77c2af]" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }