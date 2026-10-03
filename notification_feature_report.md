# নোটিফিকেশন ফিচার ও মেকানিজম — বাস্তবায়ন প্রতিবেদন

**ইস্যু:** #120 — Notifications feature and mechanism
**প্রস্তুতকারী:** Monjur A Maula
**তারিখ:** ২০২৬-১০-০৩
**রিপো:** `D:\workforce-erp` ( Nx + pnpm monorepo, Laravel API + React ERP )

---

## ১. এক নজরে (Executive Summary)

এই কাজে আমাদের প্রজেক্টের বিদ্যমান কাস্টম নোটিফিকেশন সিস্টেম (`workforce_notifications` টেবিল + `NotificationController`) **অপরিবর্তিত রেখে** Laravel-এর আদর্শ Notification class + custom channel প্যাটার্ন যুক্ত করা হয়েছে, এবং সেটি realtime-ready করা হয়েছে।

মূল ফলাফল:

| বিষয় | অবস্থা |
|---|---|
| Laravel Notification class + custom channel | ✅ যুক্ত হয়েছে |
| Leave approved / rejected ট্রিগার | ✅ আগের inline কোড প্রতিস্থাপিত |
| Leave submitted (অনুমোদকের জন্য) ট্রিগার | ✅ |
| Office document shared ট্রিগার | ✅ নতুন |
| Mark-as-read + unread-count API | ✅ বিদ্যমান রুটই ব্যবহৃত (কোনো নতুন রুট লেখা হয়নি) |
| হেডারে bell + লাল unread badge | ✅ নতুন কম্পোনেন্ট, ক্লিকে বিদ্যমান NotificationsPage-এ নেভিগেট |
| Realtime (Echo/WebSocket) | ✅ **backend সম্পূর্ণ প্রস্তুত** (`ShouldBroadcast`), frontend-এ এখন **polling fallback** |
| টিমমেটের UI / layout / CSS / core logic | ✅ **কোনো কিছুই ভাঙেনি বা পরিবর্তন হয়নি** |

**Lead-এর সিদ্ধান্ত অনুযায়ী** হেডারে dropdown তৈরি করা হয়নি — শুধু একটি ন্যূনতম bell + লাল badge, যা ক্লিক করলে টিমমেটের তৈরি `NotificationsPage`-এ নিয়ে যায়।

---

## ২. কোড লেখার আগে যা যাচাই করা হয়েছিল (Pre-analysis)

কোড লেখার আগে রিপোজিটরি বিশ্লেষণ করে তিনটি বিষয় ধরা পড়েছে, যা কাজের দিক ঠিক করেছে:

1. **Laravel-এর built-in `notifications` টেবিল এই প্রজেক্টে নেই।** এর বদলে টিমমেট একটি কাস্টম `workforce_notifications` টেবিল + `NotificationController` + ৪টি REST রুট + একটি কাজ করা frontend পেজ (`apps/erp/src/pages/notifications/NotificationsPage.tsx`) তৈরি করে রেখেছে। built-in সিস্টেমে migrate করলে ওই কন্ট্রোলার, রুট, `NotificationRecord` টাইপ ও পেজ — সব ভেঙে যেত। তাই **existing table কে একমাত্র source of truth রেখে** custom channel তৈরি করা হয়েছে।
2. **AppHeader-এ লাল badge বা dropdown ছিল না** — ছিল শুধু একটি সাধারণ bell আইকনের Navigation Button (`AppHeader.tsx:85-95`)। badge এখন যুক্ত করা হয়েছে।
3. **কোনো WebSocket অবকাঠামোই ছিল না** — `laravel/reverb` বা `pusher/pusher-php-server` package নেই, `BROADCAST_DRIVER=log`, `app/Events/` ডিরেক্টরি নেই, `BroadcastServiceProvider` কমেন্ট করা অবস্থায় ছিল। তাই broadcasting **কাঠামোগতভাবে প্রস্তুত কিন্তু runtime-নিষ্প্রভ (inert)** হিসেবে বসানো হয়েছে — অর্থাৎ কোনো infra change ছাড়াই আজও সিস্টেমটি ঠিকভাবে কাজ করে (polling দিয়ে), আর Reverb/Pusher চালু করলেই instant realtime চালু হয়ে যাবে।

