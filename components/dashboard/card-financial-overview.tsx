'use client'

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

const monthlyData = [
  { name: 'Gen', entrate: 12000, uscite: 8000 },
  { name: 'Feb', entrate: 15000, uscite: 9500 },
  { name: 'Mar', entrate: 18000, uscite: 11000 },
  { name: 'Apr', entrate: 14000, uscite: 8500 },
  { name: 'Mag', entrate: 16000, uscite: 10000 },
  { name: 'Giu', entrate: 17000, uscite: 10500 },
]

const expenseData = [
  { name: 'Manutenzioni', value: 35, color: '#1FA9A0' },
  { name: 'Pulizie', value: 25, color: '#FF6B6B' },
  { name: 'Utilities', value: 20, color: '#F59E0B' },
  { name: 'Altro', value: 20, color: '#8B5CF6' },
]

export function CardFinancialOverview() {
  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold mb-6">Overview Finanziaria</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div>
          <h4 className="text-sm text-muted-foreground mb-4">Entrate/Uscite Mensili</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
              <XAxis dataKey="name" stroke="#A1A8B3" />
              <YAxis stroke="#A1A8B3" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1F26', border: '1px solid #2A3441' }} />
              <Legend />
              <Line type="monotone" dataKey="entrate" stroke="#1FA9A0" strokeWidth={2} />
              <Line type="monotone" dataKey="uscite" stroke="#FF6B6B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm text-muted-foreground mb-4">Distribuzione Spese</h4>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="45%"
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={95}
                innerRadius={35}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F26', 
                  border: '1px solid #2A3441',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#F2F4F7', marginBottom: '4px' }}
                itemStyle={{ color: '#F2F4F7' }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend 
                verticalAlign="bottom"
                height={80}
                iconType="square"
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontSize: '13px',
                  color: '#F2F4F7'
                }}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
