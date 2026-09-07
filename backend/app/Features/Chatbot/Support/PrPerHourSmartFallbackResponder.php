<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\Chatbot\DTOs\ChatProviderRequest;

final readonly class PrPerHourSmartFallbackResponder
{
    /**
     * Arabic/alternate aliases used only to locate an authoritative
     * database category. Service names themselves still come from the DB.
     *
     * @var array<string, list<string>>
     */
    private const CATEGORY_ALIASES = [
        'data ai technology' => [
            'البيانات والذكاء الاصطناعي والتكنولوجيا',
            'البيانات والذكاء الاصطناعي',
            'خدمات الذكاء الاصطناعي',
            'خدمات البيانات والذكاء الاصطناعي',
            'ai services',
            'data ai',
        ],
        'strategic communication' => [
            'الاتصال الاستراتيجي',
        ],
        'public relations campaigns' => [
            'حملات العلاقات العامة',
            'العلاقات العامة',
        ],
        'training capacity building' => [
            'التدريب وبناء القدرات',
            'بناء القدرات',
        ],
    ];

    public function __construct(
        private PrPerHourKnowledgeBuilder $knowledgeBuilder,
    ) {}

    public function respond(
        ChatProviderRequest $request,
        bool $isArabic,
    ): ?string {
        $latest = $this->latestUserMessage($request);

        if ($latest === null) {
            return null;
        }

        $normalized = self::normalize($latest);

        /*
         * A very short follow-up such as "أكيد؟" should still work when
         * Groq fails. Resolve it against the previous visitor question
         * rather than falling back to generic company copy.
         */
        if ($this->isConfirmationQuestion($normalized)) {
            $previous = $this->previousUserMessage($request);

            if ($previous !== null) {
                $answer = $this->respondToText(
                    self::normalize($previous),
                    $isArabic,
                );

                if ($answer !== null) {
                    return $isArabic
                        ? "نعم، بالتأكيد. {$answer}"
                        : "Yes. {$answer}";
                }
            }
        }

        return $this->respondToText($normalized, $isArabic);
    }

    private function respondToText(
        string $text,
        bool $isArabic,
    ): ?string {
        $asksTechnology = $this->containsAny($text, [
            'مسؤول التكنولوجيا',
            'رئيس قسم التكنولوجيا',
            'مدير التكنولوجيا',
            'المسؤول عن التكنولوجيا',
            'head of technology',
            'technology lead',
            'technology manager',
            'responsible for technology',
            'who handles technology',
        ]);

        $asksExecutive = $this->containsAny($text, [
            'المدير التنفيذي',
            'مدير تنفيذي',
            'ceo',
            'chief executive',
            'executive director',
        ]);

        if ($asksTechnology && $asksExecutive) {
            return $isArabic
                ? '**أنس معالي** هو **رئيس قسم التكنولوجيا** في PR Per Hour. أما منصب المدير التنفيذي، فلا تتضمن المعلومات الرسمية المتاحة حاليًا اسمًا موثقًا لهذا المنصب، لذلك لن أخمّن.'
                : '**Anas Maali** is the **Head of Technology** at PR Per Hour. The currently available official information does not identify a CEO, so I will not guess.';
        }

        if ($asksExecutive) {
            return $isArabic
                ? 'لا تتضمن المعلومات الرسمية المتاحة حاليًا اسمًا موثقًا للمدير التنفيذي في PR Per Hour، لذلك لن أخمّن.'
                : 'The currently available official PR Per Hour information does not identify a CEO, so I will not guess.';
        }

        if ($this->containsAny($text, [
            'مين المؤسس',
            'من المؤسس',
            'من هي المؤسس',
            'من هو المؤسس',
            'المؤسس',
            'founder',
            'who founded',
        ])) {
            return $isArabic
                ? '**فاتنة معالي** هي **المؤسس والمستشار الرئيسي** في PR Per Hour.'
                : '**Fatina Maali** is the **Founder & Principal Consultant** at PR Per Hour.';
        }

        if ($asksTechnology) {
            return $isArabic
                ? '**أنس معالي** هو **رئيس قسم التكنولوجيا** في PR Per Hour.'
                : '**Anas Maali** is the **Head of Technology** at PR Per Hour.';
        }

        if ($this->isDashboardRealtimeQuestion($text)) {
            return $isArabic
                ? "وتيرة تحديث لوحة المعلومات ليست ثابتة تلقائيًا؛ بل تعتمد على مصدر البيانات وآلية الربط المتاحة لكل حالة.\n\nيمكن تصميم **Dashboards & Decision Support** لعرض المؤشرات من مكان موحد، مع تحديد وتيرة التحديث المناسبة وفق البنية التقنية ومصادر البيانات."
                : "A dashboard does not have a guaranteed automatic refresh frequency; it depends on the available data sources and integration setup.\n\n**Dashboards & Decision Support** can provide a unified management view with a refresh schedule appropriate to the technical setup.";
        }

        if ($this->isSalesDeclineQuestion($text)) {
            return $isArabic
                ? "الخدمة الأنسب كبداية هي **Data Analysis & Business Intelligence**.\n\nيمكن للتحليل أن يساعد في مقارنة أداء المبيعات خلال السنتين، وتحديد أين بدأ الانخفاض في آخر 6 أشهر، وما المنتجات أو الفترات أو القنوات المرتبطة به. وإذا كان المطلوب عرض النتائج للإدارة من لوحة موحدة، يمكن إضافة **Dashboards & Decision Support**."
                : "The best starting point is **Data Analysis & Business Intelligence**.\n\nThe analysis can compare the two years of sales, identify where the last six-month decline started, and surface the products, periods, or channels associated with it. If management also needs a unified visual view, **Dashboards & Decision Support** can complement the analysis.";
        }

        if ($this->isContactQuestion($text)) {
            return $this->contactReply($isArabic);
        }

        $categoryReply = $this->categoryServicesReply(
            $text,
            $isArabic,
        );

        if ($categoryReply !== null) {
            return $categoryReply;
        }

        return null;
    }

    private function categoryServicesReply(
        string $text,
        bool $isArabic,
    ): ?string {
        $isCategoryListQuestion = $this->containsAny($text, [
            'كل الخدمات',
            'الخدمات الموجودة ضمن',
            'الخدمات ضمن',
            'خدمات الذكاء الاصطناعي',
            'خدمات البيانات والذكاء الاصطناعي',
            'all services',
            'services under',
            'services within',
            'services in data',
            'ai services',
        ]);

        if (! $isCategoryListQuestion) {
            return null;
        }

        $knowledge = $this->knowledgeBuilder->build();

        foreach ($knowledge['service_categories'] as $category) {
            $canonical = self::normalize($category['name']);

            $mentioned = str_contains($text, $canonical);

            if (! $mentioned) {
                foreach (self::CATEGORY_ALIASES[$canonical] ?? [] as $alias) {
                    if (str_contains($text, self::normalize($alias))) {
                        $mentioned = true;

                        break;
                    }
                }
            }

            if (! $mentioned) {
                continue;
            }

            $services = $category['services'];

            if ($services === []) {
                return $isArabic
                    ? "لا توجد خدمات فعّالة معروضة حاليًا ضمن **{$category['name']}**."
                    : "There are currently no active services listed under **{$category['name']}**.";
            }

            $items = array_map(
                static fn (array $service): string => '- **'.$service['title'].'**',
                $services,
            );

            $intro = $isArabic
                ? "ضمن **{$category['name']}**، الخدمات المتاحة حاليًا هي:"
                : "The currently available services under **{$category['name']}** are:";

            return $intro."\n\n".implode("\n", $items);
        }

        return null;
    }

    private function contactReply(bool $isArabic): string
    {
        $company = (array) config('chatbot.company', []);

        $website = (string) ($company['website'] ?? '');
        $email = (string) ($company['email'] ?? '');
        $phone = (string) ($company['phone'] ?? '');

        if ($isArabic) {
            return implode("\n", [
                'يمكن التواصل مع **PR Per Hour** عبر:',
                '',
                "- الموقع: {$website}",
                "- البريد الإلكتروني: {$email}",
                "- الهاتف: {$phone}",
            ]);
        }

        return implode("\n", [
            'You can contact **PR Per Hour** through:',
            '',
            "- Website: {$website}",
            "- Email: {$email}",
            "- Phone: {$phone}",
        ]);
    }

    private function isDashboardRealtimeQuestion(string $text): bool
    {
        $dashboard = $this->containsAny($text, [
            'dashboard',
            'dashboards',
            'لوحة المعلومات',
            'لوحات المعلومات',
            'لوحة بيانات',
            'لوحات بيانات',
        ]);

        $realtime = $this->containsAny($text, [
            'real time',
            'realtime',
            'لحظي',
            'لحظيا',
            'لحظياً',
            'تحديث فوري',
            'مزامنة فورية',
            'live data',
            'live dashboard',
            'instant update',
        ]);

        return $dashboard && $realtime;
    }

    private function isSalesDeclineQuestion(string $text): bool
    {
        $sales = $this->containsAny($text, [
            'مبيعات',
            'المبيعات',
            'sales',
        ]);

        $decline = $this->containsAny($text, [
            'نزلت',
            'انخفض',
            'انخفاض',
            'تراجع',
            'هبوط',
            'decline',
            'declined',
            'drop',
            'dropped',
            'decrease',
            'down',
        ]);

        return $sales && $decline;
    }

    private function isContactQuestion(string $text): bool
    {
        return $this->containsAny($text, [
            'كيف اتواصل',
            'كيف أتواصل',
            'التواصل',
            'ايميل',
            'إيميل',
            'البريد',
            'رقم الهاتف',
            'رقم التواصل',
            'contact',
            'email',
            'phone number',
            'website',
        ]);
    }

    private function isConfirmationQuestion(string $text): bool
    {
        return in_array($text, [
            'أكيد',
            'متأكد',
            'متأكدة',
            'are you sure',
            'sure',
            'really',
        ], true);
    }

    private function latestUserMessage(
        ChatProviderRequest $request,
    ): ?string {
        foreach (array_reverse($request->history) as $message) {
            if ($message->role === 'user') {
                return $message->content;
            }
        }

        return null;
    }

    private function previousUserMessage(
        ChatProviderRequest $request,
    ): ?string {
        $messages = [];

        foreach ($request->history as $message) {
            if ($message->role === 'user') {
                $messages[] = $message->content;
            }
        }

        if (count($messages) < 2) {
            return null;
        }

        return $messages[count($messages) - 2];
    }

    /**
     * @param list<string> $needles
     */
    private function containsAny(
        string $text,
        array $needles,
    ): bool {
        foreach ($needles as $needle) {
            if (str_contains($text, self::normalize($needle))) {
                return true;
            }
        }

        return false;
    }

    private static function normalize(string $text): string
    {
        $text = mb_strtolower(trim($text), 'UTF-8');

        $text = str_replace('&', ' ', $text);

        $text = preg_replace(
            '/[^\p{L}\p{N}\s]+/u',
            ' ',
            $text,
        ) ?? $text;

        return trim(
            preg_replace('/\s+/u', ' ', $text) ?? $text,
        );
    }
}
