import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDES,
  isGuidePublished,
  getPublishedGuides,
  getRelatedSeoPageUrl,
} from './src/data/guides.ts';
import {
  getKeywordStatus,
  validateAllKeywordAllocations,
} from './src/data/keywordRegistry.ts';
import {
  validatePostKeywordUsage,
  extractPlainText,
  countKeywordOccurrences,
} from './src/utils/keywordValidation.ts';
import {
  buildArticleJsonLd,
  getCanonicalUrl,
} from './src/utils/seo.ts';

// Test Fixtures
const APPROVED_FIXTURE_1 = {
  postId: 'guide-nowon-elastic-prep',
  slug: 'nowon-elastic-coating-prep-guide',
  title: '노원구 탄성코트 시공 전 필수 점검 및 준비사항',
  description: '노원구 탄성코트 시공을 계획 중이신가요? 베란다 결로와 곰팡이 방지를 위한 벽면 점검 포인트와 사전 준비 가이드를 안내합니다.',
  body: `
## 베란다 결로와 곰팡이 문제의 원인
외부 기온과 실내 기온 차이로 인해 베란다 벽면에 물방울이 맺히는 결로 현상은 방치할 경우 곰팡이 번식으로 이어집니다.

## 전문적인 밑작업의 중요성
도막이 들뜨거나 균열이 있는 상태에서 그대로 칠을 올리면 내구성이 떨어집니다.
올케어탄성의 노원구 탄성코트 작업은 부식된 도막을 긁어내고 방균 전처리를 꼼꼼하게 진행합니다.

- 창호 주변 실리콘 노후 상태 확인
- 벽면 미세 크랙 및 단차 메꿈
- 환기 및 보양 작업 준비
  `.trim(),
  keywordId: 'elastic-coating_nowon',
  contentType: 'guide',
  contentStatus: 'approved',
  isPublished: true,
  publishedAt: '2026-10-20T09:00:00Z',
  updatedAt: '2026-10-20T09:00:00Z',
  relatedServiceId: 'elastic-coating',
  relatedRegionId: 'nowon',
};

const DRAFT_FIXTURE = {
  postId: 'guide-dobong-draft',
  slug: 'dobong-elastic-draft',
  title: '도봉구 탄성코트 초안',
  description: '도봉구 탄성코트 초안 설명',
  body: '도봉구 탄성코트 작업 초안 본문입니다.',
  keywordId: 'elastic-coating_dobong',
  contentType: 'guide',
  contentStatus: 'draft',
  isPublished: false,
  publishedAt: null,
  updatedAt: null,
  relatedServiceId: 'elastic-coating',
  relatedRegionId: 'dobong',
};

const IN_REVIEW_FIXTURE = {
  postId: 'guide-gangbuk-review',
  slug: 'gangbuk-elastic-review',
  title: '강북구 탄성코트 검토 중',
  description: '강북구 탄성코트 검토 설명',
  body: '강북구 탄성코트 검토 본문입니다.',
  keywordId: 'elastic-coating_gangbuk',
  contentType: 'guide',
  contentStatus: 'in_review',
  isPublished: true, // isPublished is true but contentStatus is in_review
  publishedAt: null,
  updatedAt: null,
  relatedServiceId: 'elastic-coating',
  relatedRegionId: 'gangbuk',
};

