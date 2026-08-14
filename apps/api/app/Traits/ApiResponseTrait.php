<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Send a successful JSON response.
     */
    protected function successResponse(mixed $data = null, ?string $message = null, int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data instanceof JsonResource) {
            $responseData = $data->response()->getData(true);
            if (is_array($responseData)) {
                $response['data'] = $responseData['data'] ?? $responseData;
                if (isset($responseData['meta'])) {
                    $response['meta'] = $this->formatMeta($responseData['meta']);
                }
                if (isset($responseData['links'])) {
                    $response['links'] = $responseData['links'];
                }
            } else {
                $response['data'] = $responseData;
            }
        } elseif ($data instanceof LengthAwarePaginator) {
            $response['data'] = $data->items();
            $response['meta'] = [
                'current_page' => $data->currentPage(),
                'from' => $data->firstItem(),
                'last_page' => $data->lastPage(),
                'path' => $data->path(),
                'per_page' => $data->perPage(),
                'to' => $data->lastItem(),
                'total' => $data->total(),
            ];
            $response['links'] = [
                'first' => $data->url(1),
                'last' => $data->url($data->lastPage()),
                'prev' => $data->previousPageUrl(),
                'next' => $data->nextPageUrl(),
            ];
        } elseif ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Send a standard error JSON response.
     */
    protected function errorResponse(string $message, int $statusCode = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Format meta array to only include fields specified in our API contract.
     */
    private function formatMeta(array $meta): array
    {
        return [
            'current_page' => $meta['current_page'] ?? null,
            'from' => $meta['from'] ?? null,
            'last_page' => $meta['last_page'] ?? null,
            'path' => $meta['path'] ?? null,
            'per_page' => $meta['per_page'] ?? null,
            'to' => $meta['to'] ?? null,
            'total' => $meta['total'] ?? null,
        ];
    }
}
