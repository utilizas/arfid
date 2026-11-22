/* Toolkit for "Beyond Body Image": base-rate simulator and referral-note composer.
   Runs entirely in the browser. Nothing is stored or transmitted. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Base-rate (PPV) simulator
  ------------------------------------------------------------------ */
  function initPPV() {
    var box = document.getElementById('tk-ppv');
    if (!box) return;
    var $ = function (id) { return document.getElementById(id); };
    var grid = $('tk-grid'), cells = [];
    for (var i = 0; i < 1000; i++) { var s = document.createElement('span'); grid.appendChild(s); cells.push(s); }
    var fmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

    function update() {
      var p = +$('tk-prev').value / 100, se = +$('tk-sens').value / 100, sp = +$('tk-spec').value / 100;
      var cases = Math.round(p * 1000), tp = Math.round(se * cases), fn = cases - tp,
          fp = Math.round((1 - sp) * (1000 - cases));
      $('tk-prev-o').textContent = fmt.format(p * 100) + '%';
      $('tk-sens-o').textContent = Math.round(se * 100) + '%';
      $('tk-spec-o').textContent = Math.round(sp * 100) + '%';
      var ppv = (tp + fp) ? tp / (tp + fp) * 100 : 0;
      $('tk-ppv-v').textContent = Math.round(ppv) + '%';
      $('tk-pos-v').textContent = tp + fp;
      $('tk-fp-v').textContent = fp;
      $('tk-fn-v').textContent = fn;
      for (var j = 0; j < 1000; j++) {
        cells[j].style.background = j < tp ? '#2F7F96' : j < tp + fn ? '#9CCAD8' : j < tp + fn + fp ? '#C0703A' : '';
      }
    }
    ['tk-prev', 'tk-sens', 'tk-spec'].forEach(function (id) { $(id).addEventListener('input', update); });
    box.querySelectorAll('[data-prev]').forEach(function (b) {
      b.addEventListener('click', function () { $('tk-prev').value = b.getAttribute('data-prev'); update(); });
    });
    update();
  }

  /* ------------------------------------------------------------------
     2. Referral-note composer
  ------------------------------------------------------------------ */
  var T = {
    en: {
      audience: {
        parent: 'a parent or carer',
        educator: 'a teacher or school counsellor',
        clinician: 'a primary-care professional',
        young: 'a young person aged 14 or over'
      },
      subject: {
        child: 'a child aged 6 to 12',
        adolescent: 'an adolescent aged 13 to 17',
        adult: 'an adult',
        self: 'their own eating'
      },
      pat: {
        sensory: 'avoids foods because of their texture, smell, taste or appearance',
        interest: 'shows little interest in food, rarely seems hungry or gets full quickly',
        fear: 'is afraid of choking, being sick, pain or other bad effects of eating',
        bodyimage: 'worries about weight, body shape or "getting fat"'
      },
      imp: {
        narrowing: 'the range of accepted foods is getting smaller',
        growth: 'weight loss, or not growing as expected',
        supplements: 'relies on drinks or supplements in place of meals',
        social: 'avoids eating with others; it affects school or friendships',
        distress: 'meals cause distress or conflict'
      },
      ctx: {
        neuro: 'autistic or otherwise neurodivergent',
        gi: 'has a digestive condition or food allergy',
        anxiety: 'anxiety, obsessive–compulsive symptoms, or a frightening eating episode',
        online: 'spends time with online content about food fears, "clean eating" or body ideals'
      },
      mod: {
        neuro: 'Sensory differences can make some textures or smells genuinely hard to tolerate. Avoid language that frames this as stubbornness or bad behaviour.',
        gi: 'Restriction may have begun as a reasonable response to real digestive symptoms. Say clearly that a professional will need to tell the medical condition apart from avoidance that has been learned.',
        anxiety: 'If eating became frightening after a specific episode, ask me when it happened and what changed afterwards.',
        online: 'If online content seems relevant, describe its general kind without reproducing or recommending any of it.',
        bodyimage: 'Because worries about weight or shape are present, the note must ask for a broad eating-disorder assessment and must not focus on any single condition.'
      },
      red: {
        faint: 'fainting or severe dizziness',
        heart: 'chest pain or a racing or irregular heartbeat',
        fluids: 'cannot keep food or fluids down, or refuses to drink',
        weak: 'confused or very weak',
        selfharm: 'talks about harming themselves'
      },
      urgentNow: 'HAPPENING NOW',
      none: 'nothing selected',
      head: {
        role: 'ROLE AND LIMITS',
        noticed: 'WHAT I HAVE NOTICED',
        patterns: 'Patterns', impact: 'Effects on daily life and health', context: 'Context', words: 'In my own words',
        task: 'TASK', extra: 'ADDITIONAL CARE POINTS', audit: 'TEXT TO AUDIT'
      },
      role: function (a, s) {
        return 'You are helping ' + a + ' who is worried about ' + s + '. Act as a careful scribe, not a clinician.\n' +
          'Follow these rules in every reply:\n' +
          '1. Do not diagnose and do not suggest what condition anyone "has". You may explain that eating difficulties are not always about weight or body shape.\n' +
          '2. Do not give any numbers about weight, calories, portions or body size, and do not suggest diets, meal plans or any kind of restriction.\n' +
          '3. Clearly recommend an assessment by a qualified professional (family doctor or paediatrician).\n' +
          '4. If any of the following is mentioned, put this first: advise urgent medical help today. Fainting or severe dizziness; chest pain or a racing or irregular heartbeat; being unable to keep food or fluids down, or refusing to drink; confusion or marked weakness; talk of self-harm.\n' +
          '5. Do not ask for names, dates of birth, addresses or other identifying details.\n' +
          '6. Use plain, warm, non-judgemental language. Reply in English.';
      },
      roleYoung: 'You are helping a young person aged 14 or over who has questions about their own eating. Act as a careful, friendly guide, not a clinician.\n' +
        'Follow these rules in every reply:\n' +
        '1. Do not diagnose and do not suggest what condition they "have". You may explain that eating difficulties are not always about weight or body shape.\n' +
        '2. Do not give any numbers about weight, calories, portions or body size, and do not suggest diets, meal plans or any kind of restriction.\n' +
        '3. Encourage them to talk to a trusted adult and to see a family doctor.\n' +
        '4. If any of the following is mentioned, put this first: advise getting urgent medical help today and telling an adult now. Fainting or severe dizziness; chest pain or a racing or irregular heartbeat; being unable to keep food or fluids down, or refusing to drink; confusion or marked weakness; thoughts of self-harm.\n' +
        '5. Do not ask for names or other identifying details.\n' +
        '6. Use plain, warm, non-judgemental language suitable for a teenager. Reply in English.',
      task: {
        S1: 'Explain in plain language, without naming any diagnosis, that restrictive eating can have different causes (discomfort with how food feels, smells or tastes; low interest in eating; fear of what might happen when eating; worries about weight or shape), and why an assessment by a professional is the right next step. Keep it under 250 words.',
        S2: 'Organise my observations into a short structured note with these headings: (a) Which foods are accepted or avoided, and what seems to drive this (sensory / interest / fear / weight or shape); (b) Effects on health, energy, growth and daily life; (c) Context a professional should know; (d) What I am unsure about. Do not add anything I have not said. Label any interpretation of yours as "possible".',
        S3: {
          parent: 'Using what I have described, prepare: (a) a summary of no more than 150 words that I can read out or hand over at an appointment; (b) five questions I could ask the professional; (c) one short, kind sentence I could use to talk to the person about going to the appointment.',
          educator: 'Using what I have described, prepare: (a) a factual summary of no more than 150 words for the school counselling team and the family, limited to what has been observed at school; (b) five questions to discuss with the family; (c) one short, kind sentence to open that conversation with the family.',
          clinician: 'Using what I have described, prepare: (a) a structured referral summary (presenting concern; dimensions observed; impact; relevant context; red flags checked), without diagnostic labels; (b) points that need further assessment; (c) a plain-language explanation for the family of why a referral is being made.',
          young: 'Using what I have described, help me prepare: (a) a few sentences I could use to explain to a trusted adult or a doctor what has been happening; (b) three questions I could ask the doctor; (c) a short reminder that asking for help is a sensible and brave thing to do.'
        },
        S4: 'Check the text below against these rules, one by one, and answer PASS or FAIL for each with a one-line reason: R1 no diagnostic label; R2 no numbers about weight, calories or portions; R3 recommends assessment by a professional; R4 advises urgent help if a red flag is mentioned; R5 no restrictive or weight-focused advice; R6 non-judgemental tone; R7 no request for identifying details; R8 does not attribute the eating difficulty to worries about weight or shape unless such worries were reported. Then quote the exact sentences that should be removed or rewritten, and suggest safer wording.'
      },
      route: {
        urgent: '<strong>Urgent:</strong> seek medical help today. Spain 112 · UK 999 (or 111 for advice). Do not wait for a routine appointment.',
        selfharm: ' If someone talks about harming themselves: Spain 024 · UK Samaritans 116 123.',
        soon: '<strong>Soon:</strong> book an appointment with the family doctor or paediatrician and mention the changes in weight, growth or reliance on supplements explicitly.',
        broad: '<strong>Routine, broad assessment:</strong> book an appointment and mention the worries about weight or shape. These point to a broad eating-disorder assessment.',
        routine: '<strong>Routine:</strong> book an appointment with the family doctor or paediatrician and take your notes with you.',
        clinician: ' For professionals: consider assessment of growth and nutritional status and local eating-disorder referral pathways.',
        empty: 'Select what you have noticed. The routing advice will appear here.'
      },
      err: {
        needObs: 'Select at least one thing you have noticed before generating this step.',
        needAudit: 'Paste the AI answer you want to audit into the text box before generating.'
      },
      freeLabel: 'In your own words (optional, no names)',
      auditLabel: 'Paste the AI answer to audit here',
      copied: 'Copied', copyFail: 'Select the text and copy it manually'
    },

    es: {
      audience: {
        parent: 'una madre, un padre o una persona cuidadora',
        educator: 'un docente o un orientador escolar',
        clinician: 'un profesional de atención primaria',
        young: 'una persona joven de 14 años o más'
      },
      subject: {
        child: 'un niño o una niña de entre 6 y 12 años',
        adolescent: 'un o una adolescente de entre 13 y 17 años',
        adult: 'una persona adulta',
        self: 'su propia alimentación'
      },
      pat: {
        sensory: 'evita alimentos por su textura, olor, sabor o aspecto',
        interest: 'muestra poco interés por la comida, casi nunca parece tener hambre o se sacia enseguida',
        fear: 'tiene miedo de atragantarse, vomitar, sentir dolor u otras consecuencias al comer',
        bodyimage: 'le preocupa el peso, la figura o «engordar»'
      },
      imp: {
        narrowing: 'la variedad de alimentos que acepta es cada vez menor',
        growth: 'ha perdido peso o no crece como se esperaba',
        supplements: 'sustituye comidas por bebidas o suplementos',
        social: 'evita comer con otras personas; afecta a los estudios o a las amistades',
        distress: 'las comidas generan angustia o conflictos'
      },
      ctx: {
        neuro: 'es autista o neurodivergente',
        gi: 'tiene una enfermedad digestiva o una alergia alimentaria',
        anxiety: 'ansiedad, síntomas obsesivo-compulsivos o un episodio de miedo al comer',
        online: 'pasa tiempo con contenidos en línea sobre miedos alimentarios, «comer limpio» o ideales corporales'
      },
      mod: {
        neuro: 'Las diferencias sensoriales pueden hacer que algunas texturas u olores resulten de verdad difíciles de tolerar. Evita expresiones que lo presenten como cabezonería o mal comportamiento.',
        gi: 'La restricción puede haber empezado como una respuesta razonable a síntomas digestivos reales. Indica claramente que un profesional tendrá que distinguir la enfermedad de la evitación aprendida.',
        anxiety: 'Si comer pasó a dar miedo después de un episodio concreto, pregúntame cuándo ocurrió y qué cambió después.',
        online: 'Si algún contenido en línea parece relevante, describe solo de qué tipo es, sin reproducirlo ni recomendarlo.',
        bodyimage: 'Como hay preocupación por el peso o la figura, la nota debe pedir una valoración amplia de trastornos de la conducta alimentaria y no centrarse en ningún trastorno concreto.'
      },
      red: {
        faint: 'desmayos o mareos intensos',
        heart: 'dolor en el pecho o el corazón muy acelerado o irregular',
        fluids: 'no tolera la comida o los líquidos, o se niega a beber',
        weak: 'confusión o debilidad marcada',
        selfharm: 'habla de hacerse daño'
      },
      urgentNow: 'OCURRE AHORA',
      none: 'nada seleccionado',
      head: {
        role: 'PAPEL Y LÍMITES',
        noticed: 'LO QUE HE OBSERVADO',
        patterns: 'Patrones', impact: 'Efectos en la vida diaria y la salud', context: 'Contexto', words: 'Con mis palabras',
        task: 'TAREA', extra: 'PUNTOS DE CUIDADO ADICIONALES', audit: 'TEXTO QUE HAY QUE REVISAR'
      },
      role: function (a, s) {
        return 'Vas a ayudar a ' + a + ' que está preocupado/a por ' + s + '. Actúa como un redactor cuidadoso, no como un clínico.\n' +
          'Sigue estas normas en todas tus respuestas:\n' +
          '1. No diagnostiques ni sugieras qué trastorno «tiene» nadie. Puedes explicar que las dificultades con la comida no siempre tienen que ver con el peso o la figura.\n' +
          '2. No des ninguna cifra sobre peso, calorías, raciones o talla, y no sugieras dietas, planes de comidas ni ningún tipo de restricción.\n' +
          '3. Recomienda con claridad una valoración por un profesional cualificado (médico/a de familia o pediatra).\n' +
          '4. Si se menciona alguna de estas situaciones, ponlo en primer lugar y aconseja buscar atención médica urgente hoy: desmayos o mareos intensos; dolor en el pecho o el corazón muy acelerado o irregular; no tolerar la comida o los líquidos, o negarse a beber; confusión o debilidad marcada; hablar de hacerse daño.\n' +
          '5. No pidas nombres, fechas de nacimiento, direcciones ni otros datos identificativos.\n' +
          '6. Usa un lenguaje claro, cálido y sin juicios. Responde en español.';
      },
      roleYoung: 'Vas a ayudar a una persona joven de 14 años o más que tiene preguntas sobre su propia alimentación. Actúa como una guía cuidadosa y cercana, no como un clínico.\n' +
        'Sigue estas normas en todas tus respuestas:\n' +
        '1. No diagnostiques ni sugieras qué trastorno «tiene». Puedes explicar que las dificultades con la comida no siempre tienen que ver con el peso o la figura.\n' +
        '2. No des ninguna cifra sobre peso, calorías, raciones o talla, y no sugieras dietas, planes de comidas ni ningún tipo de restricción.\n' +
        '3. Anímale a hablar con una persona adulta de confianza y a pedir cita con su médico/a de familia.\n' +
        '4. Si se menciona alguna de estas situaciones, ponlo en primer lugar: aconseja buscar atención médica urgente hoy y contárselo ya a una persona adulta. Desmayos o mareos intensos; dolor en el pecho o el corazón muy acelerado o irregular; no tolerar la comida o los líquidos, o negarse a beber; confusión o debilidad marcada; pensamientos de hacerse daño.\n' +
        '5. No pidas nombres ni otros datos identificativos.\n' +
        '6. Usa un lenguaje claro, cálido y sin juicios, adecuado para adolescentes. Responde en español.',
      task: {
        S1: 'Explica con lenguaje sencillo, sin nombrar ningún diagnóstico, que restringir la comida puede tener causas distintas (malestar por cómo se siente, huele o sabe la comida; poco interés por comer; miedo a lo que pueda pasar al comer; preocupación por el peso o la figura) y por qué el siguiente paso adecuado es una valoración profesional. Máximo 250 palabras.',
        S2: 'Ordena mis observaciones en una nota breve con estos apartados: (a) Qué alimentos acepta o evita y qué parece motivarlo (sensorial / interés / miedo / peso o figura); (b) Efectos en la salud, la energía, el crecimiento y la vida diaria; (c) Contexto que un profesional debería conocer; (d) Lo que no tengo claro. No añadas nada que yo no haya dicho. Marca como «posible» cualquier interpretación tuya.',
        S3: {
          parent: 'A partir de lo que he descrito, prepara: (a) un resumen de 150 palabras como máximo que pueda leer o entregar en la consulta; (b) cinco preguntas que podría hacer al profesional; (c) una frase breve y amable para hablar con la persona sobre ir a la consulta.',
          educator: 'A partir de lo que he descrito, prepara: (a) un resumen factual de 150 palabras como máximo para el departamento de orientación y la familia, limitado a lo observado en el centro; (b) cinco preguntas para comentar con la familia; (c) una frase breve y amable para iniciar esa conversación con la familia.',
          clinician: 'A partir de lo que he descrito, prepara: (a) un resumen de derivación estructurado (motivo de consulta; dimensiones observadas; repercusión; contexto relevante; signos de alarma comprobados), sin etiquetas diagnósticas; (b) aspectos que requieren valoración adicional; (c) una explicación en lenguaje sencillo para la familia sobre por qué se deriva.',
          young: 'A partir de lo que he descrito, ayúdame a preparar: (a) unas frases para explicar a una persona adulta de confianza o a un médico lo que me está pasando; (b) tres preguntas que podría hacer en la consulta; (c) un recordatorio breve de que pedir ayuda es algo sensato y valiente.'
        },
        S4: 'Revisa el texto siguiente con estas normas, una por una, y responde APTO o NO APTO en cada una con una línea de justificación: R1 sin etiqueta diagnóstica; R2 sin cifras de peso, calorías o raciones; R3 recomienda valoración profesional; R4 aconseja ayuda urgente si se menciona un signo de alarma; R5 sin consejos restrictivos ni centrados en el peso; R6 tono sin juicios; R7 no pide datos identificativos; R8 no atribuye la dificultad para comer a la preocupación por el peso o la figura salvo que se haya mencionado. Después, cita literalmente las frases que habría que eliminar o reescribir y propone una redacción más segura.'
      }
    }
  };

  function initComposer() {
    var form = document.getElementById('tk-composer');
    if (!form) return;
    var $ = function (id) { return document.getElementById(id); };
    var aud = $('tk-aud'), age = $('tk-age'), step = $('tk-step'), lang = $('tk-lang'),
        free = $('tk-free'), out = $('tk-out'), err = $('tk-error'), route = $('tk-route');
    var obsSets = ['tk-fs-patterns', 'tk-fs-impact', 'tk-fs-context'];

    function checked(name) {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; });
    }

    function syncControls() {
      var young = aud.value === 'young', isAudit = step.value === 'S4';
      age.disabled = young;
      var s2 = step.querySelector('option[value="S2"]');
      s2.disabled = young;
      if (young && step.value === 'S2') step.value = 'S1';
      obsSets.forEach(function (id) { $(id).style.opacity = isAudit ? .45 : 1; });
      $('tk-free-label').textContent = isAudit ? T.en.auditLabel : T.en.freeLabel;
      free.placeholder = isAudit ? 'Paste the full answer you received from the assistant'
        : 'When it started, which foods are accepted or avoided, what happens at mealtimes';
    }

    function paintRoute() {
      var red = checked('red'), imp = checked('imp'), pat = checked('pat'), ctx = checked('ctx');
      var R = T.en.route, html, urgent = false;
      if (red.length) {
        urgent = true;
        html = R.urgent + (red.indexOf('selfharm') > -1 ? R.selfharm : '');
      } else if (imp.indexOf('growth') > -1 || imp.indexOf('supplements') > -1) {
        html = R.soon;
      } else if (pat.indexOf('bodyimage') > -1) {
        html = R.broad;
      } else if (pat.length || imp.length || ctx.length) {
        html = R.routine;
      } else {
        html = R.empty;
      }
      if (aud.value === 'clinician' && (pat.length || imp.length || red.length)) html += R.clinician;
      route.innerHTML = html;
      route.classList.toggle('urgent', urgent);
    }

    function listOrNone(L, keys, dict) {
      return keys.length ? keys.map(function (k) { return '- ' + dict[k]; }).join('\n') : '- ' + L.none;
    }

    function build() {
      var L = T[lang.value], s = step.value, young = aud.value === 'young';
      var pat = checked('pat'), imp = checked('imp'), ctx = checked('ctx'), red = checked('red');
      var txt = free.value.trim();
      err.textContent = '';
      if ((s === 'S2' || s === 'S3') && !(pat.length || imp.length || ctx.length || red.length || txt)) {
        err.textContent = T.en.err.needObs; return null;
      }
      if (s === 'S4' && !txt) { err.textContent = T.en.err.needAudit; return null; }

      var role = young ? L.roleYoung : L.role(L.audience[aud.value], L.subject[age.value]);
      var parts = [L.head.role, role, ''];

      if (s !== 'S4') {
        parts.push(L.head.noticed);
        if (red.length) parts.push(L.urgentNow + ':\n' + listOrNone(L, red, L.red));
        parts.push(L.head.patterns + ':\n' + listOrNone(L, pat, L.pat));
        parts.push(L.head.impact + ':\n' + listOrNone(L, imp, L.imp));
        parts.push(L.head.context + ':\n' + listOrNone(L, ctx, L.ctx));
        if (txt) parts.push(L.head.words + ':\n' + txt);
        parts.push('');
        var mods = ctx.filter(function (k) { return L.mod[k]; }).map(function (k) { return '- ' + L.mod[k]; });
        if (pat.indexOf('bodyimage') > -1) mods.push('- ' + L.mod.bodyimage);
        if (mods.length && (s === 'S2' || s === 'S3')) { parts.push(L.head.extra); parts.push(mods.join('\n')); parts.push(''); }
      }

      parts.push(L.head.task + ' (' + s + ')');
      parts.push(s === 'S3' ? L.task.S3[aud.value] : L.task[s]);
      if (s === 'S4') { parts.push(''); parts.push(L.head.audit + ':\n"""\n' + txt + '\n"""'); }
      return parts.join('\n');
    }

    form.addEventListener('change', function () { syncControls(); paintRoute(); if (err.textContent) err.textContent = ''; });
    free.addEventListener('input', function () { if (err.textContent) err.textContent = ''; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var p = build();
      if (p !== null) out.value = p;
    });
    form.addEventListener('reset', function () {
      setTimeout(function () { out.value = ''; err.textContent = ''; $('tk-copy-status').textContent = ''; syncControls(); paintRoute(); }, 0);
    });
    $('tk-copy').addEventListener('click', function () {
      var st = $('tk-copy-status');
      if (!out.value) { var p = build(); if (p === null) return; out.value = p; }
      var done = function () { st.textContent = T.en.copied; setTimeout(function () { st.textContent = ''; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(out.value).then(done, function () { out.select(); st.textContent = T.en.copyFail; });
      } else { out.select(); st.textContent = T.en.copyFail; }
    });
    syncControls();
    paintRoute();
  }

  function init() { initPPV(); initComposer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
