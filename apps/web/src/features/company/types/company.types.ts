export interface CompanyInfo {
  name: string;
  tagline: string;
  headline: string;
  description: string;
  founded_year: number;
  headquarters: string;
  certifications: string[];
}

export interface CompanyStat {
  id: string;
  value: string;
  label: string;
  subtext: string;
  icon: string;
  highlight: string;
}

export interface CompanyStory {
  badge: string;
  title: string;
  summary: string;
  paragraphs: string[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
}

export interface CompanyValue {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
}

export interface TimelineMilestone {
  year: string;
  quarter: string;
  title: string;
  description: string;
  tag: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface CompanyOffice {
  city: string;
  country: string;
  type: string;
  address: string;
  timezone: string;
  tag: string;
}

export interface CompanyBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface AboutPageData {
  company: CompanyInfo;
  stats: CompanyStat[];
  story: CompanyStory;
  values: CompanyValue[];
  timeline: TimelineMilestone[];
  leadership: LeadershipMember[];
  offices: CompanyOffice[];
  benefits: CompanyBenefit[];
}
