# Multiple Choice Quiz App

Ứng dụng quiz trắc nghiệm được xây dựng với Next.js 14, shadcn/ui, Tailwind CSS, và Prisma với MongoDB.

## 🚀 Tính năng

- **Tạo Quiz**: Tạo bài quiz trắc nghiệm với nhiều câu hỏi và đáp án
- **Làm Quiz**: Tham gia các bài quiz với giao diện thân thiện
- **Thống kê**: Xem kết quả và tiến độ học tập
- **Responsive**: Hoạt động tốt trên mọi thiết bị
- **Modern UI**: Sử dụng shadcn/ui và Tailwind CSS

## 🛠️ Công nghệ sử dụng

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **MongoDB** - Database
- **Clerk.js** - Authentication & User Management

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd multiple-choice-ui
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
```bash
cp env.example .env.local
```

Cập nhật file `.env.local` với thông tin database và Clerk:
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

4. **Setup Clerk Authentication**
- Tạo tài khoản tại [clerk.com](https://clerk.com)
- Tạo ứng dụng mới và lấy API keys
- Cập nhật các biến môi trường trong `.env.local`

5. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

6. **Chạy ứng dụng**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── quiz/              # Quiz pages
│   │   ├── page.tsx       # Quiz list
│   │   ├── create/        # Create quiz
│   │   └── [id]/          # Individual quiz
│   └── stats/             # Statistics page
├── components/            # React components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities
    ├── utils.ts          # Utility functions
    └── prisma.ts         # Prisma client
```

## 🎨 UI Components

Dự án sử dụng shadcn/ui với các component:
- Button
- Card
- Input
- Label
- Textarea

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  quizzes   Quiz[]
}

model Quiz {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  authorId    String   @db.ObjectId
  author      User     @relation(fields: [authorId], references: [id])
  questions   Question[]
}

model Question {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  text     String
  quizId   String   @db.ObjectId
  quiz     Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options  Option[]
  correctAnswer String
}

model Option {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  text       String
  questionId String   @db.ObjectId
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
}
```

## 🚀 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Mở Prisma Studio

## ✨ **Tính năng nổi bật:**
- **Authentication** - Đăng nhập/đăng ký với Clerk.js
- **User Management** - Quản lý người dùng tự động
- **Protected Routes** - Bảo vệ các trang cần đăng nhập
- **Modern UI** - Giao diện hiện đại với shadcn/ui
- **Responsive Design** - Hoạt động tốt trên mọi thiết bị
- **Dynamic Quiz Creation** - Form tạo quiz với câu hỏi động
- **Interactive Quiz Interface** - Giao diện làm quiz với progress bar
- **Statistics Dashboard** - Thống kê và kết quả chi tiết
- **Type Safety** - TypeScript cho code an toàn
- **Database Integration** - Prisma ORM với MongoDB

## 📝 TODO

- [x] Thêm authentication
- [x] Thêm user management
- [ ] Thêm quiz sharing
- [ ] Thêm timer cho quiz
- [ ] Thêm leaderboard
- [ ] Thêm quiz categories
- [ ] Thêm quiz search và filter

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.