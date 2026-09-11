<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\Chatbot\DTOs\ChatProviderRequest;

final readonly class PrPerHourSmartResponder
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

    /**
     * High-confidence first-party answers that can safely bypass the LLM.
     *
     * This intentionally excludes advisory/recommendation rules such as
     * sales-decline analysis and dashboard implementation guidance. Those
     * still go through the configured AI provider during normal operation.
     */
    public function respondAuthoritatively(
        ChatProviderRequest $request,
        bool $isArabic,
    ): ?string {
        $latest = $this->latestUserMessage($request);

        if ($latest === null) {
            return null;
        }

        $normalized = self::normalize($latest);

        /*
         * Only resolve a short confirmation locally when the PREVIOUS user
         * question was itself an authoritative fact question. This prevents
         * a generic "أكيد؟" after an AI recommendation from accidentally
         * bypassing the model.
         */
        if ($this->isConfirmationQuestion($normalized)) {
            $previous = $this->previousUserMessage($request);

            if ($previous !== null) {
                $answer = $this->respondToAuthoritativeText(
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

        return $this->respondToAuthoritativeText(
            $normalized,
            $isArabic,
        );
    }

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
        $authoritative = $this->respondToAuthoritativeText(
            $text,
            $isArabic,
        );

        if ($authoritative !== null) {
            return $authoritative;
        }

        /*
         * The rules below are useful deterministic FALLBACK behavior, but
         * they are not hard company facts. During normal operation they do
         * not bypass the configured AI model.
         */
        if ($this->isSalesDeclineQuestion($text)) {
            return $isArabic
                ? "الخدمة الأنسب كبداية هي **Data Analysis & Business Intelligence**.\n\nيمكن للتحليل أن يساعد في مقارنة أداء المبيعات خلال السنتين، وتحديد أين بدأ الانخفاض في آخر 6 أشهر، وما المنتجات أو الفترات أو القنوات المرتبطة به. وإذا كان المطلوب عرض النتائج للإدارة من لوحة موحدة، يمكن إضافة **Dashboards & Decision Support**."
                : "The best starting point is **Data Analysis & Business Intelligence**.\n\nThe analysis can compare the two years of sales, identify where the last six-month decline started, and surface the products, periods, or channels associated with it. If management also needs a unified visual view, **Dashboards & Decision Support** can complement the analysis.";
        }

        return null;
    }

    private function respondToAuthoritativeText(
        string $text,
        bool $isArabic,
    ): ?string {
        /*
         * Leadership fast-paths are only for pure identity lookups.
         * As soon as the visitor asks about responsibilities, expertise,
         * duties, strategy, or what someone does, the question needs the
         * richer AI path even if it also contains an identity phrase such
         * as "مين مسؤول التكنولوجيا؟".
         */
        if ($this->isLeadershipAdvisoryQuestion($text)) {
            return null;
        }

        if ($this->isInternalTechnicalQuestion($text)) {
            return $isArabic
                ? 'لا أشارك تفاصيل الموديل أو مزود الذكاء الاصطناعي أو التعليمات الداخلية للنظام. أنا **PRIA AI**، ومهمتي تقديم معلومات دقيقة عن PR Per Hour وخدماتها.'
                : "I can't share internal model, AI-provider, system-prompt, or implementation details. I'm **PRIA AI**, and I'm here to provide accurate information about PR Per Hour and its services.";
        }

        $asksTechnology = $this->isTechnologyIdentityQuestion(
            $text,
        );

        $asksExecutive = $this->isExecutiveIdentityQuestion(
            $text,
        );

        /*
         * Compound identity questions often state the identity cue only
         * once, for example:
         *
         *   "مين مسؤول التكنولوجيا؟ والمدير التنفيذي؟"
         *   "Who is the Head of Technology and the CEO?"
         *
         * Detect that structure explicitly instead of making bare role
         * titles authoritative everywhere. This keeps questions such as
         * "شو مسؤوليات المدير التنفيذي؟" on the AI path.
         */
        $asksTechnologyAndExecutive =
            $this->isTechnologyAndExecutiveIdentityQuestion(
                $text,
            );

        if ($asksTechnologyAndExecutive) {
            return $isArabic
                ? '**أنس معالي** هو **رئيس قسم التكنولوجيا** في PR Per Hour. أما منصب المدير التنفيذي، فلا تتضمن المعلومات الرسمية المتاحة حاليًا اسمًا موثقًا لهذا المنصب، لذلك لن أخمّن.'
                : '**Anas Maali** is the **Head of Technology** at PR Per Hour. The currently available official information does not identify a CEO, so I will not guess.';
        }

        if ($asksExecutive) {
            return $isArabic
                ? 'لا تتضمن المعلومات الرسمية المتاحة حاليًا اسمًا موثقًا للمدير التنفيذي في PR Per Hour، لذلك لن أخمّن.'
                : 'The currently available official PR Per Hour information does not identify a CEO, so I will not guess.';
        }

        if ($this->isGeneralManagerIdentityQuestion($text)) {
            return $isArabic
                ? 'إذا كان المقصود **المدير التنفيذي (CEO)**، فلا تتضمن المعلومات الرسمية المتاحة حاليًا اسمًا موثقًا لهذا المنصب. أما **فاتنة معالي** فهي **المؤسس والمستشار الرئيسي** في PR Per Hour.'
                : 'If you mean the **CEO**, the currently available official information does not identify a person in that role. **Fatina Maali** is the **Founder & Principal Consultant** at PR Per Hour.';
        }

        if ($this->isFounderIdentityQuestion($text)) {
            return $isArabic
                ? '**فاتنة معالي** هي **المؤسس والمستشار الرئيسي** في PR Per Hour.'
                : '**Fatina Maali** is the **Founder & Principal Consultant** at PR Per Hour.';
        }

        if ($asksTechnology) {
            return $isArabic
                ? '**أنس معالي** هو **رئيس قسم التكنولوجيا** في PR Per Hour.'
                : '**Anas Maali** is the **Head of Technology** at PR Per Hour.';
        }

        /*
         * Whether a dashboard can refresh continuously is determined by
         * the available source systems and integration design. PR Per Hour
         * does not promise a universal real-time capability, so this
         * safety-sensitive capability question is answered deterministically
         * instead of allowing a model to speculate.
         */
        if ($this->isDashboardRealtimeQuestion($text)) {
            return $isArabic
                ? "وتيرة تحديث لوحة المعلومات تعتمد على **مصدر البيانات وآلية الربط المتاحة** لكل حالة، لذلك لا يمكن تحديد وتيرة ثابتة مسبقًا.\n\nيمكن تصميم **Dashboards & Decision Support** لعرض المؤشرات من مكان موحد، وتحديد آلية التحديث المناسبة بعد تقييم البنية التقنية ومصادر البيانات."
                : "Dashboard refresh frequency depends on the **available data sources and integration setup**, so a fixed refresh frequency cannot be promised in advance.\n\n**Dashboards & Decision Support** can provide a unified view of key indicators, with the appropriate refresh approach determined after evaluating the technical setup and data sources.";
        }

        if ($this->isAuthoritativeContactQuestion($text)) {
            return $this->contactReply($isArabic);
        }

        return $this->categoryServicesReply(
            $text,
            $isArabic,
        );
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

    private function isInternalTechnicalQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'system prompt',
            'show me your prompt',
            'internal instructions',
            'system instructions',
            'تعليماتك الداخلية',
            'التعليمات الداخلية',
            'برومبت النظام',
            'api key',
            'مفتاح api',
            'مفتاح الـ api',
            'model اللي شغال عندك',
            'الموديل اللي شغال عندك',
            'شو الموديل المستخدم',
            'أي موديل تستخدم',
            'اي موديل تستخدم',
            'ما هو الموديل المستخدم',
            'what model are you using',
            'which model are you using',
            'what ai model are you using',
            'which ai model do you use',
            'which provider are you using',
            'what provider are you using',
            'are you using groq',
            'هل تستخدم groq',
            'هل تستعمل groq',
        ]);
    }

    private function isGeneralManagerIdentityQuestion(
        string $text,
    ): bool {
        if ($this->containsAny($text, [
            'المدير التنفيذي',
            'مدير تنفيذي',
            'ceo',
            'chief executive',
            'executive director',
        ])) {
            return false;
        }

        return $this->containsAny($text, [
            'انو المدير عندكم',
            'منو المدير عندكم',
            'مينو المدير عندكم',
            'مين المدير عندكم',
            'من المدير عندكم',
            'مين المدير بالشركة',
            'منو المدير بالشركة',
            'who is your manager',
            'who is the manager at pr per hour',
        ]);
    }

    private function isLeadershipAdvisoryQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'مسؤوليات',
            'المسؤوليات',
            'مهام',
            'المهام',
            'شو بعمل',
            'شو بيعمل',
            'ماذا يفعل',
            'ماذا تعمل',
            'ما دوره',
            'شو دوره',
            'ما دور',
            'خبرة',
            'خبرته',
            'خبرتها',
            'خبرات',
            'تخصص',
            'تخصصه',
            'تخصصها',
            'responsibilities',
            'responsibility',
            'duties',
            'what does',
            'what do they do',
            'experience',
            'expertise',
            'specialization',
            'role of',
            'what is the role',
        ]);
    }

    private function isTechnologyAndExecutiveIdentityQuestion(
        string $text,
    ): bool {
        $mentionsTechnology = $this->containsAny($text, [
            'مسؤول التكنولوجيا',
            'رئيس قسم التكنولوجيا',
            'مدير التكنولوجيا',
            'المسؤول عن التكنولوجيا',
            'head of technology',
            'technology lead',
            'technology manager',
            'responsible for technology',
        ]);

        $mentionsExecutive = $this->containsAny($text, [
            'المدير التنفيذي',
            'مدير تنفيذي',
            'ceo',
            'chief executive',
            'executive director',
        ]);

        if (! $mentionsTechnology || ! $mentionsExecutive) {
            return false;
        }

        return $this->containsAny($text, [
            'مين مسؤول',
            'من مسؤول',
            'من هو مسؤول',
            'مين رئيس',
            'من هو رئيس',
            'مين المدير',
            'من المدير',
            'من هو المدير',
            'who is',
            'who handles',
            'who leads',
            'who is responsible',
        ]);
    }

    private function isFounderIdentityQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'مين المؤسس',
            'من المؤسس',
            'من هو المؤسس',
            'من هي المؤسس',
            'مين أسس',
            'من أسس',
            'who is the founder',
            'who founded',
            'who is founder',
            'founder of pr per hour',
        ]);
    }

    private function isTechnologyIdentityQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'مين مسؤول التكنولوجيا',
            'من مسؤول التكنولوجيا',
            'من هو مسؤول التكنولوجيا',
            'مين رئيس قسم التكنولوجيا',
            'من هو رئيس قسم التكنولوجيا',
            'مين مدير التكنولوجيا',
            'من هو مدير التكنولوجيا',
            'مين المسؤول عن التكنولوجيا',
            'من المسؤول عن التكنولوجيا',
            'who handles technology',
            'who is the head of technology',
            'who is head of technology',
            'who leads technology',
            'who is responsible for technology',
        ]);
    }

    private function isExecutiveIdentityQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'مين المدير التنفيذي',
            'من المدير التنفيذي',
            'من هو المدير التنفيذي',
            'مين ceo',
            'من هو ceo',
            'who is the ceo',
            'who is ceo',
            'who is the chief executive',
            'who is the executive director',
        ]);
    }

    private function isDashboardRealtimeQuestion(string $text): bool
    {
        $dashboard = $this->containsAny($text, [
            'dashboard',
            'dashboards',
            'الداشبورد',
            'داشبورد',
            'لوحة المعلومات',
            'لوحات المعلومات',
            'لوحة بيانات',
            'لوحات بيانات',
            'لوحة المتابعة',
            'لوحة متابعة',
            /*
             * Short conversational follow-ups commonly refer back to the
             * already-discussed dashboard simply as "اللوحة". This remains
             * safe enough here because a dashboard term alone is NOT
             * sufficient: the same question must also contain an explicit
             * real-time/update intent below.
             */
            'اللوحة',
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

    private function isAuthoritativeContactQuestion(
        string $text,
    ): bool {
        return $this->containsAny($text, [
            'كيف اتواصل',
            'كيف أتواصل',
            'بدي اتواصل معكم',
            'بدي أتواصل معكم',
            'اتواصل معكم كيف',
            'أتواصل معكم كيف',
            'كيف بقدر اتواصل معكم',
            'كيف بقدر أتواصل معكم',
            'وين اتواصل معكم',
            'وين أتواصل معكم',
            'طرق التواصل',
            'بيانات التواصل',
            'معلومات التواصل',
            'البريد الإلكتروني',
            'البريد الالكتروني',
            'ايميلكم',
            'إيميلكم',
            'ايميل الشركة',
            'إيميل الشركة',
            'رقم الهاتف',
            'رقم التواصل',
            'رقمكم',
            'موقعكم',
            'موقع الشركة',
            'how can i contact',
            'how do i contact',
            'how can i reach',
            'contact details',
            'contact information',
            'email address',
            'your email',
            'phone number',
            'your phone',
            'your website',
            'website address',
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
