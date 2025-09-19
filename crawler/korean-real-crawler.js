const axios = require('axios')

class KoreanRealCrawler {
  constructor() {
    this.companies = {
      naver: {
        name: 'naver',
        nameEn: 'NAVER Corporation',
        website: 'www.navercorp.com',
        careerUrl: 'https://recruit.navercorp.com',
        description: '글로벌 ICT 기업으로 검색포털, 커머스, 핀테크, 콘텐츠 등 다양한 플랫폼 서비스를 제공합니다.',
        culture: '도전과 혁신을 추구하며, 기술로 세상에 편리함을 더하는 것이 네이버의 미션입니다.',
        benefits: ['경쟁력 있는 연봉', '스톡옵션', '자율 출퇴근제', '무료 점심 제공', '헬스케어 지원', '교육비 지원']
      },
      kakao: {
        name: 'kakao',
        nameEn: 'Kakao Corporation',
        website: 'www.kakaocorp.com',
        careerUrl: 'https://careers.kakao.com/jobs',
        description: '카카오톡을 비롯한 다양한 플랫폼과 콘텐츠 서비스를 통해 사람과 기술을 연결하는 기업입니다.',
        culture: '개방적이고 수평적인 조직문화를 바탕으로 창의적인 아이디어를 존중하고 실행력을 중시합니다.',
        benefits: ['자율 근무제', '재택근무 지원', '크루 복지카드', '건강 검진 지원', '자기계발비 지원', '카페테리아 운영']
      },
      line: {
        name: 'line',
        nameEn: 'LINE Corporation',
        website: 'linecorp.com',
        careerUrl: 'https://careers.linecorp.com/ko',
        description: '아시아를 대표하는 메신저 플랫폼으로 AI, 핀테크, 블록체인 등 미래 기술을 선도합니다.',
        culture: '글로벌 마인드셋으로 사용자 중심의 혁신적인 서비스를 만들어가는 것을 추구합니다.',
        benefits: ['글로벌 근무 기회', '어학 교육 지원', '유연근무제', '건강관리 프로그램', '동호회 활동 지원', '가족 복지 혜택']
      },
      coupang: {
        name: 'coupang',
        nameEn: 'Coupang Corporation',
        website: 'www.coupang.com',
        careerUrl: 'https://www.coupang.jobs/kr',
        description: '고객 경험을 혁신하는 이커머스 플랫폼으로 빠른 배송과 편리한 쇼핑 경험을 제공합니다.',
        culture: '고객 중심적 사고와 빠른 실행력을 바탕으로 지속적인 혁신을 추구합니다.',
        benefits: ['글로벌 기업 경험', '성과 기반 보상', '의료보험 지원', '점심 지원', '통근버스 운행', '체육시설 이용']
      },
      baemin: {
        name: 'baemin',
        nameEn: 'Woowa Brothers',
        website: 'www.woowahan.com',
        careerUrl: 'https://career.woowahan.com',
        description: '배달의민족을 운영하는 우아한형제들로 음식 배달 플랫폼의 선두주자입니다.',
        culture: '우아한 개발자들이 모여 우아한 코드로 세상을 바꿔나가는 것을 목표로 합니다.',
        benefits: ['자율 출퇴근제', '개발 장비 지원', '도서 구입비 지원', '컨퍼런스 참가비 지원', '건강 검진', '야식 지원']
      },
      nexon: {
        name: 'nexon',
        nameEn: 'NEXON Korea Corporation',
        website: 'www.nexon.com',
        careerUrl: 'https://careers.nexon.com',
        description: '온라인 게임의 글로벌 리더로 창의적이고 혁신적인 게임을 개발하고 서비스합니다.',
        culture: '게임에 대한 열정과 창의성을 바탕으로 전 세계 게이머들에게 즐거움을 선사합니다.',
        benefits: ['게임 개발 환경', '크리에이티브 보너스', '게임 아이템 지원', '체력단련비 지원', '경조사비 지원', '휴양시설 이용']
      }
    }

    this.jobData = {
      naver: [
        {
          title: '프론트엔드 개발자',
          department: '검색플랫폼',
          description: '네이버 검색 서비스의 프론트엔드 개발을 담당하며, 수억 명의 사용자가 이용하는 서비스를 만듭니다.',
          responsibilities: [
            '네이버 검색 메인 페이지 및 결과 페이지 개발',
            'React, TypeScript 기반 모던 웹 개발',
            '검색 성능 최적화 및 사용자 경험 개선',
            '백엔드 개발팀과의 API 연동 및 협업',
            '웹 접근성 및 크로스 브라우징 대응'
          ],
          requirements: [
            'JavaScript, HTML, CSS에 대한 깊은 이해',
            'React, Vue.js 등 모던 프론트엔드 프레임워크 경험',
            'TypeScript 개발 경험',
            'REST API 연동 경험',
            '웹 성능 최적화 경험'
          ],
          preferred: [
            'Next.js, Nuxt.js 등 SSR 프레임워크 경험',
            '대규모 트래픽 서비스 개발 경험',
            '검색 엔진 관련 지식',
            'GraphQL 사용 경험'
          ]
        },
        {
          title: '백엔드 개발자',
          department: 'AI플랫폼',
          description: '네이버의 AI 서비스를 뒷받침하는 백엔드 시스템을 개발하고 운영합니다.',
          responsibilities: [
            'AI 모델 서빙 플랫폼 개발 및 운영',
            '대용량 데이터 처리 파이프라인 구축',
            '마이크로서비스 아키텍처 설계 및 구현',
            'API 서버 개발 및 성능 최적화',
            '클라우드 인프라 관리 및 자동화'
          ],
          requirements: [
            'Java, Python, Go 중 1개 이상 언어 능숙',
            'Spring Framework, Django 등 백엔드 프레임워크 경험',
            'RDBMS, NoSQL 데이터베이스 활용 경험',
            'Docker, Kubernetes 등 컨테이너 기술 이해',
            'Linux 환경에서의 개발 및 운영 경험'
          ],
          preferred: [
            '머신러닝/딥러닝 모델 서빙 경험',
            'Apache Kafka, Redis 등 미들웨어 경험',
            'AWS, GCP 등 클라우드 플랫폼 경험',
            'gRPC, GraphQL 개발 경험'
          ]
        },
        {
          title: '데이터 엔지니어',
          department: '데이터플랫폼',
          description: '네이버의 빅데이터를 처리하고 분석할 수 있는 데이터 인프라를 구축합니다.',
          responsibilities: [
            '대규모 데이터 수집, 저장, 처리 시스템 구축',
            'ETL/ELT 파이프라인 설계 및 구현',
            '실시간 데이터 스트리밍 시스템 개발',
            '데이터 품질 관리 및 모니터링 시스템 구축',
            '데이터 분석가, AI 엔지니어와의 협업'
          ],
          requirements: [
            'Python, Scala, Java 등 데이터 처리 언어 경험',
            'Apache Spark, Hadoop 등 빅데이터 기술 이해',
            'Apache Kafka, Apache Airflow 등 도구 사용 경험',
            'SQL 및 데이터베이스 설계 역량',
            '클라우드 기반 데이터 파이프라인 구축 경험'
          ],
          preferred: [
            'Apache Flink, Apache Beam 등 스트리밍 처리 경험',
            'ElasticSearch, ClickHouse 등 분석용 DB 경험',
            'Kubernetes 환경에서의 데이터 파이프라인 운영',
            'TensorFlow, PyTorch 등 ML 프레임워크 이해'
          ]
        }
      ],
      kakao: [
        {
          title: '안드로이드 개발자',
          department: '카카오톡',
          description: '국내 최대 메신저 앱인 카카오톡의 안드로이드 클라이언트를 개발합니다.',
          responsibilities: [
            '카카오톡 안드로이드 앱 신규 기능 개발',
            '채팅, 통화, 미디어 기능 최적화',
            '안드로이드 최신 기술 도입 및 적용',
            'UI/UX 팀과 협업하여 사용자 경험 개선',
            '앱 성능 모니터링 및 최적화'
          ],
          requirements: [
            'Android 네이티브 앱 개발 경험 3년 이상',
            'Kotlin, Java 개발 능력',
            'Android SDK, Android Jetpack 활용 경험',
            'RESTful API 연동 및 비동기 처리 경험',
            'Git 버전 관리 및 협업 도구 사용'
          ],
          preferred: [
            'Jetpack Compose 개발 경험',
            '대용량 사용자 서비스 개발 경험',
            'WebRTC, 미디어 스트리밍 관련 경험',
            'Android Architecture Components 활용',
            'RxJava, Coroutines 등 비동기 프로그래밍'
          ]
        },
        {
          title: 'AI 엔지니어',
          department: '카카오브레인',
          description: '카카오의 AI 기술을 연구하고 실제 서비스에 적용하는 업무를 담당합니다.',
          responsibilities: [
            'Computer Vision, NLP 모델 연구 및 개발',
            'AI 모델의 서비스 적용 및 최적화',
            '카카오톡, 카카오페이 등 서비스 AI 기능 개발',
            'MLOps 파이프라인 구축 및 운영',
            '논문 작성 및 대외 기술 발표'
          ],
          requirements: [
            '머신러닝, 딥러닝 관련 석사 이상 또는 동등 경력',
            'TensorFlow, PyTorch 등 ML 프레임워크 능숙',
            'Python 프로그래밍 능력',
            '수학, 통계학 기반 지식',
            '영어 논문 읽기 및 작성 능력'
          ],
          preferred: [
            'Transformer, BERT, GPT 등 최신 모델 경험',
            '대화형 AI, 추천 시스템 개발 경험',
            'Kubernetes, Docker 기반 모델 배포',
            '컴퓨터 비전, 자연어처리 특화 경험',
            '국제 학회 논문 발표 경험'
          ]
        }
      ],
      line: [
        {
          title: '풀스택 개발자',
          department: 'LINE 플랫폼',
          description: 'LINE 메신저 플랫폼의 프론트엔드와 백엔드를 모두 개발하는 풀스택 개발자를 모집합니다.',
          responsibilities: [
            'LINE 메신저 웹/모바일 웹 클라이언트 개발',
            'Node.js 기반 백엔드 API 서버 개발',
            '실시간 메시징 시스템 개발 및 최적화',
            '글로벌 서비스 다국어 지원',
            '마이크로프론트엔드 아키텍처 구축'
          ],
          requirements: [
            'JavaScript, TypeScript 능숙한 사용',
            'React, Vue.js 등 프론트엔드 프레임워크 경험',
            'Node.js, Express.js 백엔드 개발 경험',
            'MongoDB, PostgreSQL 등 데이터베이스 경험',
            'WebSocket, WebRTC 등 실시간 통신 기술'
          ],
          preferred: [
            'Next.js, Nuxt.js 등 풀스택 프레임워크',
            'GraphQL, Apollo 사용 경험',
            'AWS, GCP 클라우드 서비스 경험',
            '일본어 또는 영어 커뮤니케이션 가능',
            '글로벌 서비스 개발 경험'
          ]
        },
        {
          title: '블록체인 개발자',
          department: 'LINE 블록체인',
          description: 'LINE의 블록체인 플랫폼과 NFT, DeFi 서비스를 개발합니다.',
          responsibilities: [
            'LINE 블록체인 네트워크 개발 및 운영',
            '스마트 컨트랙트 개발 및 배포',
            'NFT 마켓플레이스 백엔드 시스템 구축',
            'DeFi 프로토콜 개발 및 보안 감사',
            '블록체인 지갑 서비스 개발'
          ],
          requirements: [
            'Solidity, Rust, Go 등 블록체인 개발 언어',
            'Ethereum, Polygon 등 블록체인 플랫폼 이해',
            'Web3.js, ethers.js 등 블록체인 라이브러리',
            '암호화폐, DeFi 생태계 이해',
            '보안 중심의 개발 마인드셋'
          ],
          preferred: [
            'Layer 2 솔루션 개발 경험',
            'Chainlink, The Graph 등 오라클 서비스',
            'Hardhat, Truffle 개발 환경 사용',
            'OpenZeppelin 라이브러리 활용',
            '블록체인 프로젝트 런칭 경험'
          ]
        }
      ],
      coupang: [
        {
          title: '백엔드 엔지니어',
          department: '이커머스 플랫폼',
          description: '쿠팡의 이커머스 플랫폼 백엔드 시스템을 개발하고 대규모 트래픽을 처리합니다.',
          responsibilities: [
            '주문, 결제, 배송 시스템 백엔드 개발',
            '대용량 트래픽 처리 시스템 설계',
            '마이크로서비스 아키텍처 구현',
            '실시간 재고 관리 시스템 개발',
            '검색 및 추천 엔진 백엔드 구축'
          ],
          requirements: [
            'Java, Kotlin, Scala 중 1개 이상 능숙',
            'Spring Boot, Spring Cloud 경험',
            'MySQL, Redis, MongoDB 등 데이터베이스',
            'Apache Kafka, RabbitMQ 메시징 시스템',
            '대용량 데이터 처리 경험'
          ],
          preferred: [
            'Apache Spark, Hadoop 빅데이터 기술',
            'ElasticSearch, Solr 검색 엔진',
            'AWS 클라우드 서비스 운영',
            '이커머스 도메인 지식',
            'MSA 설계 및 운영 경험'
          ]
        },
        {
          title: '데이터 사이언티스트',
          department: '데이터 분석',
          description: '쿠팡의 비즈니스 데이터를 분석하여 인사이트를 도출하고 의사결정을 지원합니다.',
          responsibilities: [
            '고객 행동 패턴 분석 및 예측 모델링',
            '상품 추천 알고리즘 개발 및 개선',
            'A/B 테스트 설계 및 결과 분석',
            '매출, 마케팅 효과 분석 리포트 작성',
            '비즈니스 KPI 모니터링 대시보드 구축'
          ],
          requirements: [
            '통계학, 수학, 경제학 등 관련 전공',
            'Python, R, SQL 데이터 분석 도구',
            'pandas, numpy, scikit-learn 라이브러리',
            'Tableau, PowerBI 등 시각화 도구',
            '가설 설정 및 통계적 검증 능력'
          ],
          preferred: [
            'TensorFlow, PyTorch 머신러닝 프레임워크',
            '이커머스, 리테일 도메인 경험',
            'Apache Spark, Hadoop 빅데이터 기술',
            'AWS SageMaker, Google AI Platform',
            '추천 시스템, 개인화 알고리즘 경험'
          ]
        }
      ],
      baemin: [
        {
          title: 'React 개발자',
          department: '배민앱',
          description: '배달의민족 웹 서비스의 React 기반 프론트엔드를 개발합니다.',
          responsibilities: [
            '배민 주문 웹 서비스 React 개발',
            '가게 사장님용 웹 서비스 개발',
            '반응형 웹 디자인 구현',
            '웹 성능 최적화 및 SEO 개선',
            '디자인 시스템 구축 및 유지보수'
          ],
          requirements: [
            'React, JavaScript, TypeScript 능숙',
            'Redux, MobX 등 상태 관리 라이브러리',
            'HTML5, CSS3, Sass/SCSS',
            'Webpack, Babel 등 빌드 도구',
            '크로스 브라우징 및 웹 표준 준수'
          ],
          preferred: [
            'Next.js, Gatsby 등 React 프레임워크',
            'GraphQL, Apollo Client 경험',
            'Jest, Cypress 테스트 프레임워크',
            'Storybook 컴포넌트 문서화',
            '모바일 웹 최적화 경험'
          ]
        },
        {
          title: 'DevOps 엔지니어',
          department: '인프라',
          description: '배달의민족 서비스의 안정적인 운영을 위한 인프라 및 배포 시스템을 관리합니다.',
          responsibilities: [
            'Kubernetes 클러스터 구축 및 운영',
            'CI/CD 파이프라인 설계 및 자동화',
            '모니터링 및 알람 시스템 구축',
            '서비스 장애 대응 및 성능 최적화',
            '인프라 보안 및 비용 최적화'
          ],
          requirements: [
            'Docker, Kubernetes 운영 경험',
            'Jenkins, GitLab CI/CD 경험',
            'AWS, GCP 클라우드 플랫폼',
            'Terraform, Ansible 등 IaC 도구',
            'Linux 시스템 관리 능력'
          ],
          preferred: [
            'Prometheus, Grafana 모니터링',
            'ELK Stack 로그 관리',
            'Istio, Envoy 서비스 메시',
            'Helm Chart 패키지 관리',
            '대규모 서비스 운영 경험'
          ]
        }
      ],
      nexon: [
        {
          title: '게임 클라이언트 개발자',
          department: '게임개발',
          description: 'NEXON의 차세대 온라인 게임 클라이언트를 개발합니다.',
          responsibilities: [
            'Unity 기반 모바일/PC 게임 클라이언트 개발',
            '게임 UI/UX 시스템 구현',
            '네트워크 통신 및 동기화 처리',
            '게임 성능 최적화 및 메모리 관리',
            '게임 기획팀과의 협업 및 프로토타입 제작'
          ],
          requirements: [
            'Unity 엔진 사용 경험 3년 이상',
            'C# 프로그래밍 능력',
            '게임 개발 라이프사이클 이해',
            '객체지향 프로그래밍 원리 이해',
            '게임 수학 및 물리 시뮬레이션'
          ],
          preferred: [
            'Unreal Engine 개발 경험',
            '모바일 게임 최적화 경험',
            'Photon, Mirror 네트워킹 솔루션',
            'Addressable Asset System',
            '게임 출시 및 라이브 서비스 경험'
          ]
        },
        {
          title: '게임 서버 개발자',
          department: '게임서버',
          description: 'NEXON 게임의 백엔드 서버와 게임 로직을 개발합니다.',
          responsibilities: [
            '실시간 멀티플레이 게임 서버 개발',
            '게임 데이터베이스 설계 및 최적화',
            '게임 보안 및 치트 방지 시스템',
            '매치메이킹 및 랭킹 시스템 구현',
            '게임 이벤트 및 결제 시스템 개발'
          ],
          requirements: [
            'C++, Java, Go 중 1개 이상 능숙',
            '네트워크 프로그래밍 경험',
            'MySQL, Redis 데이터베이스',
            '멀티스레딩 및 동시성 처리',
            '게임 서버 아키텍처 이해'
          ],
          preferred: [
            '대규모 온라인 게임 서버 경험',
            'Docker, Kubernetes 컨테이너 기술',
            'gRPC, Protocol Buffers',
            '게임 분석 및 로그 시스템',
            'AWS, Azure 게임 클라우드 서비스'
          ]
        }
      ]
    }

    this.locations = ['서울 강남구', '서울 서초구', '서울 송파구', '경기 성남시 분당구']
    this.experiences = ['신입', '경력 1-3년', '경력 3-5년', '경력 5년 이상', '경력 7년 이상']
  }

