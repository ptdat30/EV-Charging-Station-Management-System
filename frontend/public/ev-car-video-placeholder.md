# Video Background cho HeroSection

Để sử dụng video background, bạn cần:

1. Đặt video file vào thư mục `frontend/public/` với tên:
   - `ev-car-video.mp4` (format MP4)
   - `ev-car-video.webm` (format WebM - tùy chọn, để tối ưu cho các trình duyệt khác nhau)

2. Video nên có các đặc điểm:
   - Độ phân giải: Tối thiểu 1920x1080 (Full HD)
   - Định dạng: MP4 (H.264 codec) hoặc WebM
   - Thời lượng: Khoảng 15-30 giây (sẽ tự động loop)
   - Nội dung: Xe điện đang chạy trên đường

3. Nếu bạn có URL video online, có thể cập nhật trong `HeroSection.jsx`:
   ```jsx
   <source src="https://your-video-url.com/video.mp4" type="video/mp4" />
   ```

4. Video sẽ tự động:
   - Autoplay (tự động phát)
   - Loop (lặp lại)
   - Muted (tắt tiếng)
   - Có poster image là `car_banner.png` nếu video chưa load

Lưu ý: Một số trình duyệt có thể yêu cầu video phải muted để autoplay hoạt động.

