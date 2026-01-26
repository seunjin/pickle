# 🔄 Pickle 사용자 플로우 (User Flow)

이 문서는 Pickle 서비스의 주요 사용자 여정과 화면 흐름을 정의합니다.

---

## 1. 신규 사용자 온보딩 플로우

```mermaid
flowchart TD
    A[랜딩 페이지 방문] --> B{기존 계정?}
    B -->|No| C[시작하기 클릭]
    B -->|Yes| D[로그인 클릭]
    
    C --> E[약관 동의 페이지]
    E --> F{필수 약관 동의?}
    F -->|No| E
    F -->|Yes| G[Google 로그인]
    
    D --> G
    G --> H{계정 존재?}
    H -->|No| I[계정 자동 생성]
    H -->|Yes| J[세션 생성]
    
    I --> K[기본 워크스페이스 생성]
    K --> L[대시보드 이동]
    J --> L
    
    L --> M[익스텐션 설치 안내]
    M --> N[서비스 이용 시작]
```

### 상세 단계

| 단계 | 화면 | 사용자 액션 | 시스템 처리 |
|:---|:---|:---|:---|
| 1 | 랜딩 (`/`) | 페이지 진입 | 서비스 소개 표시 |
| 2 | 랜딩 | "시작하기" 클릭 | 회원가입 페이지로 이동 |
| 3 | 약관 동의 (`/signup`) | 약관 체크 | 동의 상태 저장 |
| 4 | 약관 동의 | "동의하고 계속하기" 클릭 | Google OAuth 팝업 |
| 5 | Google 로그인 | 계정 선택 | 인증 토큰 발급 |
| 6 | - | - | 사용자/워크스페이스 생성 |
| 7 | 대시보드 (`/dashboard`) | - | 빈 대시보드 표시 |

---

## 2. 익스텐션 콘텐츠 저장 플로우

### 2.1 텍스트 저장

```mermaid
sequenceDiagram
    actor User
    participant Page as 웹 페이지
    participant Ext as 익스텐션
    participant BG as Background
    participant DB as Supabase

    User->>Page: 텍스트 드래그 선택
    User->>Page:단축키 입력 (Cmd+N)
    Page->>Ext: 키 이벤트 감지
    Ext->>Ext: 선택 텍스트 추출
    Ext->>Ext: 페이지 메타데이터 추출
    Ext->>BG: SAVE_NOTE 메시지
    BG->>DB: notes INSERT
    DB-->>BG: 저장 완료
    BG-->>Ext: 성공 응답
    Ext->>User: 토스트 알림 표시
```

### 2.2 이미지 저장

```mermaid
sequenceDiagram
    actor User
    participant Page as 웹 페이지
    participant Ext as 익스텐션
    participant BG as Background
    participant Storage as Supabase Storage
    participant DB as Supabase DB

    User->>Page: 이미지 우클릭 → "이미지 저장하기" 클릭
    Page->>Ext: 키 이벤트 감지
    Ext->>BG: SAVE_IMAGE 메시지
    BG->>BG: 용량 체크
    BG->>Storage: 이미지 업로드
    Storage-->>BG: 파일 경로
    BG->>DB: assets INSERT
    BG->>DB: notes INSERT
    DB-->>BG: 저장 완료
    BG-->>Ext: 성공 응답
    Ext->>User: 토스트 알림 표시
```

### 2.3 화면 캡처

```mermaid
sequenceDiagram
    actor User
    participant Page as 웹 페이지
    participant Ext as 익스텐션
    participant Overlay as 캡처 오버레이
    participant BG as Background
    participant DB as Supabase

    User->>Page: 단축키 입력 (Cmd+E)
    Page->>Ext: 키 이벤트 감지
    Ext->>Overlay: 캡처 모드 활성화
    User->>Overlay: 영역 드래그
    Overlay->>Ext: 선택 영역 좌표
    Ext->>BG: 탭 캡처 요청
    BG->>BG: chrome.tabs.captureVisibleTab
    BG->>BG: 영역 크롭
    BG->>BG: 용량 체크
    BG->>DB: assets + notes INSERT
    DB-->>BG: 저장 완료
    BG-->>Ext: 성공 응답
    Ext->>User: 토스트 알림 표시
```

---

## 3. 웹 대시보드 주요 플로우

### 3.1 노트 검색 및 필터링

```mermaid
flowchart LR
    A[대시보드] --> B[검색창 클릭]
    B --> C[검색어 입력]
    C --> D{필터 추가?}
    D -->|Yes| E[태그/유형 선택]
    D -->|No| F[검색 실행]
    E --> F
    F --> G[결과 목록 표시]
    G --> H[노트 클릭]
    H --> I[상세 모달 열림]
```

