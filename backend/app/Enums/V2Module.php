<?php

declare(strict_types=1);

namespace App\Enums;

enum V2Module: string
{
    case Payments = 'payments';
    case Invoices = 'invoices';
    case Consultants = 'consultants';
    case AdvancedScheduling = 'advanced_scheduling';
    case RolesPermissions = 'roles_permissions';
    case Crm = 'crm';
    case Leads = 'leads';
    case Coupons = 'coupons';
    case AdvancedChatbot = 'advanced_chatbot';
    case KnowledgeBase = 'knowledge_base';
    case Analytics = 'analytics';
    case Cms = 'cms';
    case Blog = 'blog';
    case Notifications = 'notifications';
}
