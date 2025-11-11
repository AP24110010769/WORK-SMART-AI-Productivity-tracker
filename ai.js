export function generateAIInsights(){
  const output=document.getElementById("ai-output");
  const data=JSON.parse(localStorage.getItem("worksmartData"));
  if(!data){ output.innerHTML="<p>Upload CSV or log tasks first!</p>"; return; }

  const avgTasks=data.tasks.reduce((a,b)=>a+b,0)/data.tasks.length||0;
  const avgScore=data.productivity.reduce((a,b)=>a+b,0)/data.productivity.length||0;
  const maxScore=Math.max(...data.productivity);
  const bestDay=data.labels[data.productivity.indexOf(maxScore)]||"N/A";

  let suggestion="";
  if(avgScore>75) suggestion="Excellent consistency! Maintain current habits.";
  else if(avgScore>50) suggestion="Good progress — focus on reducing distractions.";
  else suggestion="Try setting daily goals to boost productivity.";

  output.innerHTML=`
    <h4>Summary</h4>
    <p>📈 Average productivity score: <b>${avgScore.toFixed(2)}</b></p>
    <p>✅ Average tasks completed: <b>${avgTasks.toFixed(1)}</b></p>
    <p>🔥 Most productive day: <b>${bestDay}</b></p>
    <h4>AI Recommendations</h4>
    <p>${suggestion}</p>
  `;
}

export function generateAICards(data=null){
  const container=document.getElementById("ai-cards-container");
  container.innerHTML="";
  if(!data) data=JSON.parse(localStorage.getItem("worksmartData"));
  if(!data) return;

  const avgScore=data.productivity.reduce((a,b)=>a+b,0)/data.productivity.length||0;
  const totalTasks=data.tasks.reduce((a,b)=>a+b,0);
  const bestScore=Math.max(...data.productivity);
  const bestDay=data.labels[data.productivity.indexOf(bestScore)]||"N/A";

  const cards=[
    {title:"Avg Productivity", value:avgScore.toFixed(2)},
    {title:"Total Tasks", value:totalTasks},
    {title:"Best Day", value:bestDay+" ("+bestScore+")"},
    {title:"Focus Tip", value:avgScore<50?"Set micro-goals & reduce distractions":"Keep consistency, you're doing great!"}
  ];

  cards.forEach(c=>{
    const card=document.createElement("div");
    card.classList.add("ai-card");
    card.innerHTML=`<h4>${c.title}</h4><p>${c.value}</p>`;
    container.appendChild(card);
  });
}
