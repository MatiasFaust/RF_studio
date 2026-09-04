(function(){
  var toggle = document.getElementById('chat-toggle');
  var panel = document.getElementById('chat-panel');
  var body = document.getElementById('chat-body');
  var closeBtn = document.getElementById('chat-close');
  var questionsWrap = document.getElementById('chat-questions');

  if (!toggle || !panel || !body || !closeBtn || !questionsWrap || !window.CHAT_FAQ) return;

  function scrollToBottom(){ body.scrollTop = body.scrollHeight; }

  function addUserBubble(text){
    var row = document.createElement('div');
    row.className = 'chat-row user';
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    row.appendChild(bubble);
    body.appendChild(row);
    scrollToBottom();
  }

  function addBotBubble(text){
    var row = document.createElement('div');
    row.className = 'chat-row bot';
    var avatar = document.createElement('div');
    avatar.className = 'chat-avatar-sm';
    avatar.textContent = 'RF';
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.textContent = text;
    row.appendChild(avatar);
    row.appendChild(bubble);
    body.appendChild(row);
    scrollToBottom();
  }

  function showTyping(next){
    var row = document.createElement('div');
    row.className = 'chat-row bot';
    var avatar = document.createElement('div');
    avatar.className = 'chat-avatar-sm';
    avatar.textContent = 'RF';
    var typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(avatar);
    row.appendChild(typing);
    body.appendChild(row);
    scrollToBottom();
    setTimeout(function(){
      row.remove();
      next();
    }, 500);
  }

  window.CHAT_FAQ.forEach(function(item){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-q-btn';
    btn.textContent = item.q;
    btn.addEventListener('click', function(){
      addUserBubble(item.q);
      showTyping(function(){ addBotBubble(item.a); });
    });
    questionsWrap.appendChild(btn);
  });

  toggle.addEventListener('click', function(){
    panel.classList.toggle('open');
    toggle.classList.add('seen');
  });
  closeBtn.addEventListener('click', function(){
    panel.classList.remove('open');
  });
})();
