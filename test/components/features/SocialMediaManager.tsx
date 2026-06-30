import React, { useState } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { SocialPost } from '../../types';
import CreateSocialPostModal from '../modals/CreateSocialPostModal';
import { format } from 'date-fns';

const PLATFORMS = {
  Facebook:  { icon: 'ri-facebook-box-fill',  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  Instagram: { icon: 'ri-instagram-fill',       color: 'text-pink-500',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  LinkedIn:  { icon: 'ri-linkedin-box-fill',    color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  Twitter:   { icon: 'ri-twitter-x-fill',       color: 'text-slate-800',  bg: 'bg-slate-100', border: 'border-slate-200' },
  YouTube:   { icon: 'ri-youtube-fill',         color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  WhatsApp:  { icon: 'ri-whatsapp-fill',        color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200' },
};

type Platform = keyof typeof PLATFORMS;

const CONNECTED: Platform[] = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'WhatsApp'];

const SocialMediaManager: React.FC = () => {
  const { socialPosts, updateSocialPost } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'Posted'>('All');

  const filteredPosts = socialPosts
    .filter(p => filterPlatform === 'All' || p.platform === filterPlatform)
    .filter(p => filterStatus === 'All' || p.status === filterStatus)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const totalLikes = socialPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = socialPosts.reduce((s, p) => s + (p.comments || 0), 0);
  const totalShares = socialPosts.reduce((s, p) => s + (p.shares || 0), 0);
  const scheduledCount = socialPosts.filter(p => p.status === 'Scheduled').length;
  const postedCount = socialPosts.filter(p => p.status === 'Posted').length;

  const handleMarkPosted = (post: SocialPost) => {
    updateSocialPost({ ...post, status: 'Posted', likes: Math.floor(Math.random() * 120 + 10), comments: Math.floor(Math.random() * 30), shares: Math.floor(Math.random() * 20) });
  };

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Posts', value: socialPosts.length, icon: 'ri-file-list-3-line', color: 'bg-blue-600' },
          { label: 'Scheduled', value: scheduledCount, icon: 'ri-calendar-schedule-line', color: 'bg-violet-600' },
          { label: 'Published', value: postedCount, icon: 'ri-check-double-line', color: 'bg-emerald-600' },
          { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: 'ri-thumb-up-line', color: 'bg-pink-600' },
          { label: 'Total Shares', value: totalShares.toLocaleString(), icon: 'ri-share-forward-line', color: 'bg-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} text-white text-base`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-5">
          {/* Connected Accounts */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="ri-links-line text-blue-600" /> Connected Channels
            </h3>
            <ul className="space-y-2">
              {CONNECTED.map(platform => {
                const p = PLATFORMS[platform];
                const count = socialPosts.filter(sp => sp.platform === platform).length;
                return (
                  <li key={platform} className={`flex items-center px-3 py-2.5 rounded-xl border ${p.border} ${p.bg}`}>
                    <i className={`${p.icon} ${p.color} text-2xl flex-shrink-0`} />
                    <span className="ml-2.5 text-sm font-semibold text-slate-800 flex-1">{platform}</span>
                    <span className="text-xs text-slate-500 mr-2">{count} posts</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Live</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Create Post */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 mb-2">Create Content</h3>
            <p className="text-xs text-slate-500 mb-4">Schedule posts across all your connected channels at once.</p>
            <button onClick={() => setModalOpen(true)} className="w-full btn-primary justify-center">
              <i className="ri-add-circle-line" /> New Post
            </button>
          </Card>

          {/* Engagement Summary */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="ri-bar-chart-2-line text-blue-600" /> Engagement
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Likes', value: totalLikes, icon: 'ri-thumb-up-fill', color: 'text-pink-500' },
                { label: 'Comments', value: totalComments, icon: 'ri-chat-1-fill', color: 'text-blue-500' },
                { label: 'Shares', value: totalShares, icon: 'ri-share-forward-fill', color: 'text-emerald-500' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <i className={`${m.icon} ${m.color}`} /> {m.label}
                  </span>
                  <span className="font-bold text-slate-900">{m.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Content Feed</h3>
              <div className="flex flex-wrap gap-2">
                {/* Platform filter */}
                <select
                  value={filterPlatform}
                  onChange={e => setFilterPlatform(e.target.value as Platform | 'All')}
                  className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="All">All Platforms</option>
                  {CONNECTED.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as 'All' | 'Scheduled' | 'Posted')}
                  className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Posted">Posted</option>
                </select>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <i className="ri-megaphone-line text-slate-400 text-2xl" />
                </div>
                <p className="text-slate-700 font-semibold">No posts yet</p>
                <p className="text-slate-500 text-sm mt-1">Click "New Post" to create your first scheduled post</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {filteredPosts.map((post: SocialPost) => {
                  const plt = PLATFORMS[post.platform as Platform] || PLATFORMS.Facebook;
                  return (
                    <div key={post.id} className={`p-4 rounded-xl border ${plt.border} ${plt.bg}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <i className={`${plt.icon} ${plt.color} text-2xl flex-shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800">{post.platform}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {format(new Date(post.scheduledDate), 'dd MMM yyyy, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {post.status === 'Posted' ? <><i className="ri-check-line mr-1" />Published</> : <><i className="ri-time-line mr-1" />Scheduled</>}
                          </span>
                          {post.status === 'Scheduled' && (
                            <button
                              onClick={() => handleMarkPosted(post)}
                              className="text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            >
                              Mark Posted
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 leading-relaxed">{post.content}</p>
                      {post.status === 'Posted' && (post.likes || post.comments || post.shares) ? (
                        <div className="flex gap-5 mt-3 pt-2.5 border-t border-white/60 text-sm text-slate-600">
                          <span className="flex items-center gap-1"><i className="ri-thumb-up-line text-pink-500" /> {post.likes ?? 0}</span>
                          <span className="flex items-center gap-1"><i className="ri-chat-1-line text-blue-500" /> {post.comments ?? 0}</span>
                          <span className="flex items-center gap-1"><i className="ri-share-forward-line text-emerald-500" /> {post.shares ?? 0}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {isModalOpen && <CreateSocialPostModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default SocialMediaManager;