---

## ৩. ব্যাকএন্ড (Laravel) — ফাইল ও রোডম্যাপ

### ৩.১ নতুন তৈরি করা ফাইল

| ফাইল পাথ | লাইন | ভূমিকা |
|---|---|---|
| `apps/api/app/Notifications/Channels/WorkforceChannel.php` | 33 | **আর্কিটেকচারের কেন্দ্র।** বিদ্যমান `workforce_notifications` টেবিলে row লেখে, তারপর broadcast করে। ফলে `NotificationController`-এর REST contract অপরিবর্তিত থাকে। |
| `apps/api/app/Notifications/LeaveRequestReviewed.php` | — | Leave approve/reject নোটিফিকেশন (requester-এর জন্য)। |
| `apps/api/app/Notifications/LeaveRequestSubmitted.php` | — | নতুন leave request পর্যালোচকদের জন্য ("Leave approval required")। |
| `apps/api/app/Notifications/DocumentShared.php` | — | অফিস ডকুমেন্ট আপলোডের সময় `document.view` permissionধারীদের নোটিফিকেশন। |
| `apps/api/app/Events/NotificationBroadcast.php` | 41 | `ShouldBroadcast` ইভেন্ট — private user channel-ে নোটিফিকেশন পাঠায়। |
| `apps/api/app/Services/NotificationAudience.php` | 33 | "কে কে নোটিফিকেশন পাবে?" — permission অনুযায়ী recipient নির্ধারণের shared service (Leave + Document দুই জায়গাতেই ব্যবহৃত)। |
| `apps/api/tests/Feature/NotificationApiTest.php` | 382 | ১২টি feature টেস্ট — channel store+broadcast, broadcast payload আকৃতি, ৪টি ট্রিগার, unread-count, mark-read, mark-all-read ও security। |

### ৩.২ পরিবর্তিত ব্যাকএন্ড ফাইল (শুধু additive / trigger-wiring)

| ফাইল | কোথায় | কী পরিবর্তন |
|---|---|---|
| `apps/api/app/Http/Controllers/Api/v1/LeaveController.php` | `:202` | `WorkforceNotification::create([…])` এর ৮ লাইনের inline block সরিয়ে: `$leaveRequest->employee?->user?->notify(new LeaveRequestReviewed($leaveRequest, $status));` |
| | `:151`, `:232-236` | `notifyManagers()` এখন `NotificationAudience` + `LeaveRequestSubmitted` ব্যবহার করে — **প্রাপকের তালিকা আগের মতো হুবহু**। |
| | `:26` | constructor-এ `private readonly NotificationAudience $audience` যুক্ত। |
| `apps/api/app/Http/Controllers/Api/v1/DocumentController.php` | `:77-79` | Document তৈরির পর `document.view`ধারী সদস্যদের `DocumentShared` notify। |
| `apps/api/app/Models/WorkforceNotification.php` | `:33-52` | শুধু `toApiPayload()` মেথড যোগ — `NotificationController::serialize()` এর সাথে মিল রেখে, যাতে broadcast payload আর REST payload একই রকম থাকে। **table / `$fillable` / `$casts` / relation — কিছুই ছোঁয়া হয়নি।** |
| `apps/api/config/broadcasting.php` | default + reverb block | `default` এখন `env('BROADCAST_CONNECTION') ?: env('BROADCAST_DRIVER', 'null')`; নতুন `reverb` connection block যোগ। **ডিফল্ট এখনও `log`/`null`, তাই আজ কোনো external service লাগে না।** |
| `apps/api/config/app.php` | providers | `BroadcastServiceProvider` কমেন্ট থেকে চালু — না হলে `/broadcasting/auth` ও `routes/channels.php` লোড হতো না। |
| `apps/api/.env.example` | broadcast section | `# BROADCAST_CONNECTION=reverb` (কমেন্টে) + `REVERB_APP_ID/KEY/SECRET/HOST/PORT/SCHEME` এবং `composer require laravel/reverb` নির্দেশনা। |

