"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts'
import { ChartCard } from "@/components/ui/chart-card"

const emailsSentData = [
  { name: 'Week 1', value: 5000 },
  { name: 'Week 2', value: 7500 },
  { name: 'Week 3', value: 10000 },
  { name: 'Week 4', value: 12500 },
  { name: 'Week 5', value: 15000 },
  { name: 'Week 6', value: 18000 },
]

const clicksByChannelData = [
  { name: 'Email', value: 2500 },
  { name: 'Social Media', value: 1800 },
  { name: 'Website', value: 1200 },
  { name: 'SMS', value: 800 },
]

const incompleteConversionsData = [
  { name: 'Week 1', value: 150 },
  { name: 'Week 2', value: 220 },
  { name: 'Week 3', value: 180 },
  { name: 'Week 4', value: 250 },
  { name: 'Week 5', value: 210 },
  { name: 'Week 6', value: 190 },
]

const emailsSentByChannelData = [
  { name: 'Email', value: 45220 },
  { name: 'Google', value: 20000 },
  { name: 'Facebook', value: 10000 },
  { name: 'Twitter', value: 5000 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const tones = [
  "Concerned", "Hopeful", "Determined", "Respectful", "Passionate",
  "Analytical", "Assertive", "Informative", "Optimistic", "Critical",
  "Pragmatic", "Diplomatic", "Inquisitive",
]

const motives = [
  { id: 'personal', label: 'Personal Impact' },
  { id: 'community', label: 'Community Concern' },
  { id: 'national', label: 'National Interest' },
  { id: 'global', label: 'Global Significance' },
  { id: 'moral', label: 'Moral Imperative' },
]

// Sample data for tone and motive popularity
const tonePopularityData = tones.map(tone => ({ name: tone, value: Math.floor(Math.random() * 1000) }))
const motivePopularityData = motives.map(motive => ({ name: motive.label, value: Math.floor(Math.random() * 1000) }))

// Sample data for tone-motive relationship
const toneMotiveHeatmapData = tones.flatMap((tone, i) => 
  motives.map((motive, j) => ({
    x: i,
    y: j,
    z: Math.floor(Math.random() * 100),
    tone,
    motive: motive.label
  }))
)

export function CampaignDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Campaign: UK General Election 2024</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ChartCard
          title="Total Emails Sent"
          summary={{
            value: "68,000",
            change: "+20% from last week"
          }}
        />
        <ChartCard
          title="Emails Sent via Google"
          summary={{
            value: "45,220",
            change: "66.5% of total emails"
          }}
        />
        <ChartCard
          title="Number of Clicks"
          summary={{
            value: "6,300",
            change: "+15% from last week"
          }}
        />
        <ChartCard
          title="Avg. Time to Complete"
          summary={{
            value: "2m 15s",
            change: "-10s from last week"
          }}
        />
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Emails Sent Since Campaign Start"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailsSentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          }
        />
        <ChartCard
          title="Emails Sent by Channel"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emailsSentByChannelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          }
        />
        <ChartCard
          title="Clicks by Channel"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clicksByChannelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          }
        />
        <ChartCard
          title="Incomplete Conversions Over Time"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incompleteConversionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      </div>
      <h1 className="text-2xl font-bold ">Tone Popularity</h1>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Tone Popularity"
          chart={
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tonePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} interval={0}/>
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          }
        />
        <ChartCard
          title="Motive Popularity"
          chart={
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={motivePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>
      <ChartCard
        title="Tone-Motive Relationship"
        chart={
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart
              margin={{
                top: 20,
                right: 40,
                bottom: 20,
                left: 50,
              }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="tone" tickFormatter={(value) => tones[value]} />
              <YAxis type="number" dataKey="y" name="motive" tickFormatter={(value) => motives[value].label} />
              <ZAxis type="number" dataKey="z" range={[0, 500]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (payload && payload.length) {
                  const { tone, motive, z } = payload[0].payload;
                  return (
                    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
                      <p>{`Tone: ${tone}`}</p>
                      <p>{`Motive: ${motive}`}</p>
                      <p>{`Value: ${z}`}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Scatter data={toneMotiveHeatmapData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        }
      />
    </div>
  );
}