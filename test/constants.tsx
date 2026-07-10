import React from 'react';
import { UserRole, NavLink, ManagementConfig, LeadStatus, SubscriptionStatus, Discount, FeeStructure, SubscriptionPackage, Addon, FeatureKey, Institute, FunctionalityCost } from './types';

// Icons
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> );
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> );
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg> );
const BookIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg> );
const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> );
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg> );
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.23l-.15-.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.23l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg> );
const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg> );
export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> );
const UserCogIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="15" r="3" /><circle cx="9" cy="7" r="4" /><path d="M10 15H6a4 4 0 0 0-4 4v2" /><path d="m21.7 16.4-.9-.3" /><path d="m15.2 13.9-.9-.3" /><path d="m16.6 18.7.3-.9" /><path d="m19.1 12.2.3-.9" /><path d="m19.6 18.7-.4-1" /><path d="m16.8 12.3-.4-1" /><path d="m14.3 16.6 1-.4" /><path d="m20.7 13.8 1-.4" /></svg>);
const WandIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 4V2" /><path d="M15 10v-2" /><path d="M15 16v-2" /><path d="M12.5 6.5L15 4l2.5 2.5" /><path d="M12.5 12.5L15 10l2.5 2.5" /><path d="M12.5 18.5L15 16l2.5 2.5" /><path d="M20 12h2" /><path d="M4 12H2" /><path d="M17.5 17.5L19 19" /><path d="M5 5l1.5 1.5" /><path d="M17.5 6.5L19 5" /><path d="M5 19l1.5-1.5" /><path d="M12 22v-2" /><path d="M12 8V6" /><path d="m8.5 8.5-1-1" /><path d="m3.5 14.5-1-1" /><path d="m8.5 14.5 1-1" /><path d="m3.5 8.5 1-1" /></svg>);
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>);
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>);
const HeartHandshakeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.94 0l.06-.06L12 11l2.96-2.96.06.06a2.17 2.17 0 0 1 3.08 0v0a2.17 2.17 0 0 1 0 3.08L12 17" /></svg>);
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 17" /><polyline points="17 6 23 6 23 12" /></svg> );
export const ResetPasswordIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.73 18a2.64 2.64 0 0 0-3.72 0l-1.15 1.15a2.64 2.64 0 0 1-3.72 0L9.43 15.5a2.64 2.64 0 0 1 0-3.72l1.15-1.15a2.64 2.64 0 0 0 0-3.72l-1.15-1.15a2.64 2.64 0 0 0-3.72 0L3 12.15a2.64 2.64 0 0 0 0 3.72l7.58 7.58a2.64 2.64 0 0 0 3.72 0l1.15-1.15" /><path d="m22 2-7 7" /></svg>);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>);
export const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>);
const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>);
const GanttChartIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 6h10"/><path d="M6 12h9"/><path d="M11 18h7"/></svg>);
const LibraryIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>);
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const PaintbrushIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18.17 3.17a2.828 2.828 0 0 0-4 0L12 5.34l-1.42-1.42a2.828 2.828 0 1 0-4 4L10 11.34 5.34 16a2.828 2.828 0 0 0 0 4l2.83 2.83a2.828 2.828 0 0 0 4 0L16 18.66l4-4Z"/></svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>);
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>);
const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>);
const WorkflowIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>);
const Gamepad2Icon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.01.152v3.516c0 .05.004.1.01.152A4 4 0 0 0 6.68 19h10.64a4 4 0 0 0 3.978-3.59c.006-.052.01-.101.01-.152v-3.516c0-.05-.004-.1-.01-.152A4 4 0 0 0 17.32 5Z"/></svg>);
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>);
const PlugZapIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 2l-2 2.5h3L12 7"/><path d="M10 14v-3"/><path d="M14 14v-3"/><path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3Z"/><path d="M12 22v-3"/><path d="M8 19H4"/><path d="M16 19h4"/></svg>);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>);
const CalculatorIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/></svg>);
const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>);
const FileUpIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>);