### 3.2 노트 편집

```mermaid
flowchart TD
    A[노트 카드 클릭] --> B[상세 모달 열림]
    B --> C{편집할 항목?}
    C -->|제목| D[제목 수정]
    C -->|메모| E[메모 수정]
    C -->|태그| F[태그 추가/삭제]
    C -->|북마크| G[북마크 토글]
    D --> H[저장]
    E --> H
    F --> H
    G --> H
    H --> I[모달 닫기]
    I --> J[목록 갱신]
```

### 3.3 노트 삭제 및 복구

```mermaid
flowchart TD
    subgraph 삭제
        A1[노트 선택] --> A2[삭제 버튼 클릭]
        A2 --> A3[휴지통으로 이동]
        A3 --> A4[deleted_at 설정]
    end
    
    subgraph 복구
        B1[휴지통 페이지] --> B2[노트 선택]
        B2 --> B3[복구 버튼 클릭]
        B3 --> B4[deleted_at null로 변경]
        B4 --> B5[대시보드에 복원]
    end
    
    subgraph 영구삭제
        C1[휴지통에서 선택] --> C2[영구 삭제 클릭]
        C2 --> C3[확인 다이얼로그]
        C3 -->|확인| C4[DB에서 완전 삭제]
        C3 -->|취소| C1
    end
```

---

## 4. 계정 관리 플로우

### 4.1 회원탈퇴

```mermaid
flowchart TD
    A[설정 페이지] --> B[계정 관리 섹션]
    B --> C[회원탈퇴 클릭]
    C --> D[경고 다이얼로그]
    D --> E{최종 확인?}
    E -->|취소| B
    E -->|확인| F[탈퇴 처리]
    F --> G[모든 데이터 삭제]
    G --> H[세션 종료]
    H --> I[랜딩 페이지 이동]
```

### 4.2 프로필 변경

```mermaid
flowchart LR
    A[설정 페이지] --> B[프로필 섹션]
    B --> C[이름 수정]
    C --> D[저장 클릭]
    D --> E[DB 업데이트]
    E --> F[성공 토스트]
```

---

## 5. 상태별 화면 분기

```mermaid
flowchart TD
    A[앱 진입] --> B{로그인 상태?}
    
    B -->|guest| C[랜딩 페이지]
    B -->|pending| D[약관 동의 페이지]
    B -->|active| E[대시보드]
    B -->|suspended| F[계정 정지 안내]
    B -->|deleted| G[로그인 페이지]
    
    C --> H{로그인 시도?}
    H -->|Yes| I[Google OAuth]
    I --> J{가입 완료 사용자?}
    J -->|Yes| E
    J -->|No| D
```

---

## 6. 에러 상황별 처리 플로우

### 6.1 네트워크 오류

```mermaid
flowchart TD
    A[저장 요청] --> B{네트워크 상태?}
    B -->|정상| C[저장 처리]
    B -->|오프라인| D[오류 토스트]
    D --> E[재시도 안내]
    E --> F{사용자 재시도?}
    F -->|Yes| A
    F -->|No| G[종료]
```

### 6.2 세션 만료

```mermaid
flowchart TD
    A[API 요청] --> B{세션 유효?}
    B -->|유효| C[요청 처리]
    B -->|만료 임박| D[Silent Refresh]
    D --> C
    B -->|완전 만료| E[로그인 페이지 이동]
    E --> F[재로그인]
    F --> G[이전 작업 복귀]
```

### 6.3 용량 초과

```mermaid
flowchart TD
    A[저장 시도] --> B{용량 체크}
    B -->|충분| C[저장 진행]
    B -->|초과 예상| D[저장 차단]
    D --> E[용량 부족 알림]
    E --> F{사용자 선택}
    F -->|기존 노트 삭제| G[휴지통 이동]
    G --> A
    F -->|취소| H[저장 취소]
```

---

## 7. 화면 구성 (Screen Map)

```
/ (랜딩)
├── /signin (로그인)
├── /signup (회원가입/약관동의)
│
├── /dashboard (대시보드) ← 로그인 후 기본
│   └── 노트 상세 모달
│
├── /search (검색)
├── /bookmarks (북마크 모음)
├── /trash (휴지통)
│
├── /settings (설정)
│   ├── 프로필
│   ├── 알림 설정
│   └── 계정 관리
│
└── /legal
    ├── /terms (이용약관)
    └── /privacy (개인정보처리방침)
```

---

*이 문서는 PRD 작성을 위한 사용자 플로우 보조 자료입니다.*
