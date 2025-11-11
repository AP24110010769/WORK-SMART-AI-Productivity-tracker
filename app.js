import { generateAIInsights, generateAICards } from "./ai.js";
import { handleVoiceInput } from "./chat.js";

document.getElementById("uploadBtn").addEventListener("click", handleFileUpload);
document.getElementById("generateBtn").addEventListener("click", ()=>{
  generateAIInsights(); generateAICards();
});
document.getElementById("apply-filters").addEventListener("click", applyFilters);
document.getElementById("add-task-btn").addEventListener("click", addRealTimeTask);
document.getElementById("voice-btn").addEventListener("click", handleVoiceInput);

let tasksChart, productivityChart;

function handleFileUpload(){
  const file=document.getElementById("csvFile").files[0];
  if(!file){ alert("Upload CSV"); return; }
  const reader=new FileReader();
  reader.onload=event=>{
    const parsed=parseCSV(event.target.result);
    localStorage.setItem("worksmartData",JSON.stringify(parsed));
    drawCharts(parsed); displayStatistics(parsed); generateAICards();
  };
  reader.readAsText(file);
}

function parseCSV(data){
  const rows=data.split("\n").slice(1);
  const labels=[], tasks=[], productivity=[], categories=[];
  rows.forEach(row=>{
    const cols=row.split(",");
    if(cols.length>=4){ labels.push(cols[0]); tasks.push(+cols[1]); productivity.push(+cols[2]); categories.push(cols[3]); }
  });
  return {labels,tasks,productivity,categories};
}

function addRealTimeTask(){
  const desc=document.getElementById("task-input").value.trim();
  const score=+document.getElementById("task-score").value;
  const category=document.getElementById("task-category").value;
  const today=new Date().toISOString().split("T")[0];
  if(!desc||isNaN(score)){ alert("Enter task & score"); return; }

  const data=JSON.parse(localStorage.getItem("worksmartData"))||{labels:[],tasks:[],productivity:[],categories:[]};
  data.labels.push(today); data.tasks.push(1); data.productivity.push(score); data.categories.push(category);
  localStorage.setItem("worksmartData",JSON.stringify(data));
  drawCharts(data); displayStatistics(data); generateAICards();
  document.getElementById("task-input").value=""; document.getElementById("task-score").value="";
}

function drawCharts(data){
  const ctx1=document.getElementById("tasksChart").getContext("2d");
  const ctx2=document.getElementById("productivityChart").getContext("2d");
  if(tasksChart) tasksChart.destroy();
  if(productivityChart) productivityChart.destroy();

  const categories=[...new Set(data.categories)];
  const datasetsTasks=categories.map(cat=>{
    return {label:cat, data:data.labels.map((_,i)=>data.categories[i]===cat?data.tasks[i]:0), borderColor:getColor(cat), backgroundColor:getColor(cat,0.1), borderWidth:2};
  });
  const datasetsProd=categories.map(cat=>{
    return {label:cat, data:data.labels.map((_,i)=>data.categories[i]===cat?data.productivity[i]:0), borderColor:getColor(cat), backgroundColor:getColor(cat,0.1), borderWidth:2};
  });

  tasksChart=new Chart(ctx1,{type:"line", data:{labels:data.labels,datasets:datasetsTasks}});
  productivityChart=new Chart(ctx2,{type:"line", data:{labels:data.labels,datasets:datasetsProd}});
}

function getColor(category,opacity=1){
  const map={Coding:"rgba(0,120,215,"+opacity+")", Meetings:"rgba(255,165,0,"+opacity+")", Learning:"rgba(40,167,69,"+opacity+")"};
  return map[category]||`rgba(128,128,128,${opacity})`;
}

function displayStatistics(data){
  const total=data.tasks.reduce((a,b)=>a+b,0);
  const avg=data.productivity.reduce((a,b)=>a+b,0)/data.productivity.length||0;

  document.querySelector("#total-tasks p").textContent=total;
  document.querySelector("#total-tasks .progress-fill").style.width=Math.min(total*10,100)+"%";
  document.querySelector("#avg-productivity p").textContent=avg.toFixed(2);
  document.querySelector("#avg-productivity .progress-fill").style.width=avg+"%";
  document.querySelector("#weekly-trend p").textContent=(data.productivity.slice(-7).reduce((a,b)=>a+b,0)/Math.min(7,data.productivity.length)).toFixed(2);
}


function applyFilters(){
  const start=document.getElementById("start-date").value;
  const end=document.getElementById("end-date").value;
  const cat=document.getElementById("category-filter").value;
  let data=JSON.parse(localStorage.getItem("worksmartData"));
  if(!data) return;

  let filtered={labels:[],tasks:[],productivity:[],categories:[]};
  data.labels.forEach((label,i)=>{
    if((!start||label>=start)&&(!end||label<=end)&&(!cat||data.categories[i]===cat)){
      filtered.labels.push(label);
      filtered.tasks.push(data.tasks[i]);
      filtered.productivity.push(data.productivity[i]);
      filtered.categories.push(data.categories[i]);
    }
  });
  drawCharts(filtered); displayStatistics(filtered);
  generateAICards(filtered);
}
