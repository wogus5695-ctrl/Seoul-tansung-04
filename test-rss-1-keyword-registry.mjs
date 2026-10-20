import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS } from './src/data/regions.ts';
import { SERVICES } from './src/data/services.ts';
import {
  getAllDynamicKeywords,
  getKeywordById,
  getKeywordStatus,
  validateAllKeywordAllocations,
} from './src/data/keywordRegistry.ts';
import {
  isGuidePublished,
  getPublishedGuides,
  getRelatedSeoPageUrl,
} from './src/data/guides.ts';
import {
  extractPlainText,
  countKeywordOccurrences,
  validatePostKeywordUsage,
} from './src/utils/keywordValidation.ts';

test('STEP RSS-1: Keyword Extraction & Scaling Foundation', async (t) => {
  await t.test('1. Extracts exactly 24 dynamic keywords from current 12 regions * 2 services', () => {
    const keywords = getAllDynamicKeywords();
    assert.equal(keywords.length, 24);

    const nowonElastic = keywords.find((k) => k.id === 'elastic-coating_nowon');
    assert.ok(nowonElastic);
    assert.equal(nowonElastic.keyword, '노원구 탄성코트');
    assert.equal(nowonElastic.regionName, '노원구');
    assert.equal(nowonElastic.serviceName, '탄성코트');

    const dobongElastic = keywords.find((k) => k.id === 'elastic-coating_dobong');
    assert.ok(dobongElastic);
    assert.equal(dobongElastic.keyword, '도봉구 탄성코트');

    const nowonBalcony = keywords.find((k) => k.id === 'balcony-elastic-coating_nowon');
    assert.ok(nowonBalcony);
    assert.equal(nowonBalcony.keyword, '노원구 베란다탄성코트');
  });

  await t.test('2. Dynamically scales when new regions or services are registered', () => {
    const customRegions = [
      { id: 'nowon', name: '노원구', slug: 'seoul-nowon-gu', administrativeType: 'autonomous_district', displayName: '서울 노원구', order: 1 },
      { id: 'gangnam', name: '강남구', slug: 'seoul-gangnam-gu', administrativeType: 'autonomous_district', displayName: '서울 강남구', order: 2 },
    ];
    const customServices = [
      { id: 'elastic-coating', name: '탄성코트', slug: 'elastic-coating', description: '' },
      { id: 'premium-coating', name: '프리미엄탄성', slug: 'premium-coating', description: '' },
    ];

    const scaled = getAllDynamicKeywords(customRegions, customServices);
    assert.equal(scaled.length, 4);
    const byId = getKeywordById('elastic-coating_nowon', scaled);
    assert.ok(byId);
    assert.equal(byId.keyword, '노원구 탄성코트');
    assert.deepEqual(scaled.map(s => s.id).sort(), [
      'balcony-coating_gangnam', // if any
      'elastic-coating_gangnam',
      'elastic-coating_nowon',
      'premium-coating_gangnam',
      'premium-coating_nowon',
    ].filter(id => scaled.some(s => s.id === id)).sort());
  });

  await t.test('3. Initial state: All 24 keywords are AVAILABLE when GUIDES and LEDGER are empty', () => {
    const res = validateAllKeywordAllocations([], []);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.stats.totalKeywords, 24);
    assert.equal(res.stats.availableCount, 24);
    assert.equal(res.stats.reservedCount, 0);
    assert.equal(res.stats.publishedCount, 0);
  });
});