export const BASIC_PACKAGE: SubscriptionPackage = {
    id: 'package_basic',
    name: 'Basic',
    price: 3000,
    description: 'Core ERP functionalities for seamless institute management.',
    features: [
        'User Management',
        'Student & Teacher Profiles',
        'Class & Subject Setup',
        'Attendance Tracking',
        'Basic Content Library',
    ],
    maxStudents: 100,
    maxTeachers: 10,
    maxBranchAdmins: 2,
};

export const SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
    BASIC_PACKAGE,
    {
        id: 'package_professional',
        name: 'Professional',
        price: 6000,
        description: 'For growing institutes needing higher limits and more features.',
        features: [
            'All Basic Features',
            'Increased User Limits',
            'Priority Support',
            'Basic Reporting',
        ],
        maxStudents: 200,
        maxTeachers: 20,
        maxBranchAdmins: 4,
    },
    {
        id: 'package_premium_initial',
        name: 'Premium',
        price: 9000,
        description: 'An all-inclusive plan with all features enabled.',
        features: [
            'All Professional Features',
            'Includes AI Power Pack',
            'Includes Business Suite',
        ],
        maxStudents: 400,
        maxTeachers: 40,
        maxBranchAdmins: 8,
    }
];

export const SUBSCRIPTION_ADDONS: Addon[] = [
    {
        id: 'addon_ai',
        name: 'AI Power Pack',
        price: 5000,
        description: 'Unlocks all student and teacher-facing AI tools.',
        includedFeatures: [
            'AI Content Creator (Quiz, Flashcards, Guides)',
            'AI Study Tool for Students',
            'AI Scheduler Assistant',
            'AI Gamification Challenge Generator',
            'AI Help Chatbot',
        ],
        featureKey: FeatureKey.AI_POWER_PACK,
    },
    {
        id: 'addon_business',
        name: 'Business Suite',
        price: 3500,
        description: 'Activates all administrative and growth-oriented modules.',
        includedFeatures: [
            'Lead Management CRM',
            'AI Lead Analytics & Communication',
            'Digital Marketing Suite',
            'Advanced Finance Module',
            'Payment Gateway Integration',
        ],
        featureKey: FeatureKey.BUSINESS_SUITE,
    }
];

export const FUNCTIONALITY_BASE_COSTS: FunctionalityCost[] = [
  { 
    id: 'core_erp', 
    name: 'Core ERP Suite', 
    description: 'User management, attendance, basic library.', 
    cost: 5, 
    unit: 'student' 
  },
  { 
    id: 'ai_content_creator', 
    name: 'AI Content Creator', 
    description: 'AI-powered quiz, flashcard, and guide generation.', 
    unit: 'teacher',
    tiers: [
      { name: 'Standard (Flash)', model: 'gemini-2.5-flash', cost: 20, description: 'Fast and cost-effective for everyday content.' },
      { name: 'Advanced (Pro)', model: 'gemini-pro', cost: 50, description: 'Higher quality generation for complex topics.' }
    ]
  },
  { 
    id: 'ai_study_tool', 
    name: 'AI Study Tool', 
    description: 'Personalized study guide generation for students.', 
    unit: 'student',
    tiers: [
      { name: 'Standard (Flash)', model: 'gemini-2.5-flash', cost: 10, description: 'Good for quick summaries and study notes.' },
      { name: 'Advanced (Pro)', model: 'gemini-pro', cost: 25, description: 'In-depth, high-quality guides for detailed study.' }
    ]
  },
  { 
    id: 'lead_management', 
    name: 'Lead Management CRM', 
    description: 'Includes AI analytics and email generation.', 
    unit: 'institute',
    tiers: [
        { name: 'Standard AI', cost: 500, description: 'Basic AI for email generation.' },
        { name: 'Advanced AI Analytics', cost: 800, description: 'Adds in-depth lead scoring and predictive analytics.' }
    ]
  },
  { 
    id: 'finance_module', 
    name: 'Advanced Finance', 
    description: 'Fee structures, discounts, payment plans.', 
    cost: 400, 
    unit: 'institute' 
  },
  { 
    id: 'gamification', 
    name: 'Gamification Suite', 
    description: 'Create and manage interactive game challenges.', 
    cost: 8, 
    unit: 'student' 
  },
];


