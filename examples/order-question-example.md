# Order Question Example

## Cách tạo câu hỏi sắp xếp thứ tự:

### 1. Format dữ liệu trong database:

```json
{
  "question": "Sắp xếp các bước sau theo đúng thứ tự:",
  "type": "order",
  "answers": [
    "Bước 1: Chuẩn bị nguyên liệu",
    "Bước 2: Nấu chín thực phẩm", 
    "Bước 3: Trang trí món ăn",
    "Bước 4: Thưởng thức"
  ],
  "correctAnswers": [0, 1, 2, 3] // Thứ tự đúng: 0->1->2->3
}
```

### 2. Logic parsing:

- **Items**: `answers` array chứa các mục cần sắp xếp
- **Correct Order**: `correctAnswers` array chứa indices của thứ tự đúng
- **Current Order**: Thứ tự hiện tại của người dùng (có thể thay đổi)

### 3. Ví dụ cụ thể:

```json
{
  "question": "Sắp xếp các bước nấu cơm theo đúng thứ tự:",
  "type": "order",
  "answers": [
    "Vo gạo",
    "Cho nước vào nồi",
    "Bật bếp",
    "Đợi cơm chín"
  ],
  "correctAnswers": [0, 1, 2, 3]
}
```

### 4. Kết quả hiển thị:

**Cột trái (Thứ tự đúng):**
1. Vo gạo
2. Cho nước vào nồi  
3. Bật bếp
4. Đợi cơm chín

**Cột phải (Sắp xếp của bạn):**
- Có thể kéo thả để sắp xếp lại
- Số thứ tự tự động cập nhật
- Hiển thị trạng thái đúng/sai

### 5. Tính năng:

- ✅ **Drag & Drop** - Kéo thả để sắp xếp
- ✅ **Visual Feedback** - Hiệu ứng khi kéo, hover
- ✅ **Auto Numbering** - Số thứ tự tự động cập nhật
- ✅ **Correct Check** - Kiểm tra đúng/sai real-time
- ✅ **Reset Function** - Nút reset về thứ tự ban đầu
- ✅ **Status Display** - Hiển thị trạng thái sắp xếp
- ✅ **Responsive Design** - Tương thích mobile

### 6. Cách sử dụng:

1. **Tạo câu hỏi** với `type: "order"`
2. **Điền `answers`** với các mục cần sắp xếp
3. **Điền `correctAnswers`** với thứ tự đúng (indices)
4. **Component tự động** render giao diện 2 cột
5. **Người dùng kéo thả** để sắp xếp
6. **Hệ thống kiểm tra** và hiển thị kết quả

### 7. Ví dụ phức tạp hơn:

```json
{
  "question": "Sắp xếp các sự kiện lịch sử theo thứ tự thời gian:",
  "type": "order",
  "answers": [
    "Chiến tranh thế giới thứ 2",
    "Cách mạng Pháp",
    "Chiến tranh thế giới thứ 1", 
    "Cách mạng công nghiệp"
  ],
  "correctAnswers": [3, 1, 2, 0] // Cách mạng CN -> Cách mạng Pháp -> WW1 -> WW2
}
```

### 8. Styling:

- **Correct state**: Border xanh, background xanh nhạt
- **Incorrect state**: Border xám, background trắng
- **Drag state**: Opacity giảm, border xanh
- **Hover state**: Scale up, shadow tăng
- **Grip icon**: 6 chấm dọc để chỉ ra có thể kéo