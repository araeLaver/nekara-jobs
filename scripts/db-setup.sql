-- 네카라쿠배 채용 사이트 데이터베이스 추가 설정

-- 전문 검색을 위한 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 채용공고 제목 및 설명 전문 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_jobs_title_gin ON jobs USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_description_gin ON jobs USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_department_gin ON jobs USING gin(department gin_trgm_ops);

-- 복합 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_jobs_company_active_posted ON jobs(company_id, is_active, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location_type ON jobs(location, job_type) WHERE is_active = true;

-- 회사별 채용공고 수 집계를 위한 뷰
CREATE OR REPLACE VIEW v_company_job_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.name_en as company_name_en,
    COUNT(j.id) as total_jobs,
    COUNT(CASE WHEN j.is_active = true THEN 1 END) as active_jobs,
    COUNT(CASE WHEN j.posted_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_jobs,
    MAX(j.posted_at) as latest_job_date
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
GROUP BY c.id, c.name, c.name_en;

-- 인기 태그 집계 뷰
CREATE OR REPLACE VIEW v_popular_tags AS
SELECT 
    t.id as tag_id,
    t.name as tag_name,
    COUNT(jt.job_id) as job_count,
    COUNT(CASE WHEN j.is_active = true THEN 1 END) as active_job_count
FROM tags t
LEFT JOIN job_tags jt ON t.id = jt.tag_id
LEFT JOIN jobs j ON jt.job_id = j.id
GROUP BY t.id, t.name
ORDER BY job_count DESC;

-- 일별 채용공고 통계 뷰
CREATE OR REPLACE VIEW v_daily_job_stats AS
SELECT 
    DATE(posted_at) as job_date,
    COUNT(*) as jobs_posted,
    COUNT(DISTINCT company_id) as companies_posted
FROM jobs
WHERE posted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(posted_at)
ORDER BY job_date DESC;

-- 크롤링 성능 모니터링 뷰
CREATE OR REPLACE VIEW v_crawl_performance AS
SELECT 
    company,
    DATE(created_at) as crawl_date,
    COUNT(*) as crawl_attempts,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_crawls,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_crawls,
    AVG(CASE WHEN end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (end_time - start_time)) END) as avg_duration_seconds,
    SUM(COALESCE(job_count, 0)) as total_jobs_found
FROM crawl_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY company, DATE(created_at)
ORDER BY crawl_date DESC, company;

-- 채용공고 만료 처리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_jobs()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- 60일 이상 지난 채용공고를 비활성화
    UPDATE jobs 
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true 
    AND posted_at < NOW() - INTERVAL '60 days';
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- 로그 기록
    INSERT INTO crawl_logs (company, status, start_time, end_time, job_count, error_msg)
    VALUES ('system', 'success', NOW(), NOW(), expired_count, 'Cleanup expired jobs');
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 중복 채용공고 제거 함수
CREATE OR REPLACE FUNCTION remove_duplicate_jobs()
RETURNS INTEGER AS $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- 같은 제목, 회사, URL을 가진 중복 공고 중 오래된 것 제거
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY title, company_id, original_url 
                   ORDER BY posted_at DESC
               ) as rn
        FROM jobs
    )
    UPDATE jobs 
    SET is_active = false, updated_at = NOW()
    FROM duplicates 
    WHERE jobs.id = duplicates.id 
    AND duplicates.rn > 1 
    AND jobs.is_active = true;
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    
    RETURN duplicate_count;
END;
$$ LANGUAGE plpgsql;

-- 성능 최적화를 위한 파티셔닝 (선택사항)
-- 대용량 데이터 처리 시 job_views 테이블을 월별로 파티셔닝
-- ALTER TABLE job_views RENAME TO job_views_old;
-- 
-- CREATE TABLE job_views (
--     id TEXT DEFAULT gen_random_uuid(),
--     job_id TEXT NOT NULL,
--     ip_address TEXT NOT NULL,
--     user_agent TEXT,
--     viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
-- ) PARTITION BY RANGE (viewed_at);

-- 권한 설정 (필요 시)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nekara_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nekara_app_user;

COMMENT ON EXTENSION "pg_trgm" IS '텍스트 유사성 검색을 위한 trigram 확장';
COMMENT ON VIEW v_company_job_stats IS '회사별 채용공고 통계';
COMMENT ON VIEW v_popular_tags IS '인기 태그 순위';
COMMENT ON VIEW v_daily_job_stats IS '일별 채용공고 게시 통계';
COMMENT ON FUNCTION cleanup_expired_jobs() IS '만료된 채용공고 정리';
COMMENT ON FUNCTION remove_duplicate_jobs() IS '중복 채용공고 제거';