# Cloudinary Setup for Avatar Upload (FREE - No Credit Card)

## ✅ Tại sao chọn Cloudinary?
- **FREE**: 25GB storage + 25GB bandwidth/tháng
- **Không cần thẻ tín dụng**
- Auto image optimization & resize
- CDN toàn cầu, load nhanh
- Dễ integrate, không phức tạp

---

## 🚀 Hướng dẫn Setup (5 phút)

### Bước 1: Đăng ký Cloudinary Account

1. Truy cập: https://cloudinary.com/users/register_free
2. Điền thông tin:
   - Email
   - Password
   - Hoặc dùng **"Sign up with Google"** (nhanh hơn)
3. Click **"Create Account"**
4. Xác nhận email (check inbox)

### Bước 2: Lấy API Credentials

1. Sau khi đăng nhập, bạn sẽ thấy **Dashboard**
2. Tại phần **Account Details**, copy 3 thông tin:
   - **Cloud Name**: `dxxxxxxxx` (ví dụ: `dbtfwvxyz`)
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` (click "Reveal" để xem)

### Bước 3: Cập nhật application.yml

Mở file:
```
backend/services/user-service/src/main/resources/application.yml
```

Tìm và sửa section `cloudinary`:

```yaml
# Cloudinary Configuration for Avatar Upload
cloudinary:
  enabled: true  # ⬅️ Đổi từ false sang true
  cloud-name: dbtfwvxyz  # ⬅️ Paste Cloud Name của bạn
  api-key: 123456789012345  # ⬅️ Paste API Key của bạn
  api-secret: abcxyz123456  # ⬅️ Paste API Secret của bạn
```

### Bước 4: Chạy SQL Migration

Trong MySQL Workbench hoặc terminal, chạy:

```bash
# Option 1: Terminal
mysql -u root -p user_service_db < backend/database/migrations/add_avatar_url_to_users.sql

# Option 2: MySQL Workbench
# Mở file add_avatar_url_to_users.sql
# Execute script
```

Hoặc chạy SQL trực tiếp:
```sql
-- Thêm column avatar_url vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
```

### Bước 5: Rebuild & Restart User Service

```bash
# Trong terminal
cd backend/services/user-service
mvn clean install

# Sau đó restart service trong IntelliJ/Eclipse
```

### Bước 6: Test!

1. **Mở frontend** và đăng nhập
2. **Vào Profile** (`/driver/profile/info`)
3. **Click icon camera** trên avatar
4. **Chọn ảnh** và upload
5. **Avatar sẽ hiển thị ngay!** ✨

---

## 📝 API Endpoints

### Upload Avatar
```http
POST http://localhost:9000/api/users/profile/avatar
Headers:
  X-User-Id: 1
  Content-Type: multipart/form-data
Body:
  file: [chọn file ảnh]

Response (Success):
{
  "avatarUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123456/avatars/1/uuid.jpg"
}

Response (Error):
{
  "error": "File size must be less than 5MB"
}
```

### Delete Avatar
```http
DELETE http://localhost:9000/api/users/profile/avatar
Headers:
  X-User-Id: 1

Response:
{
  "message": "Avatar deleted successfully"
}
```

---

## 🎨 Cloudinary Features (Auto Apply)

Avatar của bạn sẽ tự động được:
- ✅ **Resize** max 500x500px (giữ tỷ lệ)
- ✅ **Optimize** chất lượng tự động
- ✅ **Convert** sang WebP cho browsers mới (nhẹ hơn)
- ✅ **CDN** delivery nhanh toàn cầu

---

## 📁 Cấu trúc lưu trữ

```
Cloudinary/
└── avatars/
    ├── 1/
    │   └── uuid-random.jpg
    ├── 2/
    │   └── uuid-random.png
    └── ...
