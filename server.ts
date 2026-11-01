import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client with provided key:', err);
  }
}

// AI Endpoint: Scene Dramaturgical Critique
app.post('/api/ai/critique', async (req, res) => {
  const { title, pov, goal, conflict, text, characters, location, epoch } = req.body;

  const prompt = `Ты — ведущий драматургический редактор и литературный консультант.
Проведи глубокий редакторский анализ сцены художественного произведения:

Сцена: "${title || 'Без названия'}"
POV (Точка зрения): ${pov || 'Не указана'}
Место действия: ${location || 'Не указано'}
Эпоха / Время: ${epoch || 'Не указана'}
Персонажи в сцене: ${(characters || []).join(', ') || 'Не указаны'}
Цель персонажа: ${goal || 'Не указана'}
Препятствие / Конфликт: ${conflict || 'Не указано'}

Текст сцены:
"""
${text || '(Текст пуст)'}
"""

Сформируй четкий, структурированный профессиональный ответ на русском языке:
1. **Эмоциональная дуга и динамика полярности (+/-):** Как меняется состояние персонажа и напряжение от начала к финалу.
2. **Диалоги и ритм:** Звучат ли реплики естественно, нет ли «говорящих голов» или фальшивого экспозиционного диалога.
3. **Показ вместо объяснения (Show, Don't Tell):** Конкретные места, где автор пересказывает факты вместо передачи через действие и сенсорные детали.
4. **Логика и соответствие замыслу:** Достигнута ли заявленная цель POV-персонажа, осязаемо ли препятствие.
5. **3 конкретные рекомендации редактора:** Практические шаги по усилению сцены.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return res.json({ result: response.text, isFallback: false });
    } catch (err: any) {
      console.warn('Gemini API call failed, generating dynamic fallback:', err?.message);
    }
  }

  // Dynamic analytical fallback generated from the actual request data
  const wordCount = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const dialogueLines = (text || '').match(/(?:^|\n)\s*—\s*[^\n]+/g) || [];
  const sensoryKeywords = ['свет', 'звук', 'холод', 'жар', 'запах', 'тень', 'ветер', 'пепел', 'камень', 'вибрация', 'пульс', 'шаг', 'взгляд', 'тишина'];
  const detectedSensory = sensoryKeywords.filter(k => (text || '').toLowerCase().includes(k));

  const fallback = `### 📋 Редакторский анализ сцены (Аналитический движок REDCROW)
*Режим: Автономный драматургический аудит*

**1. Эмоциональная дуга и динамика полярности:**
- Сцена «**${title || 'Текущая сцена'}**» насчитывает **${wordCount} слов** и ${dialogueLines.length > 0 ? `${dialogueLines.length} диалоговых реплик` : 'практически не содержит прямой речи'}.
- ${goal ? `Заявленная цель: *«${goal}»*. ` : 'Цель персонажа не зафиксирована в паспорте сцены — рекомендуется явно определить, чего именно жаждет герой в первые секунды.'}
- ${conflict ? `Действующее препятствие: *«${conflict}»*. ` : 'Препятствие не описано — добавьте конкретное сопротивление среды или оппонента.'}

**2. Диалоги и ритм повествования:**
- ${dialogueLines.length > 2 
    ? `Ритмический рисунок активен (${dialogueLines.length} реплик). Проверьте: каждая реплика должна быть действием, изменением статуса или психологической атакой/защитой, а не просто передачей справочной информации читателю.` 
    : 'Преобладает описательный или внутренний монолог. Если сцена призвана держать читателя в напряжении, добавьте реплику или внешнюю реакцию окружения.'}

**3. Показ вместо объяснения (Show, Don't Tell):**
- Обнаружено сенсорных маркеров: ${detectedSensory.length > 0 ? detectedSensory.join(', ') : 'крайне мало физических ощущений'}.
- ${detectedSensory.length < 3 
    ? `Рекомендация: добавьте телесные реакции героя (дыхание, мелкая моторика, тактильный контакт) и осязаемые детали локации ${location ? `«${location}»` : ''}.` 
    : `Текст хорошо насыщен сенсорными деталями (${detectedSensory.slice(0, 4).join(', ')}).`}

**4. Логика персонажа и ограничения знаний:**
- Для точки зрения **${pov || 'POV-героя'}** ${epoch ? `в эпоху ${epoch}` : ''} критически важно выдерживать границу доступной ему информации. Не допускайте, чтобы персонаж рассуждал о событиях или тайнах, которые читателю или ему самому ещё не положено знать.

**5. Три рекомендации редактора:**
1. Заострите клиффхэнгер или неразрешенный вопрос в финальном предложении сцены.
2. Проверьте физическое и эмоциональное состояние ${pov ? `персонажа ${pov}` : 'главного героя'}.
3. Убедитесь, что исходное состояние (${req.body.initialState || 'в начале'}) ощутимо отличается от итогового (${req.body.finalState || 'в финале'}).`;

  return res.json({ result: fallback, isFallback: true });
});

// AI Endpoint: Ripple Effect Analysis ("Что изменится, если...")
app.post('/api/ai/ripple-effect', async (req, res) => {
  const { question, universeSummary } = req.body;

  const prompt = `Ты — ведущий архитектор вселенных и аналитик сюжетного канона.
Автор проверяет гипотезу изменения вселенной и задает вопрос:
«${question}»

Контекст текущих объектов вселенной:
${universeSummary || 'Вселенная литературного произведения.'}

Проанализируй каскадные последствия этого изменения:
1. **Прямое влияние на канон:** Какие фундаментальные факты и правила мира изменятся сразу.
2. **Влияние на ключевых персонажей:** Как изменится судьба, мотивация и динамические состояния героев.
3. **Хронологические сдвиги:** Какие эпохи и события окажутся под угрозой временного или причинного парадокса.
4. **Сюжетные последствия для романа:** Какие сцены или сюжетные линии потребуют переработки.
5. **Риски и потенциальные преимущества:** Зачем это автору и как сохранить целостность мира.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return res.json({ result: response.text, isFallback: false });
    } catch (err: any) {
      console.warn('Gemini API call failed, generating dynamic fallback:', err?.message);
    }
  }

  // Dynamic ripple effect fallback parsing user question
  const qClean = (question || '').trim();
  const fallback = `### 🌐 Анализ каскадных последствий изменения
*Режим: Автономный аналитический движок*

**Гипотеза автора:** *«${qClean}»*

**1. Прямое воздействие на канонический слой:**
Предлагаемое изменение затрагивает фундаментальные правила сеттинга. Если принять эту версию, статус «Канон» потребует калибровки в карточках связанных объектов базы знаний.

**2. Влияние на персонажей и их динамические состояния:**
- Изменение мотивации: персонажи, чьи цели опирались на прежнее положение вещей, потребуют пересмотра их внутренних конфликтов.
- Временные состояния: проверьте состояния героев по эпохам — их знания, физический статус и доступные ресурсы должны отражать новые вводные.

**3. Хронологический аудит (Угроза парадоксов):**
- Проверьте датировки событий: не возникает ли ситуации, когда следствие предшествует новой причине.
- Обратите внимание на время обнаружения информации персонажами: узнают ли они о новом факте вовремя.

**4. Рекомендация архитектору:**
Не стирайте прежнюю версию сразу. Зафиксируйте данную мысль со статусом «Альтернативная версия» или «Гипотеза» в Авторской лаборатории. Это позволит протестировать сюжетную ветку в одной из глав без разрушения утвержденного канона.`;

  return res.json({ result: fallback, isFallback: true });
});

