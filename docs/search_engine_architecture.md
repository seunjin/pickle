# 검색 엔진 아키텍처: Full-Text Search (FTS)

이 문서는 피클노트의 검색 엔진 고도화를 위한 Full-Text Search(FTS)의 원리, 구현 방식 및 트레이드오프를 기술합니다.

## 1. 개요 (Overview)

기존의 `LIKE` 또는 `ILIKE` 방식은 텍스트를 단순한 문자열의 나열로 취급하여 검색합니다. 반면, **Full-Text Search(FTS)**는 텍스트를 의미 있는 단위(Token)로 분해하고 이를 인덱싱하여 검색 품질과 성능을 획기적으로 개선하는 방식입니다.

## 2. 핵심 메커니즘 (Core Mechanisms)

PostgreSQL 기반의 FTS는 다음 두 가지 핵심 데이터 타입을 사용합니다.

### 2.1. tsvector (Text Search Vector)
검색 대상이 되는 텍스트를 **정규화된 토큰들의 집합**으로 변환한 형태입니다.
- **Tokenization**: "Running faster" → "run", "fast"
- **Normalization**: 중복 제거, 소문자화, 어근 추출(Stemming)
- **Weighting**: 제목(A), 본문(B) 등 중요도에 따라 가중치 부여 가능

### 2.2. tsquery (Text Search Query)
사용자의 검색어를 검색 가능한 논리 연산 형태로 변환한 것입니다.
- 예: `pickle & note` (pickle과 note가 모두 포함된 경우)
- 사용자의 가공되지 않은 검색어를 `plainto_tsquery`나 `phraseto_tsquery` 함수를 통해 변환하여 사용합니다.

### 2.3. GIN Index (Generalized Inverted Index)
FTS의 핵심 성능 비결입니다. "어떤 단어가 어떤 행에 있는지"를 기록한 거꾸로 된 지도(Inverted Index) 구조입니다.
- 단어별로 해당하는 데이터의 포인터 목록을 갖고 있어, 수만 건의 데이터에서도 단 몇 번의 인덱스 조회로 결과를 찾아냅니다.

## 3. 트레이드오프 (Trade-offs)

기술적 결정에는 항상 대가가 따릅니다. 수석 엔지니어로서 고려해야 할 사안은 다음과 같습니다.

| 장점 (Pros) | 단점 및 비용 (Cons / Costs) |
| :--- | :--- |
| **압도적 성능**: 데이터 증가 시에도 검색 속도 유지 | **저장 공간**: `tsvector` 컬럼 및 인덱스를 위한 추가 용량 필요 (원본 대비 15~30%) |
| **정확도(Relevance)**: 단순 포함이 아닌 관련성 순위 제공 | **쓰기 부하**: 데이터 추가/수정 시 `tsvector` 계산 및 인덱스 갱신 비용 발생 |
| **유연성**: 오타 교정, 유의어 검색 등으로 확장 가능 | **복잡도**: DB 스키마 관리 및 SQL 쿼리의 난이도 상승 |

## 4. 구현 전략 (Implementation Strategy)

### 4.1. 스키마 설계
`notes` 테이블에 검색을 위한 생성형 컬럼(Generated Column)을 추가합니다.
```sql
ALTER TABLE notes 
ADD COLUMN fts_tokens tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(url, '')), 'B')
) STORED;
```
> [!NOTE]
> 한국어 검색 환경을 고려하여 언어 사전을 'simple'로 설정하거나, 전문 형태소 분석기(mecab 등)를 연동할 수 있습니다. 초기 단계에서는 'simple' 방식이 가장 예측 가능한 결과를 보장합니다.

### 4.2. 검색 쿼리 고도화
단순 매칭이 아닌 관련성 점수(`ts_rank`)에 따른 자동 정렬을 지원하도록 구현합니다.

---

수석 엔지니어로서 제언하건대, 현재 피클노트의 데이터 성장세와 "정보의 축적 및 탐색"이라는 핵심 가치를 고려할 때, 이 초기 비용(스토리지)은 충분히 투자할 가치가 있는 자산입니다.
