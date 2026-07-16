export type Screen = 'home' | 'profile_client' | 'job_detail' | 'notifications' | 'register_pro' | 'publish_job';

export interface Professional {
  id: string | number;
  name: string;
  category: string;
  trade: string;
  location: string;
  rating: number;
  avatar: string;
}

export interface Job {
  id: string | number;
  title: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'pending'; // <-- ¡Aquí agregamos 'pending'!
  timeAgo: string;
}