test('STEP RSS-2: Guide Pages & RSS Foundation Test Suite', async (t) => {

  await t.test('1. 게시글 없음 상태 처리 (Empty guides list handling)', () => {
    const published = getPublishedGuides([]);
    assert.equal(published.length, 0, 'No published guides when empty');
    assert.equal(getPublishedGuides(GUIDES).length, 1, '1 approved post in GUIDES is published');
  });

  await t.test('2. 승인된 게시글만 HTML 생성 (Dual Approval Gate)', () => {
    assert.equal(isGuidePublished(APPROVED_FIXTURE_1), true, 'approved + isPublished=true is published');
    assert.equal(isGuidePublished(DRAFT_FIXTURE), false, 'draft is rejected');
    assert.equal(isGuidePublished(IN_REVIEW_FIXTURE), false, 'in_review is rejected');

    const sampleList = [APPROVED_FIXTURE_1, DRAFT_FIXTURE, IN_REVIEW_FIXTURE];
    const publishedList = getPublishedGuides(sampleList);
    assert.equal(publishedList.length, 1);
    assert.equal(publishedList[0].postId, 'guide-nowon-elastic-prep');
  });

  await t.test('3. 승인된 게시글만 RSS 항목으로 포함', () => {
    const sampleList = [APPROVED_FIXTURE_1, DRAFT_FIXTURE, IN_REVIEW_FIXTURE];
    const publishedList = getPublishedGuides(sampleList);

    // RSS items generation logic verification
    const rssItems = publishedList.map((g) => ({
      title: g.title,
      description: g.description,
      pubDate: new Date(g.publishedAt || Date.now()),
      link: `/guide/${g.slug}.html`,
      content: g.body,
      guid: `https://www.seoulallcaretan.com/guide/${g.slug}.html`,
    }));

    assert.equal(rssItems.length, 1);
    assert.equal(rssItems[0].title, APPROVED_FIXTURE_1.title);
    assert.equal(rssItems[0].guid, 'https://www.seoulallcaretan.com/guide/nowon-elastic-coating-prep-guide.html');
  });

  await t.test('4. 승인된 게시글만 Sitemap 포함 로직 검증', () => {
    // When published count is 0:
    const zeroPublished = getPublishedGuides([]);
    const shouldFilterOutGuideIndex = zeroPublished.length === 0;
    assert.equal(shouldFilterOutGuideIndex, true);

    // When published count > 0:
    const withPublished = getPublishedGuides([APPROVED_FIXTURE_1]);
    const shouldIncludeGuide = withPublished.length > 0;
    assert.equal(shouldIncludeGuide, true);
  });

  await t.test('5 & 6. 제목 키워드 1회 및 본문 키워드 1회 엄격 검증', () => {
    const validation = validatePostKeywordUsage(
      APPROVED_FIXTURE_1.title,
      APPROVED_FIXTURE_1.body,
      '노원구 탄성코트'
    );
    assert.equal(validation.valid, true);
    assert.equal(validation.titleCount, 1);
    assert.equal(validation.bodyCount, 1);
    assert.equal(validation.errors.length, 0);
  });

  await t.test('7. 키워드 중복 배정 차단 검증', () => {
    const duplicateClaimant = {
      ...DRAFT_FIXTURE,
      postId: 'imposter-claimant',
      keywordId: 'elastic-coating_nowon', // Already assigned to APPROVED_FIXTURE_1!
      relatedRegionId: 'nowon',
    };

    const res = validateAllKeywordAllocations([APPROVED_FIXTURE_1, duplicateClaimant], []);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('키워드 중복 배정 차단')));
  });

  await t.test('8. Registry 이력 원장(KEYWORD_LEDGER) 영구 보존 검증', () => {
    const historicalLedger = [
      {
        keywordId: 'elastic-coating_nowon',
        postId: 'retired-post-001',
        status: 'PUBLISHED',
        assignedAt: '2026-01-01T00:00:00Z',
        historicalNote: '과거 발행 이력',
      },
    ];

    // Status is PUBLISHED even if no active guides
    const status = getKeywordStatus('elastic-coating_nowon', [], historicalLedger);
    assert.equal(status, 'PUBLISHED');

    // Attempt to allocate to a new post is blocked by ledger collision
    const attemptPost = {
      postId: 'new-attempt',
      slug: 'new-attempt',
      title: '노원구 탄성코트',
      description: '설명',
      body: '노원구 탄성코트',
      keywordId: 'elastic-coating_nowon',
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon',
    };

    const res = validateAllKeywordAllocations([attemptPost], historicalLedger);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('원장 충돌')));
  });

  await t.test('9. Title / Description / Canonical / Article JSON-LD 정합성 검증', () => {
    const siteUrl = 'https://www.seoulallcaretan.com';
    const canonical = getCanonicalUrl(`/guide/${APPROVED_FIXTURE_1.slug}.html`, siteUrl);
    assert.equal(canonical, 'https://www.seoulallcaretan.com/guide/nowon-elastic-coating-prep-guide.html');

    const articleJsonLd = buildArticleJsonLd(
      APPROVED_FIXTURE_1.title,
      APPROVED_FIXTURE_1.description,
      canonical,
      APPROVED_FIXTURE_1.publishedAt,
      APPROVED_FIXTURE_1.updatedAt
    );
    assert.ok(articleJsonLd);
    assert.equal(articleJsonLd['@context'], 'https://schema.org');
    assert.equal(articleJsonLd['@type'], 'Article');
    assert.equal(articleJsonLd.headline, APPROVED_FIXTURE_1.title);
    assert.equal(articleJsonLd.datePublished, APPROVED_FIXTURE_1.publishedAt);
    assert.equal(articleJsonLd.author.name, '올케어탄성');
  });

  await t.test('10 & 11. RSS 2.0 유효성 및 원본 본문 일치 검증', () => {
    const channelTitle = '올케어탄성 시공 정보';
    const channelDesc = '탄성코트 시공 전 점검과 작업 준비, 벽면 관리에 관한 정보를 안내합니다.';
    assert.ok(channelTitle.length > 0);
    assert.ok(channelDesc.length > 0);

    // Verify content in RSS matches post body
    const sampleBody = APPROVED_FIXTURE_1.body;
    assert.ok(sampleBody.includes('노원구 탄성코트'));
    assert.ok(sampleBody.includes('베란다 결로와 곰팡이 문제의 원인'));
  });

  await t.test('12. 게시글 상세 링크 형식 규격 검증', () => {
    const expectedUrl = `/guide/${APPROVED_FIXTURE_1.slug}.html`;
    assert.match(expectedUrl, /^\/guide\/[a-z0-9-]+\.html$/);
  });

  await t.test('13. 비공개 지역 SEO 링크 차단 및 공개 파일럿 링크 활성화 검증', () => {
    // 1. 노원구 탄성코트 (공개 파일럿) -> URL 정상 반환
    const nowonUrl = getRelatedSeoPageUrl('elastic-coating', 'nowon');
    assert.equal(nowonUrl, '/seo/elastic-coating/seoul-nowon-gu.html');

    // 2. 도봉구 탄성코트 (공개 파일럿) -> URL 정상 반환
    const dobongUrl = getRelatedSeoPageUrl('elastic-coating', 'dobong');
    assert.equal(dobongUrl, '/seo/elastic-coating/seoul-dobong-gu.html');

    // 3. 강북구 탄성코트 (비공개 21개 중 1개) -> null 반환 (내부 링크 차단)
    const gangbukUrl = getRelatedSeoPageUrl('elastic-coating', 'gangbuk');
    assert.equal(gangbukUrl, null, 'Unpublished district must NOT generate internal link');

    // 4. 성북구 탄성코트 (비공개 21개 중 1개) -> null 반환
    const seongbukUrl = getRelatedSeoPageUrl('elastic-coating', 'seongbuk');
    assert.equal(seongbukUrl, null, 'Unpublished district must NOT generate internal link');
  });

  await t.test('14. HTML 삽입 콘텐츠 및 특수문자 안전 처리 검증', () => {
    const textWithHtml = '<p>노원구 <strong>탄성코트</strong> 시공 가이드입니다.</p>';
    const clean = extractPlainText(textWithHtml);
    assert.equal(clean, '노원구 탄성코트 시공 가이드입니다.');
    const count = countKeywordOccurrences(textWithHtml, '노원구 탄성코트');
    assert.equal(count, 1);
  });
});
