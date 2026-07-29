# Naming Conventions

## Backend (Laravel / PHP)

| Item | Convention | Example |
| --- | --- | --- |
| Classes | PascalCase | `CreateBookingAction` |
| Methods and variables | camelCase | `createBooking`, `$bookingId` |
| Database fields | snake_case | `created_at`, `service_id` |
| Table names | plural | `bookings`, `service_categories` |
| Eloquent models | singular PascalCase | `Booking`, `ServiceCategory` |
| Actions | explicit verb + noun + `Action` | `CreateBookingAction` |
| Services | explicit domain + `Service` | `BookingScheduleService` |
| Form Requests | purpose + `Request` | `StoreBookingRequest` |
| API Resources | model/domain + `Resource` | `BookingResource` |
| Feature folders | PascalCase | `ContactMessages` |

## Frontend (React / TypeScript)

| Item | Convention | Example |
| --- | --- | --- |
| Folders | kebab-case | `client-dashboard` |
| React components | PascalCase | `BookingForm.tsx` |
| Hooks and functions | camelCase | `formatDate` |
| Hooks prefix | `use` | `useBookingForm` |
| Feature public exports | through `index.ts` | `features/bookings/index.ts` |

## Shared code

- `frontend/src/shared` holds cross-feature utilities only.
- Do not place feature-specific business logic in shared folders.
- Prefer exporting a feature's public API from that feature's `index.ts`.
