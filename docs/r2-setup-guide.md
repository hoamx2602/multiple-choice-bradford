# Cloudflare R2 Setup Guide

## Vấn đề hiện tại
- Upload thành công nhưng không xem được images
- Lỗi: `<Code>InvalidArgument</Code><Message>Authorization</Message>`
- Nguyên nhân: R2 bucket chưa được cấu hình public access

## Giải pháp

### 1. Tạo R2 Bucket với Public Access

#### Bước 1: Tạo R2 Bucket
1. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Chọn **R2 Object Storage**
3. Click **Create bucket**
4. Đặt tên bucket (ví dụ: `your-bucket-name`)
5. **Quan trọng**: Chọn **Public bucket** hoặc **Allow public access**

#### Bước 2: Cấu hình Public Access
1. Vào bucket vừa tạo
2. Chọn **Settings** tab
3. Tìm **Public access** section
4. Enable **Allow public access**
5. Hoặc cấu hình **Custom domain** (tùy chọn)

### 2. Cấu hình Bucket Policy (Nếu cần)

#### Tạo Custom Domain (Khuyến nghị)
1. Trong R2 bucket settings
2. Chọn **Custom domains**
3. Thêm domain của bạn (ví dụ: `images.yourdomain.com`)
4. Cấu hình DNS record theo hướng dẫn
5. Update environment variable:
```env
CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com
```

#### Hoặc sử dụng R2 Public URL
1. Trong R2 bucket settings
2. Tìm **Public URL** hoặc **R2.dev subdomain**
3. Sẽ có dạng: `https://pub-{account-id}.r2.dev`
4. Update code để sử dụng URL này

### 3. Cập nhật Code (Nếu cần)

#### Option 1: Sử dụng Custom Domain
```env
CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com
```

#### Option 2: Sử dụng R2.dev subdomain
```env
# Không cần CLOUDFLARE_R2_PUBLIC_URL
# Code sẽ tự động sử dụng: https://pub-{account-id}.r2.dev
```

### 4. Test Upload và Access

#### Test Upload
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@test-image.jpg"
```

#### Test Access
- Copy URL từ response
- Paste vào browser
- Phải thấy được image

### 5. Troubleshooting

#### Nếu vẫn không xem được:
1. **Kiểm tra bucket policy**:
   - Vào R2 bucket
   - Chọn **Settings** > **Public access**
   - Đảm bảo **Allow public access** được enable

2. **Kiểm tra CORS** (nếu cần):
   - Vào bucket settings
   - Thêm CORS policy nếu cần

3. **Kiểm tra URL format**:
   - URL phải có dạng: `https://pub-{account-id}.r2.dev/...`
   - Hoặc custom domain: `https://your-domain.com/...`

#### Common Issues:
- **Bucket không public**: Enable public access
- **Wrong URL format**: Kiểm tra URL trong response
- **CORS issues**: Cấu hình CORS nếu cần
- **DNS issues**: Nếu dùng custom domain

### 6. Production Setup

#### Security Best Practices:
1. **Rate limiting**: Thêm rate limiting cho upload API
2. **File validation**: Đã có trong code
3. **Size limits**: Đã có trong code (5MB)
4. **Type validation**: Đã có trong code (images only)

#### Monitoring:
1. **Upload logs**: Monitor upload success/failure
2. **Storage usage**: Monitor R2 storage usage
3. **Bandwidth**: Monitor data transfer

## Kết quả mong đợi

Sau khi setup đúng:
- ✅ Upload thành công
- ✅ URL accessible từ browser
- ✅ Images hiển thị bình thường
- ✅ Có thể dùng trong bulk questions API

## Next Steps

1. **Setup R2 bucket** với public access
2. **Test upload** và access
3. **Configure custom domain** (optional)
4. **Update environment variables** nếu cần
5. **Test bulk questions** với images
