<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\DataScopeService;
use App\Services\WorkforceScopeService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope, private readonly DataScopeService $dataScope) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->authorize($request, 'document.view');
        $query = Document::query()->where('organization_id', $org->id)->with('uploader');
        $allowedBranches = $this->dataScope->accessibleBranchIds($request->user(), (int) $org->id);
        if ($allowedBranches !== null) {
            $query->where(fn ($q) => $q->whereIn('branch_id', $allowedBranches ?: [-1])->orWhere(fn ($own) => $own->whereNull('branch_id')->where('uploaded_by', $request->user()->id)));
        }
        if ($branch) {
            $query->where('branch_id', $branch->id);
        }
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }
        if ($request->filled('search')) {
            $term = trim((string) $request->input('search'));
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%"));
        }
        $paginator = $query->orderByDesc('created_at')->paginate(min(100, max(1, (int) $request->input('per_page', 20))));
        $paginator->setCollection($paginator->getCollection()->map(fn ($doc) => $this->serialize($doc)));

        return $this->successResponse($paginator);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->authorize($request, 'document.manage');
        if ($branch) {
            abort_unless($this->dataScope->allowsBranch($request->user(), (int) $org->id, (int) $branch->id), 403);
        }
        $data = $request->validate([
            'file' => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,xls,xlsx,csv,txt,png,jpg,jpeg,webp'],
            'name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:64'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);
        $file = $request->file('file');
        $safeName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $path = $file->store('workforce/'.$org->id.'/documents', 'local');
        $document = Document::create([
            'organization_id' => $org->id,
            'branch_id' => $branch?->id,
            'uploaded_by' => $request->user()->id,
            'name' => $data['name'] ?? $safeName,
            'category' => $data['category'] ?? 'general',
            'description' => $data['description'] ?? null,
            'disk' => 'local',
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
        ])->load('uploader');

        return $this->successResponse($this->serialize($document), 'Document uploaded successfully', 201);
    }

    public function show(Request $request, Document $document): JsonResponse
    {
        $this->assertScoped($request, $document);

        return $this->successResponse($this->serialize($document->load('uploader')));
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->assertScoped($request, $document);
        abort_unless(Storage::disk($document->disk)->exists($document->path), 404, 'Document file was not found.');
        $extension = pathinfo($document->path, PATHINFO_EXTENSION);
        $filename = $document->name.($extension ? '.'.$extension : '');

        return Storage::disk($document->disk)->download($document->path, $filename, ['Content-Type' => $document->mime_type ?? 'application/octet-stream']);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $this->assertScoped($request, $document);
        $canDelete = (int) $document->uploaded_by === (int) $request->user()->id;
        if (! $canDelete) {
            try {
                $this->scope->authorize($request, 'document.manage');
                $canDelete = true;
            } catch (AuthorizationException) {
                $canDelete = false;
            }
        }
        abort_unless($canDelete, 403);
        if (Storage::disk($document->disk)->exists($document->path)) {
            Storage::disk($document->disk)->delete($document->path);
        }
        $document->delete();

        return $this->successResponse(null, 'Document deleted successfully');
    }

    private function assertScoped(Request $request, Document $document): void
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        abort_unless((int) $document->organization_id === (int) $org->id, 404);
        if ($branch && $document->branch_id) {
            abort_unless((int) $document->branch_id === (int) $branch->id, 404);
        }
        $this->scope->authorize($request, 'document.view');
        if (! $this->dataScope->isOrganizationWide($request->user(), (int) $org->id)) {
            $allowed = $document->branch_id ? $this->dataScope->allowsBranch($request->user(), (int) $org->id, (int) $document->branch_id) : (int) $document->uploaded_by === (int) $request->user()->id;
            abort_unless($allowed, 403);
        }
    }

    private function serialize(Document $document): array
    {
        return [
            'id' => (string) $document->id,
            'name' => $document->name,
            'category' => $document->category,
            'description' => $document->description,
            'mime_type' => $document->mime_type,
            'size_bytes' => (int) $document->size_bytes,
            'size_label' => $this->formatBytes((int) $document->size_bytes),
            'version' => (int) $document->version,
            'uploader' => $document->uploader ? ['id' => (string) $document->uploader->id, 'name' => $document->uploader->name] : null,
            'download_url' => '/api/v1/documents/'.$document->id.'/download',
            'created_at' => $document->created_at?->toIso8601String(),
            'updated_at' => $document->updated_at?->toIso8601String(),
        ];
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }
        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }
}
