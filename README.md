# 득근의 숲 (Muscle Forest)

### **"고민은 AI가, 당신은 딸깍."**
> 2030 세대를 위한 게이미피케이션 기반 AI 헬스케어 웹 서비스

![Project Status](https://img.shields.io/badge/Project-Capstone_Design-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Gemini-green)

## 프로젝트 소개
득근의 숲은 운동을 작심삼일로 끝내는 2030 세대를 위해 개발된 웹 서비스입니다.
복잡한 수치 기록 대신 캐릭터 육성이라는 게임 요소를 도입하고, Google Gemini API를 활용하여 자연어로 쉽고 간편하게 식단과 운동 루틴을 코칭받을 수 있습니다.

앱 설치나 회원가입의 번거로움 없이, 웹에서 즉시 실행 가능한 간편한 접근성을 자랑합니다.

## 핵심 기능

### 1. 게이미피케이션
- 운동 및 식단 기록에 따라 캐릭터(시바견)가 실시간으로 근육형으로 진화합니다.
- 정량적 수치 대신 시각적인(정성적) 보상을 통해 자발적인 운동 습관을 형성합니다.

### 2. AI 자연어 코칭
- Google Gemini API(개발 기준 2.5 flash) 기반의 LLM을 활용했습니다.
- `"오늘 닭가슴살 먹었어"`라고 말하면 AI가 영양 성분을 자동 분석하고 칼로리를 계산합니다.
- 사용자의 수준에 맞는 운동 루틴을 자동으로 생성해 줍니다.

### 3. 진입 장벽 제거
- 별도의 앱 설치 과정이 필요 없는 웹 애플리케이션입니다.
- 링크 클릭 한 번으로 모든 기능을 이용할 수 있습니다.

## 기술 스택

| 구분 | 사용한 기술 |
| :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js) ![React](https://img.shields.io/badge/React-blue?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css) |
| **AI / API** | ![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=googlebard) |
| **UI Tool** | **v0** (Generative UI) |
| **Deploy** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel) |

## 시작 가이드 (Getting Started)

로컬 환경에서 프로젝트를 실행하는 방법입니다.

### 1. 레포지토리 클론 (Clone)
```bash
git clone https://https://github.com/p-seungheon/ddalkak-muscle_forest.git
cd muscle-forest
```
### 2. 패키지 설치
```bash
npm install
# or
yarn install
```

### 3. 환경 변수 설정 (Env)
최상위 경로에 `.env.local` 파일을 생성하고 Gemini API Key를 입력하세요.
```bash
GEMINI_API_KEY=YOUR_API_KEY
```

### 4. 실행 (Run)
```bash
npm run dev
```
브라우저에서 http://localhost:3000으로 접속하여 확인합니다.

.
### 👥 팀 소개
프로젝트: 동양미래대학교 정보통신공학과 IT 캡스톤 디자인 2 [J7]

팀명 : 딸깍 (Ddalkak)

팀원 : 박승헌, 김준우, 정민호

## Copyright 2025. TEAM_딸깍. All rights reserved.
