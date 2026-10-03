<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PublicAboutController extends Controller
{
    /**
     * Get dynamic metadata and rich content for the public About page.
     */
    public function index(): JsonResponse
    {
        return $this->successResponse([
            'company' => [
                'name' => 'Workforce ERP',
                'tagline' => 'The Operating System for Modern Workforces',
                'headline' => 'Pioneering the Future of Autonomous Workforce ERP',
                'description' => 'Built to replace fragmented, fragile HR and payroll point solutions with a unified, real-time operating system. We empower fast-moving global organizations to operate with precision, empathy, and speed.',
                'founded_year' => 2022,
                'headquarters' => 'San Francisco, CA',
                'certifications' => [
                    'SOC 2 Type II Certified',
                    'ISO 27001 Compliant',
                    'GDPR & CCPA Ready',
                    'Zero-Trust Architecture',
                ],
            ],
            'stats' => [
                [
                    'id' => 'employees',
                    'value' => '250K+',
                    'label' => 'Active Employees Managed',
                    'subtext' => 'Across 45+ countries worldwide',
                    'icon' => 'Users',
                    'highlight' => '+42% YoY',
                ],
                [
                    'id' => 'uptime',
                    'value' => '99.99%',
                    'label' => 'Platform Uptime SLA',
                    'subtext' => 'High-availability distributed cloud',
                    'icon' => 'ShieldCheck',
                    'highlight' => 'Zero Downtime Deploys',
                ],
                [
                    'id' => 'timesheets',
                    'value' => '14M+',
                    'label' => 'Timesheets Processed',
                    'subtext' => 'Real-time punch & approval engine',
                    'icon' => 'Clock',
                    'highlight' => 'Sub-second Sync',
                ],
                [
                    'id' => 'payroll',
                    'value' => '$1.2B+',
                    'label' => 'Processed in Accurate Payroll',
                    'subtext' => 'Zero compliance breaches to date',
                    'icon' => 'DollarSign',
                    'highlight' => 'Multi-Currency',
                ],
            ],
            'story' => [
                'badge' => 'Our Journey',
                'title' => 'Why We Built Workforce ERP',
                'summary' => 'Workforce software was broken. We set out to build the platform we always wished we had.',
                'paragraphs' => [
                    'In 2022, our founding engineers observed enterprise operations teams wrestling with an impossible reality: 6 to 8 disparate tools for employee records, time tracking, leave approvals, compliance auditing, and shift planning.',
                    'Data was perpetually trapped in disconnected silos. Timesheets required endless manual reconciliation, while compliance audits became high-stress emergencies. We asked: Why can\'t workforce management feel as fluid, reliable, and delightful as modern developer software?',
                    'We engineered Workforce ERP from first principles—constructing an enterprise-grade multi-tenant foundation with sub-second latency, cryptographic security, and human-first ergonomics designed to scale effortlessly.',
                ],
                'quote' => [
                    'text' => 'When workforce operations become effortless, leaders can stop wrestling with administrative friction and focus entirely on empowering their people.',
                    'author' => 'Sihab Hasan',
                    'role' => 'Founder & CEO, Workforce ERP',
                ],
            ],
            'values' => [
                [
                    'id' => 'human-first',
                    'title' => 'Human-Centric Ergonomics',
                    'tagline' => 'Crafted for people, not spreadsheets.',
                    'description' => 'We design every screen to respect user focus, streamline daily operations, and grant employees clear ownership over their work and schedules.',
                    'icon' => 'HeartHandshake',
                    'accent' => 'from-rose-500/20 to-pink-500/20 text-rose-500',
                ],
                [
                    'id' => 'security',
                    'title' => 'Uncompromising Security',
                    'tagline' => 'Zero-trust by design, non-negotiable compliance.',
                    'description' => 'From tenant isolation and cryptographic verification to immutable audit trails, we guard sensitive workforce records with banking-grade rigor.',
                    'icon' => 'ShieldCheck',
                    'accent' => 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
                ],
                [
                    'id' => 'velocity',
                    'title' => 'Engineered for Velocity',
                    'tagline' => 'Every millisecond matters.',
                    'description' => 'Workforce tools should never lag. We obsess over instant search, optimistic updates, and background workflows that eliminate bureaucratic delays.',
                    'icon' => 'Zap',
                    'accent' => 'from-amber-500/20 to-yellow-500/20 text-amber-500',
                ],
                [
                    'id' => 'transparency',
                    'title' => 'Radical Transparency',
                    'tagline' => 'Clarity builds high-trust teams.',
                    'description' => 'Clear operational policies, transparent timesheet logs, and traceable approval chains foster mutual trust between staff and executives.',
                    'icon' => 'Eye',
                    'accent' => 'from-blue-500/20 to-cyan-500/20 text-blue-500',
                ],
                [
                    'id' => 'continuous-innovation',
                    'title' => 'Continuous Innovation',
                    'tagline' => 'Evolving alongside modern workstyles.',
                    'description' => 'As hybrid, asynchronous, and distributed work modes transform, our platform continuously deploys automated capabilities to meet new needs.',
                    'icon' => 'Sparkles',
                    'accent' => 'from-purple-500/20 to-indigo-500/20 text-purple-500',
                ],
                [
                    'id' => 'customer-obsession',
                    'title' => 'Customer Obsession',
                    'tagline' => 'Your operational uptime is our benchmark.',
                    'description' => 'We partner closely with People Ops leaders, HR directors, and IT teams to ensure smooth migrations and prompt engineering support.',
                    'icon' => 'Award',
                    'accent' => 'from-orange-500/20 to-red-500/20 text-orange-500',
                ],
            ],
            'timeline' => [
                [
                    'year' => '2022',
                    'quarter' => 'Q2',
                    'title' => 'Founding & First Architecture',
                    'description' => 'Workforce ERP was founded by veteran systems engineers to solve multi-tenant fragmentation in workforce operations.',
                    'tag' => 'Genesis',
                ],
                [
                    'year' => '2023',
                    'quarter' => 'Q1',
                    'title' => 'Multi-Tenant Foundation',
                    'description' => 'Launched the core multi-tenant platform with branch segregation, dynamic department trees, and live attendance tracking.',
                    'tag' => 'Core Engine',
                ],
                [
                    'year' => '2024',
                    'quarter' => 'Q3',
                    'title' => 'Enterprise SSO & Governance',
                    'description' => 'Introduced SAML/OAuth SSO for Google & Microsoft Entra, automated step-up MFA, and Segregation of Duties (SoD) enforcement.',
                    'tag' => 'Security Suite',
                ],
                [
                    'year' => '2025',
                    'quarter' => 'Q2',
                    'title' => 'Global Expansion & Monorepo Scaling',
                    'description' => 'Restructured into an ultra-fast Nx monorepo with universal Vite apps, cross-timezone tracking, and multi-currency payroll hooks.',
                    'tag' => 'Monorepo Scale',
                ],
                [
                    'year' => '2026',
                    'quarter' => 'Present',
                    'title' => 'Autonomous Workforce Intelligence',
                    'description' => 'Rolling out predictive scheduling, real-time timesheet conflict alerts, and streamlined mobile employee portals worldwide.',
                    'tag' => 'Current Era',
                ],
            ],
            'leadership' => [
                [
                    'id' => 'sihab-hasan',
                    'name' => 'Sihab Hasan',
                    'role' => 'Founder & Chief Executive Officer',
                    'department' => 'Executive',
                    'bio' => 'Visionary systems architect with over a decade of experience scaling enterprise cloud infrastructure and modern web applications.',
                    'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                        'github' => 'https://github.com',
                    ],
                ],
                [
                    'id' => 'mashruba-islam',
                    'name' => 'Mashruba Islam',
                    'role' => 'Chief Operating Officer & Head of People',
                    'department' => 'Operations',
                    'bio' => 'Champion of human-first culture and operational governance, dedicated to empowering high-performing distributed organizations.',
                    'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                    ],
                ],
                [
                    'id' => 'julian-vance',
                    'name' => 'Dr. Julian Vance',
                    'role' => 'Chief Technology Officer',
                    'department' => 'Engineering',
                    'bio' => 'Former distributed systems researcher with deep expertise in database performance, high-throughput pipelines, and security cryptography.',
                    'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                        'github' => 'https://github.com',
                    ],
                ],
                [
                    'id' => 'elena-rostova',
                    'name' => 'Elena Rostova',
                    'role' => 'VP of Product Experience',
                    'department' => 'Product',
                    'bio' => 'Passionate product designer transforming intricate enterprise workflows into delightfully intuitive consumer-grade software.',
                    'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                    ],
                ],
                [
                    'id' => 'marcus-thorne',
                    'name' => 'Marcus Thorne',
                    'role' => 'Head of Information Security',
                    'department' => 'Security',
                    'bio' => 'Veteran cyber defense strategist leading zero-trust protocol implementation, compliance frameworks, and vulnerability auditing.',
                    'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                        'github' => 'https://github.com',
                    ],
                ],
                [
                    'id' => 'amina-kalu',
                    'name' => 'Amina Kalu',
                    'role' => 'VP of Customer Success',
                    'department' => 'Customer Success',
                    'bio' => 'Dedicated to accelerating enterprise onboarding and ensuring zero-friction migrations from legacy workforce solutions.',
                    'avatar' => 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
                    'socials' => [
                        'linkedin' => 'https://linkedin.com',
                    ],
                ],
            ],
            'offices' => [
                [
                    'city' => 'San Francisco',
                    'country' => 'United States',
                    'type' => 'Global Headquarters',
                    'address' => '500 Howard Street, Suite 400, San Francisco, CA 94105',
                    'timezone' => 'PST (UTC-8)',
                    'tag' => 'HQ',
                ],
                [
                    'city' => 'London',
                    'country' => 'United Kingdom',
                    'type' => 'EMEA Hub',
                    'address' => '100 Bishopsgate, London EC2N 4AG',
                    'timezone' => 'GMT (UTC+0)',
                    'tag' => 'Europe',
                ],
                [
                    'city' => 'Dhaka',
                    'country' => 'Bangladesh',
                    'type' => 'Engineering Center',
                    'address' => 'Gulshan Avenue, Circle 2, Dhaka 1212',
                    'timezone' => 'BST (UTC+6)',
                    'tag' => 'Tech Center',
                ],
                [
                    'city' => 'Singapore',
                    'country' => 'Singapore',
                    'type' => 'Asia-Pacific Hub',
                    'address' => '1 Marina Boulevard, Level 20, Singapore 018989',
                    'timezone' => 'SGT (UTC+8)',
                    'tag' => 'APAC',
                ],
            ],
            'benefits' => [
                [
                    'title' => 'Distributed First',
                    'description' => 'Work from anywhere with competitive global compensation packages and flexible work arrangements.',
                    'icon' => 'Globe',
                ],
                [
                    'title' => 'Top-Tier Health & Wellness',
                    'description' => 'Comprehensive medical, dental, vision, and mental wellness coverage for you and your dependents.',
                    'icon' => 'Heart',
                ],
                [
                    'title' => 'Continuous Learning',
                    'description' => '$2,500 annual stipend for books, conferences, certifications, and specialized courses.',
                    'icon' => 'BookOpen',
                ],
                [
                    'title' => 'Parental & Family Leave',
                    'description' => '16 weeks of fully paid parental leave for primary and secondary caregivers.',
                    'icon' => 'Smile',
                ],
                [
                    'title' => 'Ergonomic Stipend',
                    'description' => 'Generous budget for 4K monitors, standing desks, and premium ergonomic seating.',
                    'icon' => 'Laptop',
                ],
                [
                    'title' => 'Equity Ownership',
                    'description' => 'Every team member participates directly in company equity and long-term value creation.',
                    'icon' => 'TrendingUp',
                ],
            ],
        ]);
    }
}
