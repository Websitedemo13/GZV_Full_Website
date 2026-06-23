# TODO - Đổi msc → gzv & cập nhật domain + fix header logo

## Bước 1: Chuẩn hoá header/logo & brand
- [ ] Sửa `Frontend_GZV/components/Header.tsx`
  - [ ] Đổi `MSC CENTER`/text liên quan sang `GZV`
  - [ ] Đổi email `msc.edu.vn@gmail.com` → `gzv.one@gmail.com`
  - [ ] Đổi link `https://mscer.msc.edu.vn/` → `https://mscer.gzv.one/` (nếu đúng cấu trúc)
  - [ ] Fix logo bị tràn: điều chỉnh Tailwind/className & bỏ inline style width động nếu gây tràn

## Bước 2: Update metadata/app layout sang gzv.one
- [ ] Sửa `Frontend_GZV/app/layout.tsx`
  - [ ] `metadataBase` + `authors.url` + `openGraph.url` + canonical (nếu có)
  - [ ] Đổi các string domain `https://msc.edu.vn` → `https://gzv.one`
  - [ ] Kiểm tra các image url `/msc/assets/...` (không đổi nếu assets chưa tồn tại; nếu có thư mục gzv/assets thì chuyển)

## Bước 3: Update middleware admin domain
- [ ] Sửa `Frontend_GZV/middleware.ts`
  - [ ] Thay `ADMIN_EMAIL_DOMAIN = '@msc.com'` → `'@gzv.one'`

## Bước 4: Đổi các đường dẫn/brand khác liên quan (chỉ trong phạm vi đã kiểm tra)
- [ ] Đổi các file đã đọc có từ `MSC/msc` trong `app/mscer/[slug]/page.tsx` theo yêu cầu brand (tránh đổi route nếu không chắc)

## Bước 5: Build/Test
- [ ] Chạy `pnpm -C Frontend_GZV build` (hoặc lệnh phù hợp theo package)
- [ ] Smoke test: header logo không tràn, domain meta canonical/og đúng, admin middleware chạy đúng.