```

Mỗi user có folder riêng, mỗi avatar có UUID unique.

---

## 🔍 Validation Rules

Backend tự động kiểm tra:
- ✅ **File type**: Chỉ chấp nhận ảnh (image/*)
- ✅ **File size**: Tối đa 5MB
- ✅ **Format**: JPG, PNG, GIF, WebP, etc.

---

## 🐛 Troubleshooting

### Lỗi: "Cloudinary is not configured"
**Nguyên nhân:** `cloudinary.enabled: false` hoặc thiếu credentials

**Giải pháp:**
1. Check `application.yml` → `cloudinary.enabled: true`
2. Check đã điền đầy đủ `cloud-name`, `api-key`, `api-secret`
3. Restart lại service

---

### Lỗi: "Invalid credentials"
**Nguyên nhân:** Cloud Name/API Key/Secret sai

**Giải pháp:**
1. Login vào Cloudinary Dashboard
2. Copy lại chính xác 3 thông tin
3. Paste vào `application.yml`
4. Đảm bảo không có space thừa
5. Restart service

---

### Lỗi: "File size must be less than 5MB"
**Nguyên nhân:** File ảnh quá lớn

**Giải pháp:**
1. Resize ảnh trước khi upload
2. Hoặc compress ảnh online: https://tinypng.com/
3. Hoặc chọn ảnh khác nhỏ hơn

---

### Avatar không hiển thị trên Profile
**Nguyên nhân:** Frontend chưa nhận được avatarUrl

**Giải pháp:**
1. Mở Console (F12) → Network tab
2. Upload avatar và check response có `avatarUrl` không
3. Refresh trang (Ctrl + F5)
4. Check API `/api/users/profile` có trả về `avatarUrl` không

---

## 📊 Monitoring Usage

1. Login vào Cloudinary Dashboard
2. Vào **Media Library** → Xem tất cả ảnh đã upload
3. Vào **Usage** → Xem storage & bandwidth đã dùng

Free tier:
- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25,000/month

---

## 🔐 Security Best Practices

### Production Setup:

1. **Dùng Environment Variables** thay vì hardcode trong `application.yml`:

```bash
# Set environment variables
export CLOUDINARY_CLOUD_NAME=your-cloud-name
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret
```

```yaml
# application.yml
cloudinary:
  enabled: true
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
```

2. **KHÔNG commit credentials** vào Git:
   - Dùng `.env` file hoặc environment variables
   - Add vào `.gitignore` nếu dùng config file riêng

---

## 🎁 Bonus: Advanced Features

### Transform URLs (không cần code, chỉ đổi URL)

**Resize to thumbnail 200x200:**
```
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/avatars/1/uuid.jpg
```

**Circle crop (avatar tròn):**
```
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill,r_max/avatars/1/uuid.jpg
```

**Blur background:**
```
https://res.cloudinary.com/demo/image/upload/e_blur:1000/avatars/1/uuid.jpg
```

Đọc thêm: https://cloudinary.com/documentation/image_transformations

---

## ✅ Checklist Setup

- [ ] Đăng ký Cloudinary account
- [ ] Copy Cloud Name, API Key, API Secret
- [ ] Cập nhật `application.yml`
- [ ] Chạy SQL migration
- [ ] Rebuild user-service (`mvn clean install`)
- [ ] Restart user-service
- [ ] Test upload avatar từ frontend
- [ ] Check avatar hiển thị đúng

---

## 📚 Links hữu ích

- **Cloudinary Console**: https://cloudinary.com/console
- **Dashboard**: https://cloudinary.com/console/media_library
- **Usage Stats**: https://cloudinary.com/console/usage
- **Documentation**: https://cloudinary.com/documentation
- **Java SDK Docs**: https://cloudinary.com/documentation/java_integration

---

## 🆘 Cần help?

Nếu gặp vấn đề:
1. Check logs của user-service
2. Check Cloudinary Dashboard → Recent uploads
3. Test API bằng Postman trước
4. Check console.log trong browser

**Setup xong chỉ mất 5 phút và dùng FREE mãi mãi!** 🎉

