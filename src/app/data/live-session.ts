export type Weekday = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export interface LiveSessionSchedule {
  courseId: string;
  days: Weekday[];
  time: string;           // ex: '18h00 - 19h30'
  timezone: string;        // ex: 'GMT (heure de Ouagadougou)'
  meetingUrl?: string;     
  roomName?: string; 
  isLive: boolean;         
}

// TODO (Salomon) : remplacer par un appel API qui charge le planning réel du cours.
export const LIVE_SCHEDULES: Record<string, LiveSessionSchedule> = {
  'comp-01': {
    courseId: 'comp-01',
    days: ['mardi', 'vendredi', 'samedi'],
    time: '18h00 - 19h30',
    timezone: 'GMT (heure de Ouagadougou)',
    isLive: false,
  },
};

export function fallbackSchedule(courseId: string): LiveSessionSchedule {
  return {
    courseId,
    days: ['mardi', 'vendredi'],
    time: '18h00 - 19h30',
    timezone: 'GMT (heure de Ouagadougou)',
    isLive: false,
  };
}