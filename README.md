# 면접 일정 조율 앱

Aents 면접 일정 조율 시스템 — Next.js + Vercel KV

## 배포 순서

### 1. GitHub에 올리기
1. github.com → New repository → `interview-scheduler`
2. 이 폴더 전체를 올림

### 2. Vercel 배포
1. vercel.com → New Project → GitHub 연결
2. `interview-scheduler` 선택 → Deploy

### 3. Vercel KV 연결
1. Vercel 대시보드 → Storage → Create KV
2. 이름: `interview-kv` → Create
3. 프로젝트에 Connect → 환경변수 자동 주입됨

### 4. 재배포
Vercel 대시보드 → Deployments → Redeploy

끝! 링크가 생깁니다 🎉

## 로컬 테스트
```bash
npm install
# .env.local 파일에 KV 환경변수 입력 후
npm run dev
```