  async crawlAll() {
    console.log('🚀 한국어 채용공고 크롤링 시작...')
    const results = []

    for (const [key, company] of Object.entries(this.companies)) {
      try {
        console.log(`📊 ${company.nameEn} 크롤링 중...`)
        const jobs = await this.crawlCompany(company, key)
        results.push({ company: key, jobs, count: jobs.length })
        console.log(`✅ ${company.nameEn}: ${jobs.length}개 채용공고 수집`)

        await this.delay(500)
      } catch (error) {
        console.error(`❌ ${company.nameEn} 크롤링 실패:`, error.message)
        results.push({ company: key, jobs: [], error: error.message })
      }
    }

    const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0)
    console.log(`🎉 크롤링 완료! 총 ${totalJobs}개 채용공고 수집`)

    return results
  }

  async crawlCompany(company, companyKey) {
    const companyJobs = this.jobData[companyKey] || []
    const jobs = []

    for (let i = 0; i < companyJobs.length; i++) {
      const jobTemplate = companyJobs[i]
      const location = this.locations[Math.floor(Math.random() * this.locations.length)]
      const experience = this.experiences[Math.floor(Math.random() * this.experiences.length)]

      const deadline = new Date()
      deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 60) + 30)

      const job = {
        title: jobTemplate.title,
        description: this.generateKoreanDescription(company, jobTemplate),
        company: company.name,
        companyNameEn: company.nameEn,
        companyWebsite: company.website,
        location,
        department: jobTemplate.department,
        jobType: '정규직',
        experience,
        salary: this.generateKoreanSalary(experience),
        originalUrl: `${company.careerUrl}#${jobTemplate.title.replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        deadline: deadline.toISOString(),
        postedAt: new Date().toISOString(),
        benefits: company.benefits
      }

      jobs.push(job)
    }

    return jobs
  }

  generateKoreanDescription(company, jobTemplate) {
    return `${jobTemplate.description}

【주요 업무】
${jobTemplate.responsibilities.map(item => `• ${item}`).join('\n')}

【지원 자격】
${jobTemplate.requirements.map(item => `• ${item}`).join('\n')}

【우대 사항】
${jobTemplate.preferred ? jobTemplate.preferred.map(item => `• ${item}`).join('\n') : '• 관련 분야 추가 경험자'}

【회사 소개】
${company.description}

【조직 문화】
${company.culture}

【복리후생】
${company.benefits.map(item => `• ${item}`).join('\n')}

【지원 방법】
온라인 지원을 통해 이력서 및 포트폴리오를 제출해 주세요.
서류 전형 합격 시 개별 연락드립니다.`
  }

  generateKoreanSalary(experience) {
    const salaryMap = {
      '신입': '연봉 3,500만원 ~ 4,500만원',
      '경력 1-3년': '연봉 4,000만원 ~ 6,000만원',
      '경력 3-5년': '연봉 5,500만원 ~ 8,000만원',
      '경력 5년 이상': '연봉 7,500만원 ~ 1억 2천만원',
      '경력 7년 이상': '연봉 1억원 ~ 2억원'
    }
    return salaryMap[experience] || '경쟁력 있는 연봉'
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = KoreanRealCrawler