test('STEP RSS-1: Keyword Usage Registry & Duplicate Allocation Gate', async (t) => {
  await t.test('Scenario 1: Reject duplicate keywordId assignment to two different posts', () => {
    const guidesFixture = [
      {
        postId: 'guide-post-1',
        slug: 'guide-1',
        title: '노원구 탄성코트 가이드',
        description: '설명',
        body: '본문 노원구 탄성코트 내용',
        keywordId: 'elastic-coating_nowon',
        contentType: 'guide',
        contentStatus: 'draft',
        isPublished: false,
        publishedAt: null,
        updatedAt: null,
        relatedServiceId: 'elastic-coating',
        relatedRegionId: 'nowon',
      },
      {
        postId: 'guide-post-2',
        slug: 'guide-2',
        title: '노원구 탄성코트 추가 가이드',
        description: '설명2',
        body: '본문 노원구 탄성코트 내용2',
        keywordId: 'elastic-coating_nowon', // Duplicate!
        contentType: 'guide',
        contentStatus: 'draft',
        isPublished: false,
        publishedAt: null,
        updatedAt: null,
        relatedServiceId: 'elastic-coating',
        relatedRegionId: 'nowon',
      },
    ];

    const result = validateAllKeywordAllocations(guidesFixture, []);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('키워드 중복 배정 차단')));
  });

  await t.test('Scenario 2: Reject reassignment of RESERVED keyword', () => {
    const ledgerFixture = [
      {
        keywordId: 'elastic-coating_nowon',
        postId: 'guide-original',
        status: 'RESERVED',
        assignedAt: '2026-10-20T00:00:00Z',
      },
    ];

    const guidesFixture = [
      {
        postId: 'guide-imposter',
        slug: 'guide-imposter',
        title: '노원구 탄성코트',
        description: '설명',
        body: '본문 노원구 탄성코트',
        keywordId: 'elastic-coating_nowon', // Already reserved by guide-original!
        contentType: 'guide',
        contentStatus: 'draft',
        isPublished: false,
        publishedAt: null,
        updatedAt: null,
        relatedServiceId: 'elastic-coating',
        relatedRegionId: 'nowon',
      },
    ];

    const result = validateAllKeywordAllocations(guidesFixture, ledgerFixture);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('원장 충돌')));
  });

  await t.test('Scenario 3: Reject reassignment of PUBLISHED keyword', () => {
    const ledgerFixture = [
      {
        keywordId: 'elastic-coating_nowon',
        postId: 'guide-published-1',
        status: 'PUBLISHED',
        assignedAt: '2026-10-20T00:00:00Z',
      },
    ];

    const guidesFixture = [
      {
        postId: 'guide-new',
        slug: 'guide-new',
        title: '노원구 탄성코트 안내',
        description: '설명',
        body: '노원구 탄성코트 상세',
        keywordId: 'elastic-coating_nowon', // Attempting to steal published keyword!
        contentType: 'guide',
        contentStatus: 'draft',
        isPublished: false,
        publishedAt: null,
        updatedAt: null,
        relatedServiceId: 'elastic-coating',
        relatedRegionId: 'nowon',
      },
    ];

    const result = validateAllKeywordAllocations(guidesFixture, ledgerFixture);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('원장 충돌')));
  });

  await t.test('Scenario 4: Updating body of existing post maintains valid assignment', () => {
    const post = {
      postId: 'guide-post-1',
      slug: 'guide-1',
      title: '노원구 탄성코트 시공 가이드',
      description: '설명',
      body: '수정 전 노원구 탄성코트 본문',
      keywordId: 'elastic-coating_nowon',
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon',
    };

    const initialResult = validateAllKeywordAllocations([post], []);
    assert.equal(initialResult.valid, true);

    // Body updated
    const updatedPost = { ...post, body: '수정 후 최신 노원구 탄성코트 본문', updatedAt: '2026-10-20T10:00:00Z' };
    const updatedResult = validateAllKeywordAllocations([updatedPost], []);
    assert.equal(updatedResult.valid, true);
  });

  await t.test('Scenario 5: New region/service automatically adds AVAILABLE candidate', () => {
    const extraRegion = { id: 'guro', name: '구로구', slug: 'seoul-guro-gu', administrativeType: 'autonomous_district', displayName: '서울 구로구', order: 13 };
    const allKw = getAllDynamicKeywords([...REGIONS, extraRegion], SERVICES);
    assert.equal(allKw.length, 26); // 13 * 2 = 26
    const guroKw = allKw.find(k => k.id === 'elastic-coating_guro');
    assert.ok(guroKw);
    assert.equal(getKeywordStatus(guroKw.id, [], []), 'AVAILABLE');
  });

  await t.test('Scenario 6: Reports integrity error if keywordId in post or ledger is non-existent', () => {
    const corruptPost = {
      postId: 'guide-corrupt',
      slug: 'corrupt',
      title: '테스트',
      description: '설명',
      body: '본문',
      keywordId: 'non-existent-service_unknown-region',
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'non-existent-service',
      relatedRegionId: 'unknown-region',
    };

    const result = validateAllKeywordAllocations([corruptPost], []);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('게시글 무결성 오류')));
  });

  await t.test('Scenario 7: Retired/deleted post history in Ledger prevents keyword reuse', () => {
    // Post has been removed from GUIDES array, but ledger retains historical PUBLISHED record
    const guides = []; // Empty active guides
    const ledger = [
      {
        keywordId: 'elastic-coating_nowon',
        postId: 'retired-post-99',
        status: 'PUBLISHED',
        assignedAt: '2026-01-01T00:00:00Z',
        historicalNote: '과거 발행 후 보관 처리된 게시글',
      },
    ];

    // Status must remain PUBLISHED, not AVAILABLE
    const status = getKeywordStatus('elastic-coating_nowon', guides, ledger);
    assert.equal(status, 'PUBLISHED');

    // A new post trying to claim this retired keyword is rejected
    const newClaimant = {
      postId: 'new-post-claim',
      slug: 'new-claim',
      title: '노원구 탄성코트',
      description: '설명',
      body: '본문 노원구 탄성코트',
      keywordId: 'elastic-coating_nowon',
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon',
    };

    const result = validateAllKeywordAllocations([newClaimant], ledger);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('원장 충돌')));
  });

  await t.test('Scenario 8: Misaligned region/service attributes in post are rejected', () => {
    const misalignedPost = {
      postId: 'misaligned-1',
      slug: 'misaligned',
      title: '도봉구 탄성코트 가이드',
      description: '설명',
      body: '본문 도봉구 탄성코트',
      keywordId: 'elastic-coating_dobong', // Keyword is dobong
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon', // Mismatch! regionId says nowon!
    };

    const result = validateAllKeywordAllocations([misalignedPost], []);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('키워드 불일치 오류')));
  });
});

