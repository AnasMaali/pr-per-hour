<?php

declare(strict_types=1);

return [
    'registration_success' => 'تم إنشاء الحساب بنجاح.',
    'registration_verification_required' => 'تم إنشاء الحساب. يُرجى التحقق من بريدك الإلكتروني باستخدام الرمز الذي أرسلناه.',
    'email_verification_required' => 'يُرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول. يمكن طلب رمز التحقق في الشاشة التالية.',
    'login_success' => 'تم تسجيل الدخول بنجاح.',
    'logout_success' => 'تم تسجيل الخروج بنجاح.',
    'profile_update_success' => 'تم تحديث الملف الشخصي بنجاح.',
    'me_success' => 'تم استرجاع بيانات المستخدم المصادق عليه بنجاح.',
    'unauthenticated' => 'يجب تسجيل الدخول للمتابعة.',
    'forbidden' => 'ليست لديك صلاحية لتنفيذ هذا الإجراء.',
    'invalid_credentials' => 'بيانات الاعتماد هذه غير مطابقة لسجلاتنا.',
    'inactive_account' => 'هذا الحساب غير نشط. يُرجى التواصل مع الدعم.',
    'forbidden_field_update' => 'لا يمكن تحديث هذا الحقل عبر نقطة نهاية الملف الشخصي.',
    'no_profile_fields' => 'يجب توفير حقل واحد على الأقل من حقول الملف الشخصي للتحديث.',

    'verification_code_sent' => 'إذا كان التحقق مطلوبًا لهذا البريد، فقد تم إرسال رمز.',
    'email_verified' => 'تم التحقق من بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.',
    'email_already_verified' => 'تم التحقق من هذا البريد الإلكتروني مسبقًا.',
    'invalid_or_expired_code' => 'الرمز غير صالح أو منتهي الصلاحية.',
    'code_attempts_exceeded' => 'عدد المحاولات غير الصحيحة كبير جدًا. اطلب رمزًا جديدًا.',
    'otp_resend_cooldown' => 'يرجى الانتظار قبل طلب رمز آخر.',
    'password_reset_code_sent' => 'إذا وُجد حساب لهذا البريد، فقد تم إرسال رمز إعادة التعيين.',
    'password_reset_success' => 'تمت إعادة تعيين كلمة المرور. يُرجى تسجيل الدخول بكلمة المرور الجديدة.',
    'reset_code_invalid' => 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية.',
    'human_verification_failed' => 'فشل التحقق البشري. يُرجى المحاولة مرة أخرى.',
    'mail_delivery_failed' => 'تعذر إرسال البريد الآن. يُرجى المحاولة مجددًا بعد قليل.',

    'attributes' => [
        'name' => 'الاسم',
        'email' => 'البريد الإلكتروني',
        'phone' => 'رقم الهاتف',
        'password' => 'كلمة المرور',
        'password_confirmation' => 'تأكيد كلمة المرور',
        'code' => 'الرمز',
        'turnstile_token' => 'التحقق البشري',
    ],

    'mail' => [
        'user_fallback' => 'عزيزي المستخدم',
        'verify_subject' => 'رمز التحقق من PR Per Hour',
        'reset_subject' => 'رمز إعادة تعيين كلمة المرور من PR Per Hour',
        'greeting' => 'مرحبًا :name،',
        'verify_intro' => 'استخدم الرمز لمرة واحدة التالي للتحقق من بريدك الإلكتروني في PR Per Hour.',
        'reset_intro' => 'استخدم الرمز لمرة واحدة التالي لإعادة تعيين كلمة مرور PR Per Hour.',
        'code_line' => 'رمزك هو: :code',
        'expires_line' => 'ينتهي هذا الرمز خلال :minutes دقائق.',
        'do_not_share' => 'لا تشارك هذا الرمز مع أي شخص.',
        'ignore_if_unrequested' => 'إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.',
        'salutation' => '— PR Per Hour',
    ],
];
