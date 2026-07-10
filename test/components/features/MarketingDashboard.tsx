import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; }> = ({ title, value, change, icon }) => (
    <Card>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 uppercase">{title}</p>
            <div className="text-indigo-400">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        <p className="text-sm text-green-600 mt-1">{change}</p>
    </Card>
);

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];

const BarChart: React.FC<{ data: { label: string; value: number }[]; unit?: string }> = ({ data, unit = '' }) => {
    if (data.length === 0) {
        return <p className="text-slate-400 text-sm text-center mt-8">No campaign data yet.</p>;
    }
    const max = Math.max(...data.map(d => d.value), 1);
    const chartH = 160;
    const barWidth = Math.min(40, Math.floor(320 / data.length) - 8);
    const gap = Math.floor(320 / data.length);

    return (
        <svg viewBox={`0 0 ${Math.max(320, data.length * gap + 20)} ${chartH + 40}`} className="w-full" aria-label="Campaign performance bar chart">
            {data.map((d, i) => {
                const barH = Math.max(4, (d.value / max) * chartH);
                const x = i * gap + gap / 2 - barWidth / 2;
                const y = chartH - barH;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barWidth} height={barH} rx="4" fill={COLORS[i % COLORS.length]} fillOpacity="0.85" />
                        <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#64748b">
                            {unit}{d.value % 1 === 0 ? d.value : d.value.toFixed(1)}
                        </text>
                        <text x={x + barWidth / 2} y={chartH + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
                            {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
                        </text>
                    </g>
                );
            })}
            <line x1="0" y1={chartH} x2={Math.max(320, data.length * gap + 20)} y2={chartH} stroke="#e2e8f0" strokeWidth="1" />
        </svg>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) {
        return <p className="text-slate-400 text-sm text-center mt-8">No channel data yet.</p>;
    }
    const cx = 90; const cy = 90; const r = 70; const inner = 40;
    let cumAngle = -Math.PI / 2;
    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(cumAngle);
        const y1 = cy + r * Math.sin(cumAngle);
        cumAngle += angle;
        const x2 = cx + r * Math.cos(cumAngle);
        const y2 = cy + r * Math.sin(cumAngle);
        const xi1 = cx + inner * Math.cos(cumAngle - angle);
        const yi1 = cy + inner * Math.sin(cumAngle - angle);
        const xi2 = cx + inner * Math.cos(cumAngle);
        const yi2 = cy + inner * Math.sin(cumAngle);
        const large = angle > Math.PI ? 1 : 0;
        return {
            path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`,
            color: COLORS[i % COLORS.length],
            pct: ((d.value / total) * 100).toFixed(0),
            label: d.label,
        };
    });

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <svg viewBox="0 0 180 180" className="w-44 h-44 flex-shrink-0" aria-label="Channel breakdown donut chart">
                {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} fillOpacity="0.9" />)}
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">Channels</text>
            </svg>
            <div className="space-y-2 text-sm">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-slate-600">{s.label}</span>
                        <span className="font-semibold text-slate-800 ml-auto pl-4">{s.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarketingDashboard: React.FC = () => {
    const { googleAdCampaigns, emailCampaigns, socialPosts } = useAppContext();

    const totalAdSpend = googleAdCampaigns.reduce((sum, camp) => sum + camp.budget, 0);
    const avgOpenRate = emailCampaigns.length > 0
        ? (emailCampaigns.reduce((sum, camp) => sum + camp.openRate, 0) / emailCampaigns.length).toFixed(1)
        : '0';
    const totalEngagement = socialPosts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);

    const barData = emailCampaigns.slice(0, 6).map(c => ({ label: c.name, value: c.openRate }));
    const channelData = [
        { label: 'Google Ads', value: totalAdSpend },
        { label: 'Email', value: emailCampaigns.length * 100 },
        { label: 'Social', value: totalEngagement },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Ad Spend"
                    value={`₹${(totalAdSpend / 1000).toFixed(1)}k`}
                    change="+5.2% vs last month"
                    icon={<i className="ri-google-fill text-2xl"></i>}
                />
                <StatCard
                    title="Avg. Email Open Rate"
                    value={`${avgOpenRate}%`}
                    change="+1.8% vs last campaign"
                    icon={<i className="ri-mail-open-fill text-2xl"></i>}
                />
                <StatCard
                    title="Social Engagement"
                    value={totalEngagement.toLocaleString()}
                    change="+12% this week"
                    icon={<i className="ri-thumb-up-fill text-2xl"></i>}
                />
                <StatCard
                    title="New Leads (Marketing)"
                    value="128"
                    change="+8 from social media"
                    icon={<i className="ri-user-add-fill text-2xl"></i>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Email Campaign Open Rates</h3>
                    <div className="h-56 flex items-end overflow-x-auto">
                        {barData.length > 0
                            ? <BarChart data={barData} unit="" />
                            : <p className="text-slate-400 text-sm m-auto">No email campaigns yet.</p>
                        }
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-right">Open rate % per campaign</p>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Channel Breakdown</h3>
                    <div className="h-56 flex items-center justify-center">
                        {channelData.length > 0
                            ? <DonutChart data={channelData} />
                            : <p className="text-slate-400 text-sm">No marketing channel data yet.</p>
                        }
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MarketingDashboard;