export const NAV_LINKS: Record<UserRole, NavLink[]> = {
  [UserRole.ExternalParent]: [
    { label: 'Dashboard',        key: 'dashboard',          icon: HomeIcon },
    { label: 'My Children',      key: 'ext-children',       icon: UsersIcon },
    { label: 'AI Study for Kids',key: 'ext-ai-generator',   icon: SparklesIcon },
    { label: 'AI Reports',       key: 'ext-ai-reports',     icon: BrainIcon },
    { label: 'Saved Content',    key: 'ext-ai-library',     icon: LibraryIcon },
    { label: 'My Subscription',  key: 'ext-subscription',   icon: WalletIcon },
    { label: 'AI Config',        key: 'personal-ai-config', icon: KeyIcon },
    { label: 'My Account',       key: 'ext-account',        icon: UsersIcon },
  ],
  [UserRole.ExternalStudent]: [
    { label: 'Dashboard',        key: 'dashboard',           icon: HomeIcon },
    { label: 'AI Generator',     key: 'ai-generator',        icon: SparklesIcon },
    { label: 'My Study Library', key: 'my-ai-library',       icon: BrainIcon },
    { label: 'Public Library',   key: 'public-library',      icon: LibraryIcon },
    { label: 'Challenges',       key: 'challenges',           icon: ActivityIcon },
    { label: 'My Progress',      key: 'ext-progress',         icon: TrendingUpIcon },
    { label: 'AI Suggestions',   key: 'ai-suggestions',       icon: LightbulbIcon },
    { label: 'My Subscription',  key: 'student-subscription', icon: WalletIcon },
    { label: 'AI Config',        key: 'personal-ai-config',   icon: KeyIcon },
    { label: 'My Profile',       key: 'ext-account',          icon: UsersIcon },
  ],
  [UserRole.ProductOwner]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'User Guide', key: 'user-guide', icon: BookIcon },
    { label: 'Manage Institutes', key: 'institutes', icon: BuildingIcon },
    { label: 'Subscription Management', key: 'subscription-management', icon: LayersIcon },
    { label: 'Subscription Modeler', key: 'subscription-modeler', icon: CalculatorIcon },
    { label: 'Theme Customizer', key: 'theme-customizer', icon: PaintbrushIcon },
    { label: 'Platform Settings', key: 'platform-settings', icon: SettingsIcon },
    { label: 'Platform Masters', key: 'platform-masters', icon: DatabaseIcon },
    { label: 'Data Import Settings', key: 'data-import-settings', icon: FileUpIcon },
    { label: 'System Health', key: 'system-health', icon: ShieldCheckIcon },
    { label: 'Payment Gateway', key: 'payment-gateway', icon: CreditCardIcon },
    { label: 'Mail Center', key: 'mail', icon: MailIcon },
    { label: 'Parent Plans',  key: 'parent-plans',   icon: SparklesIcon },
    { label: 'Student Plans', key: 'student-plans',  icon: BrainIcon },
    { label: 'Role Manager',  key: 'role-manager',   icon: ShieldCheckIcon },
    { label: 'Launch Control', key: 'launch-control', icon: PlugZapIcon },
  ],
  [UserRole.ClassAdmin]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'Branch Management', key: 'branches', icon: BuildingIcon },
    { label: 'User Management', key: 'users', icon: UserCogIcon },
    { label: 'Student Management', key: 'students', icon: UsersIcon },
    { label: 'Teacher Management', key: 'teachers', icon: ClipboardIcon },
    { label: 'Classes & Subjects', key: 'classes-subjects', icon: BookIcon },
    { label: 'Content Library', key: 'library', icon: LibraryIcon },
    { label: 'Content Creator', key: 'content-creator', icon: WandIcon },
    { label: 'Lead Management', key: 'leads', icon: TrendingUpIcon },
    { label: 'Finance', key: 'finance', icon: DollarSignIcon },
    { label: 'Attendance', key: 'attendance', icon: ClipboardIcon },
    { label: 'Scheduler', key: 'scheduler', icon: GanttChartIcon },
    { label: 'Gamification', key: 'gamification', icon: Gamepad2Icon },
    { label: 'Video Conference', key: 'video-conference', icon: VideoIcon },
    { label: 'Mail Center', key: 'mail', icon: MailIcon },
    { label: 'Digital Marketing', key: 'digital-marketing', icon: MegaphoneIcon },
    { label: 'Integrations', key: 'integrations', icon: PlugZapIcon },
    { label: 'Branding', key: 'branding', icon: PaintbrushIcon },
    { label: 'Data Flow & Help', key: 'data-flow', icon: WorkflowIcon },
    { label: 'User Guide', key: 'user-guide', icon: BookIcon },
    { label: 'Settings', key: 'settings', icon: SettingsIcon },
  ],
  [UserRole.BranchAdmin]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'Student Management', key: 'students', icon: UsersIcon },
    { label: 'Teacher Management', key: 'teachers', icon: ClipboardIcon },
    { label: 'Class Management', key: 'classes', icon: BookIcon },
    { label: 'Attendance', key: 'attendance', icon: ClipboardIcon },
    { label: 'Mail Center', key: 'mail', icon: MailIcon },
  ],
  [UserRole.Teacher]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'My Classes', key: 'my-classes', icon: BookIcon },
    { label: 'Content Library', key: 'library', icon: LibraryIcon },
    { label: 'Content Creator', key: 'content-creator', icon: WandIcon },
    { label: 'Assignments & Tests', key: 'assignments-tests', icon: FileTextIcon },
    { label: 'Attendance', key: 'attendance', icon: ClipboardIcon },
    { label: 'Video Conference', key: 'video-conference', icon: VideoIcon },
    { label: 'Scheduler', key: 'scheduler', icon: GanttChartIcon },
  ],
  [UserRole.Student]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'AI Study Tool', key: 'ai-study-tool', icon: WandIcon },
    { label: 'AI Quiz Generator', key: 'ai-generator', icon: SparklesIcon },
    { label: 'My AI Library', key: 'my-ai-library', icon: BrainIcon },
    { label: 'AI Suggestions', key: 'ai-suggestions', icon: LightbulbIcon },
    { label: 'My Courses', key: 'my-courses', icon: BookIcon },
    { label: 'Content Library', key: 'library', icon: LibraryIcon },
    { label: 'Assignments & Tests', key: 'assignments-tests', icon: FileTextIcon },
    { label: 'Online Classes', key: 'video-conference', icon: VideoIcon },
    { label: 'Game Challenges', key: 'gamification', icon: Gamepad2Icon },
    { label: 'My Schedule', key: 'scheduler', icon: GanttChartIcon },
    { label: 'My Progress', key: 'my-progress', icon: TrendingUpIcon },
    { label: 'My Notes', key: 'my-notes', icon: ClipboardIcon },
    { label: 'My Fees', key: 'fee-payment', icon: WalletIcon },
    { label: 'Communication', key: 'communication', icon: MessageSquareIcon },
    { label: 'AI Config', key: 'personal-ai-config', icon: KeyIcon },
    { label: 'My Profile', key: 'my-profile', icon: UsersIcon },
  ],
  [UserRole.Parent]: [
    { label: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { label: 'My Children', key: 'my-children', icon: UsersIcon },
    { label: 'Progress Reports', key: 'parent-reports', icon: TrendingUpIcon },
    { label: 'AI Learning Report', key: 'ai-progress-report', icon: BrainIcon },
    { label: 'Child\'s Progress', key: 'child-progress', icon: ActivityIcon },
    { label: 'Fee Payment', key: 'fee-payment', icon: WalletIcon },
    { label: 'My Subscription', key: 'parent-subscription', icon: ShieldCheckIcon },
    { label: 'AI Config', key: 'personal-ai-config', icon: KeyIcon },
    { label: 'Communication', key: 'communication', icon: MessageSquareIcon },
  ],
};