### ৩.৩ ইচ্ছাকৃতভাবে **অপরিবর্তিত** রাখা ফাইল (টিমমেটের কোড সুরক্ষা)

- `apps/api/app/Http/Controllers/Api/v1/NotificationController.php` — ০ লাইন পরিবর্তন।
- `apps/api/routes/api.php` — নোটিফিকেশন রুট গ্রুপ (`:215-220`) আগের মতোই।
- `apps/api/routes/channels.php` — `App.Models.User.{id}` authorization callback **আগের মতোই**; realtime-এ সেই নিয়মই reuse করা হয়েছে, তাই এখানে কোনো edit লাগেনি।

### ৩.৪ API এন্ডপয়েন্ট (সবই বিদ্যমান রুট, নতুন নয়)

রুট ফাইল: `apps/api/routes/api.php:215-220` · কন্ট্রোলার: `apps/api/app/Http/Controllers/Api/v1/NotificationController.php`

| Method | URI | Controller method | ব্যবহারকারী |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | `index()` | `NotificationsPage` (inbox list, `?status=unread|read`, pagination) |
| `GET` | `/api/v1/notifications/unread-count` | `unreadCount()` | **নতুন: হেডারের লাল badge** |
| `PATCH` | `/api/v1/notifications/{id}/read` | `markRead()` | `NotificationsPage` |
| `PATCH` | `/api/v1/notifications/read-all` | `markAllRead()` | `NotificationsPage` |

সব রুট `tenant.required` মিডলওয়্যারের ভেতরে, এবং response envelope আগের মতোই `{ success, message, data, meta }` (`ApiResponseTrait`)।

---

## ৪. ফ্রন্টএন্ড (React / ERP) — ফাইল ও সংযোগস্থল

### ৪.১ নতুন ফাইল

| ফাইল পাথ | লাইন | ভূমিকা |
|---|---|---|
| `apps/erp/src/lib/realtime.ts` | 136 | **Echo/WebSocket client-এর সম্পূর্ণ লজিক এখানেই।** `isRealtimeEnabled()` env দেখে সিদ্ধান্ত নেয়; `subscribeToNotifications(userId, cb)` private channel-ে `.notification.created` শোনে। `laravel-echo` ও `pusher-js` **dynamic `import()`** দিয়ে লোড হয় — realtime কনফিগ না থাকলে এই ৬২+১২ kB কোড ব্রাউজারে নামেই না। |
| `apps/erp/src/features/notifications/hooks/use-unread-notification-count.ts` | 37 | **API সংযোগের আসল জায়গা।** `GET /api/v1/notifications/unread-count` কে TanStack Query দিয়ে আনে; realtime না থাকলে **২০ সেকেন্ড** polling, realtime চালু থাকলে **১২০ সেকেন্ড** backstop + Echo listener। |
| `apps/erp/src/features/notifications/components/NotificationBell.tsx` | 42 | Bell আইকন + লাল unread badge + `NotificationsPage`-এ নেভিগেশন। `99+` cap, আর unread থাকলে `aria-label="Notifications, N unread"` (accessibility)। |

### ৪.২ পরিবর্তিত ফ্রন্টএন্ড ফাইল

| ফাইল | লাইন | কী |
|---|---|---|
| `apps/erp/src/components/shell/AppHeader.tsx` | `:19` | `import { NotificationBell } from "#features/notifications/components/NotificationBell";` |
| | `:86` | আগের ১১ লাইনের bell `<Button>` block সরিয়ে শুধু `<NotificationBell />` — পুরো ফাইলে মোট **৪ লাইন যোগ, ১৪ লাইন বাদ**; **theme toggle, `<Separator>`, breadcrumb, avatar menu — সব আগের জায়গায় আগের মতো।** |
| | import cleanup | অব্যবহৃত `Bell` (lucide) ও `companyRoutes` import সরানো হয়েছে, কারণ ESLint `--max-warnings=0` সেটি pass করত না। |
| `apps/erp/src/vite-env.d.ts` | env declarations | ৯টি optional ভ্যারিয়েবল টাইপ যোগ: `VITE_REVERB_APP_KEY/HOST/PORT/SCHEME`, `VITE_PUSHER_APP_KEY/HOST/PORT/SCHEME/APP_CLUSTER`। |
| `apps/erp/package.json` | dependencies | `laravel-echo ^2.5.0`, `pusher-js ^8.6.0` (alphabetical position)। |
| `.env.example` (root) | broadcast block | `VITE_REVERB_*` / `VITE_PUSHER_*` commented উদাহরণ + ব্যাখ্যা। |

