const fs = require('fs');

const filePath = 'src/app/api/jobs/[id]/route.ts';
const content = fs.readFileSync(filePath, 'utf8');

// 업데이트할 공고들의 상세 설명
const updates = {
  'cmeijv0ju000bnknb7cmlb8mt': {
    title: '카카오톡 SRE 엔지니어',
    description: `🔧 카카오톡 SRE(Site Reliability Engineer) 엔지니어를 모집합니다!

주요 업무:
• 카카오톡 서비스 인프라 안정성 및 확장성 관리
• 24/7 서비스 모니터링 및 장애 대응
• CI/CD 파이프라인 구축 및 자동화
• 서버 성능 최적화 및 용량 계획
• 클라우드 인프라 설계 및 운영
• 장애 예방 및 복구 프로세스 개선

자격 요건:
• Linux 시스템 관리 및 네트워크 지식 3년 이상
• Docker, Kubernetes 등 컨테이너 기술 경험
• AWS, GCP 등 클라우드 플랫폼 운영 경험
• Python, Shell Script 등 자동화 스크립트 작성
• 모니터링 도구 (Prometheus, Grafana) 활용 경험

우대 사항:
• 대규모 서비스 운영 경험 (일 1억 이상 트래픽)
• Terraform, Ansible 등 IaC 도구 경험
• 메시징 시스템 (Kafka, RabbitMQ) 운영 경험
• 24/7 온콜 대응 경험

카카오톡 SRE의 매력:
• 전 세계 5천만 사용자의 서비스 안정성 책임
• 최신 클라우드 기술 스택과 인프라 환경
• 대규모 트래픽 처리 및 장애 대응 전문성 확보`
  },
  'cmeijv0jv000dnknbk57gzroe': {
    title: 'MLOps Engineer (카카오브레인)',
    description: `⚙️ 카카오브레인 MLOps Engineer를 모집합니다!

주요 업무:
• ML 모델 배포 및 서빙 인프라 구축
• 모델 학습 파이프라인 자동화 시스템 개발
• AI 모델 성능 모니터링 및 A/B 테스트 환경 구축
• GPU 클러스터 관리 및 자원 최적화
• 모델 버전 관리 및 롤백 시스템 구축
• 데이터 파이프라인 및 특성 저장소 관리

자격 요건:
• Python, Docker, Kubernetes 활용 경험 3년 이상
• ML 모델 배포 및 서빙 경험
• CI/CD 파이프라인 구축 경험
• 클라우드 환경 (AWS, GCP) 사용 경험
• 리눅스 시스템 관리 및 스크립트 작성

우대 사항:
• TensorFlow Serving, TorchServe 등 모델 서빙 경험
• Kubeflow, MLflow 등 MLOps 플랫폼 경험
• 대규모 GPU 클러스터 운영 경험
• Apache Airflow, Prefect 등 워크플로우 도구 경험

카카오브레인 MLOps의 매력:
• 최첨단 AI 연구와 실제 서비스 연결
• 대규모 GPU 인프라 운영 경험
• 세계적 수준의 AI 모델 상용화 경험`
  }
};

let updatedContent = content;

// 각 업데이트 적용
Object.keys(updates).forEach(id => {
  const update = updates[id];
  const oldPattern = new RegExp(`'${id}': \\{[\\s\\S]*?originalUrl: '[^']*'\\s*\\},`, 'g');
  const newContent = `'${id}': {
        title: '${update.title}',
        description: \`${update.description}\`,
        location: '경기 성남시 분당구',
        department: 'AI개발팀',
        experience: '경력 3년 이상',
        company: { name: 'kakao', nameEn: 'Kakao Corporation' },
        originalUrl: 'https://careers.kakao.com/'
      },`;
  
  updatedContent = updatedContent.replace(oldPattern, newContent);
});

console.log('Updates completed. Check the file manually.');