"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Settings, LogOut, PlusCircle, ChevronDown, ChevronUp } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DashboardSettings } from "./settings"

const campaigns = [
  "Green Britain Now",
  "End the War in Ukraine",
  "Protect Our Oceans",
]

export function Sidebar({ setActiveView }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCreateCampaign = () => {
    router.push('/admin/new')
  }

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  return (
    <div className="w-64 flex-shrink-0 border-r bg-muted/40 h-screen overflow-y-auto">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Campaign Dashboard</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold">Campaigns</h3>
            <div className="space-y-1">
              {campaigns.map((campaign) => (
                <Button
                  key={campaign}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {campaign}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-primary"
                onClick={handleCreateCampaign}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold">Account</h3>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={toggleSettings}
              >
                <span className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </span>
                {isSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {isSettingsOpen && (
                <div className="pl-4 pr-2 py-2 bg-background rounded-md">
                  <DashboardSettings />
                </div>
              )}
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}