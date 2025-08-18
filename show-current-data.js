// 현재 데이터 확인

fetch('http://localhost:3001/api/jobs')
  .then(res => res.json())
  .then(data => {
    console.log('='.repeat(60));
    console.log('현재 채용공고 데이터:');
    console.log('='.repeat(60));
    
    data.jobs.forEach((job, index) => {
      console.log(`${index + 1}. [${job.company.nameEn}] ${job.title}`);
      console.log(`   설명: ${job.description}`);
      console.log(`   위치: ${job.location}`);
      console.log(`   연봉: ${job.salary}`);
      console.log(`   URL: ${job.originalUrl}`);
      console.log('');
    });
  })
  .catch(console.error);