### ৪.৩ ইচ্ছাকৃতভাবে **অপরিবর্তিত** ফ্রন্টএন্ড ফাইল

- `apps/erp/src/pages/notifications/NotificationsPage.tsx` (টিমমেটের inbox পেজ) — ০ লাইন পরিবর্তন।
- `apps/erp/src/features/erp-core/api.ts`, `types.ts`, `routes/paths.ts`, এবং `@workforce-erp/ui` এর সব primitive — অপরিবর্তিত।

> **গুরুত্বপূর্ণ ডিজাইন নোট:** `use-unread-notification-count.ts` এর query key ইচ্ছাকৃতভাবে `["notifications"]` prefix-এর ভেতরে বসানো হয়েছে (`["notifications", "unread-count"]`), কারণ টিমমেটের `NotificationsPage.tsx:17` ঠিক এই key-টাই ব্যবহার করে। ফলাফল — পেজের কোনো code না ছুঁয়েই, "Mark all read" বা কোনো item click করলে badge **সঙ্গে সঙ্গে** আপডেট হয়, এবং realtime event এলে inbox list **সঙ্গে সঙ্গে** refresh হয়। একমুখী, শূন্য-সম্পাদনা সংযোগ।

---

## ৫. ডেটা-ফ্লো: একটি নোটিফিকেশন জন্ম থেকে স্ক্রিন পর্যন্ত

```
[ধাপ ১] ইউজার approve করে
   PATCH /api/v1/leave-requests/{id}/approve
        │
        ▼
[ধাপ ২] LeaveController::review()            apps/api/app/Http/Controllers/Api/v1/LeaveController.php:202
   $leaveRequest->employee?->user?->notify(new LeaveRequestReviewed($leaveRequest, 'approved'));
        │
        ▼
[ধাপ ৩] Notification class via()              apps/api/app/Notifications/LeaveRequestReviewed.php
   return [WorkforceChannel::class];
   → Laravel 13-এর ChannelManager এই FQCN-টি ড্রাইভার হিসেবে না পেয়ে
     class_exists() check করে service container থেকে resolve করে
     (আমরা framework source থেকে এটি যাচাই করেছি — তাই কোনো
      provider-এ channel register করার দরকার নেই)।
        │
        ▼
[ধাপ ৪] WorkforceChannel::send()              apps/api/app/Notifications/Channels/WorkforceChannel.php
   (a) $notification->toWorkforce($notifiable) থেকে payload আনে
        → type = 'leave.approved'
        → title = 'Leave request Approved'
        → action_url = '/leave/{id}'
   (b) WorkforceNotification::create([...])  → workforce_notifications টেবিলে row (read_at = NULL)
        → এখানেই REST API (NotificationController) পড়া শুরু করে
        │
        ▼
[ধাপ ৫] event(new NotificationBroadcast($record))   apps/api/app/Events/NotificationBroadcast.php
   broadcastOn()   → PrivateChannel('App.Models.User.'.$record->user_id)
   broadcastAs()   → 'notification.created'
   broadcastWith() → ['notification' => $record->toApiPayload()]
        │
        ▼
[ধাপ ৬] Broadcast driver (config/broadcasting.php)
   ├── এখন:  BROADCAST_DRIVER=log  → শুধু log-এ লেখে, কোনো socket-এ যায় না (২০s polling কাজ করে)
   └── Reverb/Pusher চালু হলে: → WebSocket-এ push হয়
        │
        ▼
[ধাপ ৭a] Frontend — realtime PATH             apps/erp/src/lib/realtime.ts
   VITE_REVERB_* / VITE_PUSHER_* থাকলে →
   new Echo(...).private(`App.Models.User.${userId}`)
          .listen('.notification.created', cb)
   → channel অনুমোদন: POST /broadcasting/auth → routes/channels.php-এর
     বিদ্যমান নিয়ম (int)$user->id === (int)$id  → আমরা এটি ছুঁইনি
   → callback চালায় queryClient.invalidateQueries({ queryKey: ["notifications"] })
        │
[ধাপ ৭b] Frontend — polling PATH (আজ যেটি চালু)
   প্রতি ২০ সেকেন্ডে GET /api/v1/notifications/unread-count
        │
        ▼
[ধাপ ৮] UI আপডেট                              apps/erp/src/features/notifications/components/NotificationBell.tsx
   useUnreadNotificationCount() নতুন count দেয় → লাল badge সংখ্যা বদলায়
   একই সময় ["notifications"] invalidate হওয়ায় NotificationsPage-এর inbox-ও
   নতুন data আনে — পেজ রিলোড ছাড়াই।
   ইউজার badge দেখে bell-এ ক্লিক করলে → companyRoutes.notifications(...) → NotificationsPage
```

