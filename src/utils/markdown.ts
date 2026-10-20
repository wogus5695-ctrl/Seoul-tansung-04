/**
 * HTML 특수문자 이스케이프
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 정보성 가이드 마크다운 본문을 시맨틱 HTML 문자열로 변환
 * - H2 (##) -> <h2>...</h2>
 * - H3 (###) -> <h3>...</h3>
 * - 글머리 기호 목록 (- ) -> <ul><li>...</li></ul>
 * - 일반 문단 -> <p>...</p>
 * - 원본 텍스트 및 한글 인코딩 100% 보존
 */
export function renderGuideBodyToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return '';
  }

  // 문단 단위 분리 (빈 줄 기준)
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    if (block.startsWith('### ')) {
      const heading = block.replace(/^###\s+/, '').trim();
      htmlBlocks.push(`<h3>${escapeHtml(heading)}</h3>`);
    } else if (block.startsWith('## ')) {
      const heading = block.replace(/^##\s+/, '').trim();
      htmlBlocks.push(`<h2>${escapeHtml(heading)}</h2>`);
    } else if (block.startsWith('- ')) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('- '));
      const listItems = lines
        .map((l) => `<li>${escapeHtml(l.replace(/^-\s*/, '').trim())}</li>`)
        .join('');
      htmlBlocks.push(`<ul>${listItems}</ul>`);
    } else {
      // 일반 본문 문단 (내부 단일 줄바꿈은 공백 1칸으로 정규화)
      const paragraphText = block
        .split('\n')
        .map((l) => l.trim())
        .join(' ');
      htmlBlocks.push(`<p>${escapeHtml(paragraphText)}</p>`);
    }
  }

  return htmlBlocks.join('\n');
}
