<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Illuminate\Database\Seeder;
use RuntimeException;

final class ServiceCatalogSeeder extends Seeder
{
    /**
     * @var list<array{
     *     category: string,
     *     title: string,
     *     slug: string,
     *     description: string
     * }>
     */
    private const SERVICES = [
        // Strategic Communication
        [
            'category' => 'strategic-communication',
            'title' => 'Communication Strategy Development',
            'slug' => 'communication-strategy-development',
            'description' => 'We develop clear and practical communication strategies that connect your organization’s goals with the right audiences, messages, and communication channels. The service provides a structured roadmap for stronger, more consistent communication.',
        ],
        [
            'category' => 'strategic-communication',
            'title' => 'Strategic Communication Audit',
            'slug' => 'strategic-communication-audit',
            'description' => 'We review your current communication practices, content, channels, and internal processes to identify strengths, gaps, and areas for improvement. The audit provides clear recommendations to improve communication effectiveness.',
        ],
        [
            'category' => 'strategic-communication',
            'title' => 'Audience & Stakeholder Intelligence',
            'slug' => 'audience-stakeholder-intelligence',
            'description' => 'We analyze your key audiences and stakeholders to understand their needs, expectations, concerns, and communication preferences. These insights support better planning, engagement, and decision-making.',
        ],
        [
            'category' => 'strategic-communication',
            'title' => 'Strategic Messaging Framework',
            'slug' => 'strategic-messaging-framework',
            'description' => 'We create a clear and consistent messaging framework that defines what your organization should communicate and how it should communicate it. This helps maintain a unified voice across all platforms and departments.',
        ],
        [
            'category' => 'strategic-communication',
            'title' => 'Executive & Organizational Communication',
            'slug' => 'executive-organizational-communication',
            'description' => 'We strengthen leadership communication and internal communication practices to improve clarity, alignment, and trust within the organization. The service also supports stronger executive visibility and employee engagement.',
        ],

        // Public Relations
        [
            'category' => 'public-relations-campaigns',
            'title' => 'Integrated PR Campaigns',
            'slug' => 'integrated-pr-campaigns',
            'description' => 'We plan and manage integrated public relations campaigns that support your organization’s objectives and reach the right audiences. Each campaign includes strategic planning, coordinated execution, and measurable outcomes.',
        ],
        [
            'category' => 'public-relations-campaigns',
            'title' => 'Reputation Management',
            'slug' => 'reputation-management',
            'description' => 'We help organizations build, strengthen, and protect their reputation through proactive communication and continuous monitoring. The service focuses on maintaining credibility and responding effectively to reputation risks.',
        ],
        [
            'category' => 'public-relations-campaigns',
            'title' => 'Media Relations',
            'slug' => 'media-relations',
            'description' => 'We build and manage professional relationships with media outlets, journalists, and relevant industry platforms. The goal is to secure meaningful media coverage and communicate your organization’s stories with credibility.',
        ],
        [
            'category' => 'public-relations-campaigns',
            'title' => 'Crisis Communication',
            'slug' => 'crisis-communication',
            'description' => 'We prepare organizations to communicate confidently and responsibly during challenging situations. This includes crisis planning, message development, response procedures, and guidance for leadership and spokespersons.',
        ],
        [
            'category' => 'public-relations-campaigns',
            'title' => 'Corporate Positioning',
            'slug' => 'corporate-positioning',
            'description' => 'We help define how your organization should be understood and recognized by its audiences and within the market. The service strengthens organizational identity, differentiation, and long-term positioning.',
        ],

        // Training
        [
            'category' => 'training-capacity-building',
            'title' => 'Strategic Communication Training',
            'slug' => 'strategic-communication-training',
            'description' => 'A practical training program that strengthens participants’ skills in communication planning, stakeholder engagement, message development, and strategic decision-making. It can be customized for teams, leaders, or communication professionals.',
        ],
        [
            'category' => 'training-capacity-building',
            'title' => 'Public Relations Training',
            'slug' => 'public-relations-training',
            'description' => 'This training develops professional public relations skills in campaign planning, reputation management, media relations, and stakeholder engagement. It combines strategic knowledge with practical tools and real-world applications.',
        ],
        [
            'category' => 'training-capacity-building',
            'title' => 'Media & Spokesperson Training',
            'slug' => 'media-spokesperson-training',
            'description' => 'We prepare leaders and spokespersons to communicate clearly, confidently, and professionally during interviews, press conferences, and public appearances. The training includes message delivery, interview techniques, and handling difficult questions.',
        ],
        [
            'category' => 'training-capacity-building',
            'title' => 'AI in Strategic Communication',
            'slug' => 'ai-in-strategic-communication',
            'description' => 'This program helps communication professionals use artificial intelligence in planning, research, content development, analysis, and workflow improvement. It focuses on practical and responsible AI applications in communication work.',
        ],
        [
            'category' => 'training-capacity-building',
            'title' => 'Tailored Corporate Programs',
            'slug' => 'tailored-corporate-programs',
            'description' => 'We design customized training programs based on the organization’s goals, challenges, audience, and professional development needs. The content, duration, activities, and delivery method are adapted to each organization.',
        ],

        // Data, AI & Technology
        [
            'category' => 'data-ai-technology',
            'title' => 'Data Analysis & Business Intelligence',
            'slug' => 'data-analysis-business-intelligence',
            'description' => 'We transform business data into clear, actionable insights that help organizations understand performance, identify patterns, uncover opportunities, and make more informed decisions.',
        ],
        [
            'category' => 'data-ai-technology',
            'title' => 'AI Solutions & Automation',
            'slug' => 'ai-solutions-automation',
            'description' => 'We design practical artificial intelligence and automation solutions that reduce repetitive work, improve operational efficiency, and help organizations integrate AI into real business processes.',
        ],
        [
            'category' => 'data-ai-technology',
            'title' => 'Dashboards & Decision Support',
            'slug' => 'dashboards-decision-support',
            'description' => 'We build interactive dashboards and analytical reporting solutions that bring key performance indicators, trends, and business insights into one clear view for faster and better decision-making.',
        ],
        [
            'category' => 'data-ai-technology',
            'title' => 'Software & Digital Solutions',
            'slug' => 'software-digital-solutions',
            'description' => 'We design and develop custom digital systems, web platforms, and software solutions tailored to organizational workflows, operational requirements, and business objectives.',
        ],
        [
            'category' => 'data-ai-technology',
            'title' => 'Technology & AI Consulting',
            'slug' => 'technology-ai-consulting',
            'description' => 'We help organizations evaluate technologies, identify valuable AI opportunities, improve digital operations, and build practical technology roadmaps aligned with their goals and resources.',
        ],
    ];

    public function run(): void
    {
        $categories = ServiceCategory::withTrashed()
            ->whereIn(
                'slug',
                array_values(array_unique(array_column(self::SERVICES, 'category')))
            )
            ->get()
            ->keyBy('slug');

        foreach (self::SERVICES as $serviceData) {
            $category = $categories->get($serviceData['category']);

            if ($category === null) {
                throw new RuntimeException(
                    "Missing service category [{$serviceData['category']}]."
                );
            }

            $service = Service::withTrashed()
                ->where('slug', $serviceData['slug'])
                ->first();

            if ($service === null) {
                Service::query()->create([
                    'category_id' => $category->id,
                    'title' => $serviceData['title'],
                    'slug' => $serviceData['slug'],
                    'description' => $serviceData['description'],
                    'duration_minutes' => null,
                    'price' => '0.00',
                    'currency' => 'USD',
                    'is_active' => true,
                ]);

                continue;
            }

            // Catalog content is authoritative, but operational values are preserved.
            // This intentionally does NOT overwrite:
            // price, currency, duration_minutes, is_active, or deleted_at.
            $service->category_id = $category->id;
            $service->title = $serviceData['title'];
            $service->description = $serviceData['description'];
            $service->save();
        }
    }
}