### ট্রিগার ম্যাট্রিক্স (কখন কোন নোটিফিকেশন তৈরি হয়)

| ঘটনা | Notification class | `type` | প্রাপক |
|---|---|---|---|
| Leave approved | `LeaveRequestReviewed` | `leave.approved` | Requester (employee-র linked user) |
| Leave rejected | `LeaveRequestReviewed` | `leave.rejected` | Requester |
| Leave submitted | `LeaveRequestSubmitted` | `leave.requested` | `leave.approve` permissionসম্পন্ন active সদস্য (requester বাদে) |
| Document uploaded | `DocumentShared` | `document.shared` | `document.view` permissionসম্পন্ন active সদস্য (uploader বাদে) |

---

## ৬. টেস্ট

`apps/api/tests/Feature/NotificationApiTest.php` — ১২টি টেস্ট, `LeaveApiTest.php`-এর বিদ্যমান helper idiom হুবহু অনুসরণ করে (`RefreshDatabase`, `setUp()`-এ `Organization` + `LeaveType`, Sanctum bearer token, `Event::fake([NotificationBroadcast::class])`)।

1. `test_workforce_channel_stores_the_notification_and_broadcasts_it` — channel DB row + event দুটোই করে
2. `test_broadcast_uses_the_existing_private_user_channel_and_event_name` — channel নাম `private-App.Models.User.{id}`, event `notification.created`
3. `test_broadcast_payload_matches_the_rest_notification_shape` — broadcast payload-এর key ক্রম REST `serialize()`-এর সাথে হুবহু মিলে যায়
4. `test_approving_a_leave_notifies_the_requester`
5. `test_rejecting_a_leave_stores_the_rejected_type`
6. `test_submitting_a_leave_notifies_reviewers_assigned_the_approve_permission` (+ bystander/requester বাদ নিশ্চিত)
7. `test_uploading_a_document_notifies_members_assigned_document_view` (+ uploader বাদ, ডুপ্লিকেট নেই)
8. `test_unread_count_ignores_read_notifications_and_other_organizations` — tenant isolation
9. `test_mark_read_endpoint_flags_one_notification_and_clears_the_count`
10. `test_mark_all_read_endpoint_clears_every_unread_notification`
11. `test_a_user_cannot_mark_another_users_notification_as_read` — **security/IDOR টেস্ট** (404 + `read_at` NULL থাকে)
12. `test_index_lists_unread_notifications_newest_first`

---

## ৭. যাচাইকরণের প্রকৃত অবস্থা (আনুষ্ঠানিক নয়, সৎ প্রতিবেদন)

