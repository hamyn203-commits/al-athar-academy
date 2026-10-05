# Provider-neutral object storage

The backend uses an S3-compatible interface for direct browser uploads. This avoids Vercel request-size limits and keeps file storage portable.

Compatible examples:
- Cloudflare R2
- AWS S3
- Backblaze B2 S3 API
- Wasabi
- MinIO on a future VPS

Environment variables:

```
FILE_STORAGE_DRIVER=external
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
S3_FORCE_PATH_STYLE=false
```

`S3_PUBLIC_BASE_URL` is used only for public prefixes. Private objects are stored by key and must be served through role/ownership-aware application endpoints.

Uploads should use:
1. authenticated request to `POST /api/uploads/presign`
2. direct `PUT` from the browser to object storage
3. submit the returned object key or public URL to the relevant business endpoint

This design is not tied to Vercel.