test('STEP RSS-1: Keyword Usage Frequency (Exact 1 Title / 1 Body) Validation', async (t) => {
  const keyword = '노원구 탄성코트';

  await t.test('Passes when keyword appears exactly 1 time in title and 1 time in body', () => {
    const title = '노원구 탄성코트 시공 전 필독 가이드';
    const body = `
      # 베란다 관리의 기초
      베란다 벽면 곰팡이와 결로를 방지하려면 정기적인 환기가 필요합니다.
      올케어탄성의 노원구 탄성코트 시공은 정밀한 보양과 꼼꼼한 전처리를 거칩니다.
      - 창호 주변 실리콘 점검
      - 벽면 균열 메꿈 작업
    `;
    const res = validatePostKeywordUsage(title, body, keyword);
    assert.equal(res.valid, true);
    assert.equal(res.titleCount, 1);
    assert.equal(res.bodyCount, 1);
    assert.equal(res.errors.length, 0);
  });

  await t.test('Fails when keyword is missing in title (0 times)', () => {
    const title = '베란다 결로 방지 전문 시공 팁';
    const body = '올케어탄성의 노원구 탄성코트 작업 과정입니다.';
    const res = validatePostKeywordUsage(title, body, keyword);
    assert.equal(res.valid, false);
    assert.equal(res.titleCount, 0);
    assert.ok(res.errors.some(e => e.includes('제목 키워드 누락')));
  });

  await t.test('Fails when keyword is duplicated in title (> 1 times)', () => {
    const title = '노원구 탄성코트 전문 업체 노원구 탄성코트 후기';
    const body = '올케어탄성의 노원구 탄성코트 작업 과정입니다.';
    const res = validatePostKeywordUsage(title, body, keyword);
    assert.equal(res.valid, false);
    assert.equal(res.titleCount, 2);
    assert.ok(res.errors.some(e => e.includes('제목 키워드 초과')));
  });

  await t.test('Fails when keyword is missing in body (0 times)', () => {
    const title = '노원구 탄성코트 시공 가이드';
    const body = '베란다 벽면 곰팡이 예방을 위한 기본 안내서입니다.';
    const res = validatePostKeywordUsage(title, body, keyword);
    assert.equal(res.valid, false);
    assert.equal(res.bodyCount, 0);
    assert.ok(res.errors.some(e => e.includes('본문 키워드 누락')));
  });

  await t.test('Fails when keyword is overused in body (> 1 times)', () => {
    const title = '노원구 탄성코트 시공 가이드';
    const body = `
      노원구 탄성코트 작업을 시작하기 전에 벽면을 점검해야 합니다.
      그리고 나서 노원구 탄성코트 도포를 실시합니다.
    `;
    const res = validatePostKeywordUsage(title, body, keyword);
    assert.equal(res.valid, false);
    assert.equal(res.bodyCount, 2);
    assert.ok(res.errors.some(e => e.includes('본문 키워드 초과')));
  });

  await t.test('Extracts plain text cleanly from Markdown and HTML without false counts', () => {
    const rawMarkdown = `
      # 노원구 탄성코트 시공 가이드
      
      <!-- 주석: 노원구 탄성코트 관련 메모 -->
      <div class="card" data-kw="노원구 탄성코트">
        <p>실제 본문 내용에서 <strong>노원구 탄성코트</strong> 시공 노하우를 소개합니다.</p>
      </div>
      
      \`\`\`js
      const code = "노원구 탄성코트";
      \`\`\`
      
      ![이미지 설명: 노원구 탄성코트](https://example.com/img.jpg)
      [링크 텍스트](https://example.com/seo/elastic-coating/seoul-nowon-gu.html)
    `;

    const plain = extractPlainText(rawMarkdown);
    // Attributes, code blocks, comments, image tags should be stripped or plain text
    assert.ok(!plain.includes('```'));
    assert.ok(!plain.includes('<div'));

    const count = countKeywordOccurrences(rawMarkdown, keyword);
    // In rawMarkdown:
    // Heading: 1 ("노원구 탄성코트 시공 가이드")
    // Strong in p: 1 ("노원구 탄성코트 시공 노하우")
    // Total rendered plain text keyword count = 2
    assert.equal(count, 2);
  });
});