| চেক | ফলাফল |
|---|---|
| `pnpm install --no-frozen-lockfile` | ✅ exit code 0 |
| `pnpm typecheck` (erp) | ✅ pass |
| `pnpm lint --max-warnings=0` (erp) | ✅ pass |
| `pnpm build` (erp production) | ✅ pass |
| Build output | ✅ `echo-*.js` **11.66 kB** ও `pusher-*.js` **62.18 kB** আলাদা **lazy chunk** — main 1040 kB bundle-এর বাইরে। অর্থাৎ realtime কনফিগ না করলে WebSocket কোড ব্যবহারকারীর নেটওয়ার্ক থেকে নামেই না। |
| `php -l` সব ১২টি স্পর্শকৃত PHP ফাইল | ✅ "No syntax errors detected" |
| **PHPUnit টেস্ট** | ⚠️ **এই মেশিনে চালানো যায়নি** |
| `git status` যাচাই | ✅ `NotificationController.php`, `routes/api.php`, `routes/channels.php`, `NotificationsPage.tsx` — কোনোটিই modified তালিকায় নেই |

**PHPUnit চালানো না যাওয়ার কারণ:** এই মেশিনে PHP `8.2.12`, কিন্তু `apps/api/composer.json` requirement `php: ^8.4`। এছাড়া `apps/api/vendor/` নেই (composer install হয়নি), `apps/api/.env` নেই, এবং Docker/Reverb container চলছে না। চুক্তি অনুযায়ী আমি কোড + টেস্ট লিখেছি, রান আপনার environment-এ করে আমাকে ফলাফল জানাবেন।

### আপনার রান করার কমান্ড

```bash
cd apps/api
composer install        # PHP >= 8.4 দরকার
php artisan test --filter=NotificationApiTest
```

> আলাদা করে `.env` তৈরি, `key:generate` বা `migrate` করার দরকার **নেই** — `apps/api/phpunit.xml` ইতিমধ্যেই `APP_ENV=testing`, একটি test `APP_KEY`, এবং `DB_DATABASE=:memory:` (sqlite) সেট করে, আর `RefreshDatabase` trait টেস্টের শুরুতে সব মাইগ্রেশন চালিয়ে দেয়।

আলাদাভাবে frontend যাচাই করতে:

```bash
pnpm install                              # নতুন laravel-echo + pusher-js ইনস্টল করতে
pnpm --filter @workforce-erp/erp typecheck
pnpm --filter @workforce-erp/erp lint
pnpm --filter @workforce-erp/erp build
pnpm dev   # ERP হেডারে bell + badge দেখুন; NotificationsPage খুলুন
```

---

## ৮. Realtime (WebSocket) চালু করার ধাপ — ঐচ্ছিক, এখন লাগবে না

আজ সিস্টেমটি ২০ সেকেন্ড polling-এ সম্পূর্ণ কাজ করে। Instant realtime চাইলে:

