<?php

declare(strict_types=1);

return [
    'registration_success' => 'Registration completed successfully.',
    'registration_verification_required' => 'Account created. Please verify your email with the code we sent.',
    'email_verification_required' => 'Please verify your email before signing in. A verification code can be requested on the next screen.',
    'login_success' => 'Login successful.',
    'logout_success' => 'Logged out successfully.',
    'profile_update_success' => 'Profile updated successfully.',
    'me_success' => 'Authenticated user retrieved successfully.',
    'unauthenticated' => 'Authentication is required.',
    'forbidden' => 'You are not authorized to perform this action.',
    'invalid_credentials' => 'These credentials do not match our records.',
    'inactive_account' => 'This account is inactive. Please contact support.',
    'forbidden_field_update' => 'This field cannot be updated through the profile endpoint.',
    'no_profile_fields' => 'Provide at least one profile field to update.',

    'verification_code_sent' => 'If verification is required for this email, a code has been sent.',
    'email_verified' => 'Your email address has been verified. You can now sign in.',
    'email_already_verified' => 'This email address is already verified.',
    'invalid_or_expired_code' => 'The code is invalid or has expired.',
    'code_attempts_exceeded' => 'Too many invalid attempts. Request a new code.',
    'otp_resend_cooldown' => 'Please wait before requesting another code.',
    'password_reset_code_sent' => 'If an account exists for this email, a reset code has been sent.',
    'password_reset_success' => 'Your password has been reset. Please sign in with your new password.',
    'reset_code_invalid' => 'The reset code is invalid or has expired.',
    'human_verification_failed' => 'Human verification failed. Please try again.',
    'mail_delivery_failed' => 'We could not send the email right now. Please try again shortly.',

    'attributes' => [
        'name' => 'name',
        'email' => 'email',
        'phone' => 'phone',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'code' => 'code',
        'turnstile_token' => 'human verification',
    ],

    'mail' => [
        'user_fallback' => 'there',
        'verify_subject' => 'Your PR Per Hour verification code',
        'reset_subject' => 'Your PR Per Hour password reset code',
        'greeting' => 'Hello :name,',
        'verify_intro' => 'Use the following one-time code to verify your email address for PR Per Hour.',
        'reset_intro' => 'Use the following one-time code to reset your PR Per Hour password.',
        'code_line' => 'Your code is: :code',
        'expires_line' => 'This code expires in :minutes minutes.',
        'do_not_share' => 'Do not share this code with anyone.',
        'ignore_if_unrequested' => 'If you did not request this email, you can safely ignore it.',
        'salutation' => '— PR Per Hour',
    ],
];