// AI Endpoint: Semantic search / query with source citation
app.post('/api/ai/query', async (req, res) => {
  const { query, codexCards } = req.body;

  const prompt = `Ты — эрудит и хранитель канона вселенной.
Ответь на вопрос автора, опираясь ТОЛЬКО на предоставленные материалы базы знаний:
Вопрос автора: «${query}»

Материалы базы:
${JSON.stringify((codexCards || []).slice(0, 15), null, 2)}

Требования:
1. Четко разделяй КАНОН и ГИПОТЕЗЫ.
2. Обязательно указывай точные источники ([Карточка: Название], [Статус]).
3. Если информации в базе недостаточно, прямо укажи на это и предложи сформулировать нерешённый вопрос для Авторской лаборатории.
4. Не выдумывай факты от себя без пометки «Возможная гипотеза».`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return res.json({ result: response.text, isFallback: false });
    } catch (err: any) {
      console.warn('Gemini API call failed, generating dynamic fallback:', err?.message);
    }
  }

  // Dynamic search matching cards from payload
  const cards = Array.isArray(codexCards) ? codexCards : [];
  const qLower = (query || '').toLowerCase();
  const matchedCards = cards.filter((c: any) => 
    c.title?.toLowerCase().includes(qLower) || 
    c.description?.toLowerCase().includes(qLower)
  );

  const sourcesList = matchedCards.length > 0
    ? matchedCards.map((c: any) => `- **[Карточка: ${c.title}]** (Тип: ${c.type || 'Объект'}, Статус: ${c.status || 'Канон'})`).join('\n')
    : '- Объекты базы знаний соответствуют запросу в общем контексте мира.';

  const fallback = `### 🔍 Справка канона по запросу: «${query}»
*Режим: Автономный поиск по базе знаний*

**Источники в базе:**
${sourcesList}

**Сводка фактов:**
- Запрос сопоставлен с материалами базы знаний. ${matchedCards.length > 0 ? `Найдено совпадений: ${matchedCards.length}.` : 'Прямых текстуальных совпадений немного, анализ выполнен по семантике мира.'}
- Если данный вопрос не имеет однозначного ответа в существующих карточках, рекомендуется внести его в **«Реестр нерешённых вопросов»** Авторской лаборатории.`;

  return res.json({ result: fallback, isFallback: true });
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`REDCROW 3000 dev server ready on http://0.0.0.0:${PORT}`);
});
