"use client"

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function DashboardSettings() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState('5')
  const [dateRange, setDateRange] = useState('7')
  const [theme, setTheme] = useState('light')

  const handleSave = () => {
    // Logic to save settings
    console.log('Settings saved:', { autoRefresh, refreshInterval, dateRange, theme })
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <label htmlFor="auto-refresh">Auto Refresh</label>
        <Switch
          id="auto-refresh"
          checked={autoRefresh}
          onCheckedChange={setAutoRefresh}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="refresh-interval">Refresh Interval</label>
        <Select
          id="refresh-interval"
          value={refreshInterval}
          onValueChange={setRefreshInterval}
          disabled={!autoRefresh}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 minute</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="date-range">Date Range</label>
        <Select
          id="date-range"
          value={dateRange}
          onValueChange={setDateRange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="theme">Theme</label>
        <Select
          id="theme"
          value={theme}
          onValueChange={setTheme}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} className="w-full">Save Settings</Button>
    </div>
  )
}