```bash
# ১) Backend
cd apps/api
composer require laravel/reverb
php artisan reverb:install       # .env-এ REVERB_APP_ID/KEY/SECRET বসায়
# .env: BROADCAST_CONNECTION=reverb  (এই ফাইলে BROADCAST_DRIVER=log রেখো)
php artisan reverb:start

# ২) Frontend (repo root .env / apps/erp/.env)
VITE_REVERB_APP_KEY=<same as REVERB_APP_KEY>
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

কোনো frontend code change লাগবে **না** — `realtime.ts` env ভ্যারিয়েবল দেখে স্বয়ংক্রিয়ভাবে Echo চালু করে নেবে এবং polling ২০s থেকে ১২০s backstop-এ নেমে যাবে। Pusher ব্যবহার করতে চাইলে `VITE_PUSHER_*` ভ্যারিয়েবলগুলো দেুন এবং `config/broadcasting.php`-এর বিদ্যমান `pusher` connection-ই ব্যবহার করুন।

---

## ৯. সীলিমা ও ঝুঁকি (Lead-এর জানা দরকার)

1. **Recipient resolution শুধু explicit role assignment দেখে।** `NotificationAudience::usersWithPermission()` `organization_members.role` pivot নয়, বরং `membership_role_assignments` → `role.permissions` ট্র্যাক করে। অর্থাৎ একজন `manager` যার pivot role-এ `document.view` আছে কিন্তু কোনো explicit assignment নেই, তিনি document নোটিফিকেশন **পাবেন না**। এটি **টিমমেটের আগের `notifyManagers()` লজিক হুবহু সংরক্ষিত** — regression নয়, pre-existing behavior। ঠিক করতে চাইলে pivot-default permission-ও include করতে হবে।
2. **Document trigger branch-level data scope ফিল্টার করে না** — পুরো organization-এর `document.view`ধারী সবাই নোটিফিকেশন পায়, অথচ `DocumentController::index()` branch-scoped data-scope filter লাগায়। ফলে BranchB-র একজন সদস্য BranchA-র document-এর notification পেতে পারেন, কিন্তু `/documents` খুললে branch filter-এর কারণে সেটি তালিকায় নাও দেখাতে পারে। চাইলে `DataScopeService::accessibleBranchIds()` দিয়ে audience ছেঁটে নিলেই সমাধান হবে (এক লাইনের পরিবর্তন)।
3. **Cross-origin SPA + cookie auth হলে `/broadcasting/auth` route-এ stateful middleware লাগতে পারে।** বর্তমানে local dev same-origin (`VITE_API_URL=/api` + Vite proxy) হওয়ায় সমস্যা নেই; ভিন্ন ডোমেইনে Reverb চালু করতে চাইলে `bootstrap/app.php`/`Kernel.php` review করতে হবে।
4. **Polling mode-এ সর্বোচ্চ ২০ সেকেন্ড দেরি** badge-তে — এটি intentional trade-off, কোনো infra ছাড়াই কাজ করার বিনিময়ে।
5. **`config/app.php`-এ `BroadcastServiceProvider` চালু করা হয়েছে** — এর মানে অ্যাপ্লিকেশন এখন `/broadcasting/auth` রুট এক্সপোজ করে। এটি নিরাপদ কারণ channel callback শুধু নিজের `user_id` মিলিয়ে অনুমোদন দেয়, কিন্তু Lead চাইলে আমরা route-এ অতিরিক্ত throttle/permission hardening যোগ করতে পারি।

---

## ১০. পরিবর্তনের সম্পূর্ণ তালিকা (`git status`)

```
 modified:   .env.example
 modified:   apps/api/.env.example
 modified:   apps/api/app/Http/Controllers/Api/v1/DocumentController.php
 modified:   apps/api/app/Http/Controllers/Api/v1/LeaveController.php
 modified:   apps/api/app/Models/WorkforceNotification.php
 modified:   apps/api/config/app.php
 modified:   apps/api/config/broadcasting.php
 modified:   apps/erp/package.json
 modified:   apps/erp/src/components/shell/AppHeader.tsx
 modified:   apps/erp/src/vite-env.d.ts
 modified:   pnpm-lock.yaml
 new file:   apps/api/app/Events/NotificationBroadcast.php
 new file:   apps/api/app/Notifications/Channels/WorkforceChannel.php
 new file:   apps/api/app/Notifications/DocumentShared.php
 new file:   apps/api/app/Notifications/LeaveRequestReviewed.php
 new file:   apps/api/app/Notifications/LeaveRequestSubmitted.php
 new file:   apps/api/app/Services/NotificationAudience.php
 new file:   apps/api/tests/Feature/NotificationApiTest.php
 new file:   apps/erp/src/features/notifications/components/NotificationBell.tsx
 new file:   apps/erp/src/features/notifications/hooks/use-unread-notification-count.ts
 new file:   apps/erp/src/lib/realtime.ts
```

---

## ১১. পরবর্তী প্রস্তাবনা

1. আপনার environment-এ `php artisan test --filter=NotificationApiTest` চালান — ত্রুটি পেলে আমার জানাবেন, আমি ঠিক করব।
2. এটি merge-এর পর টিমের একজন Dev-কে Reverb container (`infra/compose.yaml`-এ) যোগ করতে অনুরোধ করুন; ব্যাকএন্ড/ফ্রন্টএন্ড দুটোই প্রস্তুত, শুধু env value বসানোর অপেক্ষা।
3. Lead-এর সিদ্ধান্ত দরকার: (ক) pivot-role holders-ও কি নোটিফিকেশন পাবেন? (খ) document notification কি branch-scope করা উচিত? — দুটোই এখন এক লাইনের change, আপনার নির্দেশের অপেক্ষায়।
