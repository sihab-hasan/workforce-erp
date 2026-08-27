<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\WorkforceNotification;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $query = WorkforceNotification::query()->where('user_id', $request->user()->id)
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $org->id));
        if ($request->input('status') === 'unread') {
            $query->whereNull('read_at');
        }
        if ($request->input('status') === 'read') {
            $query->whereNotNull('read_at');
        }
        $paginator = $query->orderByDesc('created_at')->paginate(min(100, max(1, (int) $request->input('per_page', 30))));
        $paginator->setCollection($paginator->getCollection()->map(fn ($item) => $this->serialize($item)));

        return $this->successResponse($paginator);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $count = WorkforceNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $org->id))->count();

        return $this->successResponse(['count' => $count]);
    }

    public function markRead(Request $request, WorkforceNotification $notification): JsonResponse
    {
        abort_unless((int) $notification->user_id === (int) $request->user()->id, 404);
        $notification->update(['read_at' => $notification->read_at ?? now()]);

        return $this->successResponse($this->serialize($notification->fresh()));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        WorkforceNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $org->id))->update(['read_at' => now()]);

        return $this->successResponse(null, 'All notifications marked as read');
    }

    private function serialize(WorkforceNotification $item): array
    {
        return [
            'id' => (string) $item->id, 'type' => $item->type, 'title' => $item->title, 'message' => $item->message,
            'action_url' => $item->action_url, 'data' => $item->data ?? [], 'read_at' => $item->read_at?->toIso8601String(),
            'is_read' => (bool) $item->read_at, 'created_at' => $item->created_at?->toIso8601String(),
        ];
    }
}
