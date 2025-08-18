-- 초기 데이터베이스 설정
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 회사 기본 데이터 삽입
INSERT INTO companies (id, name, "nameEn", logo, website, "createdAt", "updatedAt") VALUES
  (uuid_generate_v4(), 'naver', 'NAVER Corporation', null, 'https://www.navercorp.com', NOW(), NOW()),
  (uuid_generate_v4(), 'kakao', 'Kakao Corporation', null, 'https://www.kakaocorp.com', NOW(), NOW()),
  (uuid_generate_v4(), 'line', 'LINE Corporation', null, 'https://linecorp.com', NOW(), NOW()),
  (uuid_generate_v4(), 'coupang', 'Coupang Corporation', null, 'https://www.coupang.com', NOW(), NOW()),
  (uuid_generate_v4(), 'baemin', 'Woowa Brothers', null, 'https://www.woowahan.com', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 기본 태그 데이터 삽입
INSERT INTO tags (id, name) VALUES
  (uuid_generate_v4(), 'JavaScript'),
  (uuid_generate_v4(), 'TypeScript'),
  (uuid_generate_v4(), 'Python'),
  (uuid_generate_v4(), 'Java'),
  (uuid_generate_v4(), 'React'),
  (uuid_generate_v4(), 'Vue.js'),
  (uuid_generate_v4(), 'Node.js'),
  (uuid_generate_v4(), 'Spring'),
  (uuid_generate_v4(), 'Django'),
  (uuid_generate_v4(), 'Frontend'),
  (uuid_generate_v4(), 'Backend'),
  (uuid_generate_v4(), 'Full Stack'),
  (uuid_generate_v4(), 'DevOps'),
  (uuid_generate_v4(), 'Data Engineer'),
  (uuid_generate_v4(), 'Machine Learning'),
  (uuid_generate_v4(), 'Mobile'),
  (uuid_generate_v4(), 'iOS'),
  (uuid_generate_v4(), 'Android'),
  (uuid_generate_v4(), 'Cloud'),
  (uuid_generate_v4(), 'AWS')
ON CONFLICT (name) DO NOTHING;