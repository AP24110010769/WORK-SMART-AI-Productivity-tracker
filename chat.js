const chatBox=document.getElementById("chat-box");
const userInput=document.getElementById("user-input");
const sendBtn=document.getElementById("send-btn");

sendBtn.addEventListener("click",handleUserMessage);
userInput.addEventListener("keypress",e=>{if(e.key==="Enter") handleUserMessage();});

export function handleVoiceInput(){
  if(!("webkitSpeechRecognition" in window)){ alert("Voice recognition not supported"); return; }
  const recognition=new webkitSpeechRecognition();
  recognition.lang="en-US"; recognition.interimResults=false; recognition.maxAlternatives=1;
  recognition.start();
  recognition.onresult=event=>{
    const voiceText=event.results[0][0].transcript;
    appendMessage("user",voiceText);
    const reply=getAIResponse(voiceText);
    appendMessage("bot",reply);
    speak(reply);
  };
}

function speak(text){ const u=new SpeechSynthesisUtterance(text); u.lang="en-US"; speechSynthesis.speak(u); }

function handleUserMessage(){
  const msg=userInput.value.trim(); if(!msg) return;
  appendMessage("user",msg); userInput.value="";
  const reply=getAIResponse(msg); appendMessage("bot",reply); speak(reply);
}

function appendMessage(sender,text){
  const msgDiv=document.createElement("div");
  msgDiv.classList.add(sender==="user"?"user-msg":"bot-msg");
  msgDiv.textContent=text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop=chatBox.scrollHeight;
}

function getAIResponse(input){
  input=input.toLowerCase();
  const data=JSON.parse(localStorage.getItem("worksmartData"));
  if(!data) return "🤖 Upload CSV or log tasks first!";
  const categories=["coding","meetings","learning"];
  const foundCategory=categories.find(c=>input.includes(c));

  if(input.includes("hello")||input.includes("hi")) return "Hey! 👋 How’s your productivity today?";
  if(input.includes("help")) return "Ask about best day, average productivity, top tasks, or category-specific questions.";

  if(foundCategory){
    const catIndices=data.categories.map((c,i)=>c.toLowerCase()===foundCategory?i:-1).filter(i=>i!==-1);
    if(!catIndices.length) return `No data for ${foundCategory}.`;
    if(input.includes("best")){
      const max=Math.max(...catIndices.map(i=>data.productivity[i]));
      const bestDay=data.labels[catIndices.find(i=>data.productivity[i]===max)];
      return `🔥 Most productive ${foundCategory} day: ${bestDay} (${max})`;
    }
    if(input.includes("average")){
      const avg=catIndices.map(i=>data.productivity[i]).reduce((a,b)=>a+b,0)/catIndices.length;
      return `📈 Avg productivity for ${foundCategory}: ${avg.toFixed(2)}`;
    }
    if(input.includes("task")||input.includes("completed")){
      const total=catIndices.map(i=>data.tasks[i]).reduce((a,b)=>a+b,0);
      return `✅ Total tasks in ${foundCategory}: ${total}`;
    }
  }

  if(input.includes("best day")){
    const max=Math.max(...data.productivity);
    const bestDay=data.labels[data.productivity.indexOf(max)];
    return `🔥 Most productive day: ${bestDay} (${max})`;
  }
  if(input.includes("average")){
    const avg=data.productivity.reduce((a,b)=>a+b,0)/data.productivity.length;
    return `📈 Avg productivity: ${avg.toFixed(2)}`;
  }

  return "🤖 I’m still learning! Ask about tasks, productivity, or focus tips.";
}