test('STEP RSS-1: Dual Approval Gate & Internal Link Isolation', async (t) => {
  await t.test('Publication gate requires both isPublished: true AND contentStatus: "approved"', () => {
    const draftApproved = {
      isPublished: true,
      contentStatus: 'draft',
    };
    assert.equal(isGuidePublished(draftApproved), false);

    const inReviewApproved = {
      isPublished: true,
      contentStatus: 'in_review',
    };
    assert.equal(isGuidePublished(inReviewApproved), false);

    const approvedNotPublished = {
      isPublished: false,
      contentStatus: 'approved',
    };
    assert.equal(isGuidePublished(approvedNotPublished), false);

    const fullyApproved = {
      postId: 'p-1',
      slug: 'p-1',
      title: '제목',
      description: '설명',
      body: '본문',
      keywordId: 'elastic-coating_nowon',
      contentType: 'guide',
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon',
      publishedAt: null,
      updatedAt: null,
      isPublished: true,
      contentStatus: 'approved',
    };
    assert.equal(isGuidePublished(fullyApproved), true);

    const publishedList = getPublishedGuides([draftApproved, fullyApproved]);
    assert.equal(publishedList.length, 1);
    assert.equal(publishedList[0].postId, 'p-1');
  });

  await t.test('Related SEO page link is provided only if the regional page is actually published', () => {
    // 1. Published pilot: nowon elastic coating -> returns valid URL
    const nowonUrl = getRelatedSeoPageUrl('elastic-coating', 'nowon');
    assert.equal(nowonUrl, '/seo/elastic-coating/seoul-nowon-gu.html');

    // 2. Published pilot: dobong elastic coating -> returns valid URL
    const dobongUrl = getRelatedSeoPageUrl('elastic-coating', 'dobong');
    assert.equal(dobongUrl, '/seo/elastic-coating/seoul-dobong-gu.html');

    // 3. Unpublished district: gangbuk elastic coating -> returns null (link suppressed!)
    const gangbukUrl = getRelatedSeoPageUrl('elastic-coating', 'gangbuk');
    assert.equal(gangbukUrl, null);

    // 4. Non-existent region/service -> returns null
    const invalidUrl = getRelatedSeoPageUrl('non-existent', 'unknown');
    assert.equal(invalidUrl, null);
  });
});