const renderSubscriptionStatus = (item: Institute) => {
    const status = item.subscriptionStatus;
    const colors = {
        active: 'bg-green-500/20 text-green-300',
        expired: 'bg-red-500/20 text-red-300',
        inactive: 'bg-slate-700 text-slate-400',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

export const MANAGEMENT_CONFIG: ManagementConfig = {
  institutes: {
    label: 'Institutes',
    fields: [
      { name: 'name', label: 'Institute Name', type: 'text', required: true },
      { name: 'adminEmail', label: 'Admin Email', type: 'email', required: true },
      { name: 'adminMobile', label: 'Admin Mobile', type: 'tel', required: true },
      { name: 'logoUrl', label: 'Logo Image URL', type: 'url' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'packageId', label: 'Subscription Package', type: 'select', optionsFromContext: 'packages', required: true },
      { name: 'activeAddonIds', label: 'Active Add-ons', type: 'multiselect', optionsFromContext: 'addons' },
      { name: 'subscriptionExpiry', label: 'Subscription Expiry Date', type: 'date', required: true },
    ],
    columns: [
      { header: 'Institute Name', accessor: 'name' },
      { header: 'Admin Contact', accessor: 'adminEmail', render: (item: Institute) => <div><p>{item.adminEmail}</p><p className="text-xs text-slate-400">{item.adminMobile}</p></div> },
      { header: 'Package', accessor: 'packageId', render: (item: Institute, context) => {
          const pkg = context.getContextData('packages', item.packageId);
          return pkg ? pkg.name : 'N/A';
      }},
      { header: 'Add-ons', accessor: 'activeAddonIds', render: (item: Institute, context) => {
          if (!item.activeAddonIds || item.activeAddonIds.length === 0) return <span className="text-xs text-slate-500">None</span>;
          return item.activeAddonIds.map(id => {
              const addon = context.getContextData('addons', id);
              return <span key={id} className="text-xs mr-1 px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">{addon?.name || 'Unknown'}</span>;
          });
      }},
      { header: 'Status', accessor: 'subscriptionStatus', render: renderSubscriptionStatus },
      { header: 'Expiry', accessor: 'subscriptionExpiry' },
    ],
    csvTemplate: 'name,adminEmail,adminMobile,logoUrl,address,tagline,packageId,activeAddonIds,subscriptionExpiry',
  },
  branches: {
    label: 'Branches',
    singular: 'Branch',
    fields: [
      { name: 'name', label: 'Branch Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'head', label: 'Branch Head', type: 'text' },
    ],
    columns: [
      { header: 'Branch Name', accessor: 'name' },
      { header: 'Location', accessor: 'location' },
      { header: 'Branch Head', accessor: 'head' },
    ],
    csvTemplate: 'name,location,head',
  },
  users: {
    label: 'Users',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel' },
      { name: 'role', label: 'Role', type: 'select', options: [UserRole.ClassAdmin, UserRole.BranchAdmin, UserRole.Teacher], required: true },
      { name: 'branchIds', label: 'Assigned Branches', type: 'multiselect', optionsFromContext: 'branches' },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Role', accessor: 'role' },
      { header: 'Status', accessor: 'status' },
    ],
    csvTemplate: 'name,email,mobile,role,branchIds(semicolon-separated)',
  },
   students: {
    label: 'Students',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel' },
      { name: 'classId', label: 'Class', type: 'select', optionsFromContext: 'classes', required: true },
      { name: 'branchIds', label: 'Branch', type: 'multiselect', optionsFromContext: 'branches', required: true },
      { name: 'subjectIds', label: 'Subjects', type: 'multiselect', optionsFromContext: 'subjects', required: true },
      { name: 'parentName', label: "Parent's Name", type: 'text' },
      { name: 'parentEmail', label: "Parent's Email", type: 'email' },
      { name: 'parentMobile', label: "Parent's Mobile", type: 'tel' },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Class', accessor: 'classId', render: (item, context) => context.getContextData('classes', item.classId)?.name || 'N/A' },
      { header: 'Status', accessor: 'status' },
    ],
     csvTemplate: 'name,email,mobile,classId,branchIds(semicolon-separated),subjectIds(semicolon-separated),parentName,parentEmail,parentMobile',
  },
  teachers: {
    label: 'Teachers',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel' },
      { name: 'subjectIds', label: 'Teaches Subjects', type: 'multiselect', optionsFromContext: 'subjects', required: true },
      { name: 'classIds', label: 'Assigned to Classes', type: 'multiselect', optionsFromContext: 'classes', required: true },
      { name: 'branchIds', label: 'Assigned to Branches', type: 'multiselect', optionsFromContext: 'branches', required: true },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Teaches Subjects', accessor: 'subjectIds', render: (item, context) => item.subjectIds.map((id: string) => context.getContextData('subjects', id)?.name).join(', ') },
      { header: 'Status', accessor: 'status' },
    ],
     csvTemplate: 'name,email,mobile,subjectIds(semicolon-separated),classIds(semicolon-separated),branchIds(semicolon-separated)',
  },
  classes: {
    label: 'Classes',
    singular: 'Class',
    fields: [
      { name: 'name', label: 'Class Name', type: 'text', required: true },
      { name: 'teacherIds', label: 'Assign Teachers', type: 'multiselect', optionsFromContext: 'teachers' },
      { name: 'studentIds', label: 'Assign Students', type: 'multiselect', optionsFromContext: 'students' },
    ],
    columns: [
      { header: 'Class Name', accessor: 'name' },
      { header: 'No. of Students', accessor: 'studentIds', render: (item) => item.studentIds.length },
      { header: 'Assigned Teachers', accessor: 'teacherIds', render: (item, context) => item.teacherIds.map((id: string) => context.getContextData('teachers', id)?.name).join(', ') },
    ],
    csvTemplate: 'name,teacherIds(semicolon-separated),studentIds(semicolon-separated)',
  },
  subjects: {
    label: 'Subjects',
    fields: [
      { name: 'name', label: 'Subject Name', type: 'text', required: true },
      { name: 'category', label: 'Category (e.g., Science)', type: 'text' },
    ],
    columns: [
      { header: 'Subject Name', accessor: 'name' },
      { header: 'Category', accessor: 'category' },
    ],
    csvTemplate: 'name,category',
  },
   leads: {
    label: 'Leads',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel' },
      { name: 'source', label: 'Lead Source', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: Object.values(LeadStatus), required: true },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Contact', accessor: 'email' },
      { header: 'Source', accessor: 'source' },
      { header: 'Status', accessor: 'status' },
      { header: 'Date Added', accessor: 'addedDate' },
    ],
    csvTemplate: 'name,email,mobile,source,status',
  },
   discounts: {
    label: 'Discounts',
    fields: [
      { name: 'name', label: 'Discount Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Percentage', 'Fixed Amount'], required: true },
      { name: 'value', label: 'Value', type: 'number', required: true },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Type', accessor: 'type' },
      { header: 'Value', accessor: 'value', render: (item: Discount) => item.type === 'Percentage' ? `${item.value}%` : `₹${item.value.toLocaleString()}` },
    ],
    csvTemplate: 'name,type,value',
  },
   feeStructures: {
    label: 'Fee Structures',
    fields: [
      { name: 'name', label: 'Structure Name', type: 'text', required: true },
      { name: 'academicYear', label: 'Academic Year', type: 'text', required: true },
      { name: 'totalAmount', label: 'Total Amount (₹)', type: 'number', required: true },
      { name: 'classId', label: 'Applicable Class', type: 'select', optionsFromContext: 'classes' },
      { name: 'branchId', label: 'Applicable Branch', type: 'select', optionsFromContext: 'branches' },
      { name: 'installments', label: 'Installments (e.g., Term 1:50; Term 2:50)', type: 'text' },
      { name: 'lateFeePerDay', label: 'Late Fee per Day (₹)', type: 'number' },
    ],
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Academic Year', accessor: 'academicYear' },
      { header: 'Total Amount', accessor: 'totalAmount', render: (item: FeeStructure) => `₹${item.totalAmount.toLocaleString()}` },
      { header: 'Class', accessor: 'classId', render: (item, context) => context.getContextData('classes', item.classId)?.name || 'All' },
    ],
    csvTemplate: 'name,academicYear,totalAmount,classId,branchId,installments,lateFeePerDay',
  },
};
