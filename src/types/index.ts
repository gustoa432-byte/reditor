export type WorkspaceTab =
  | 'dashboard'
  | 'manuscript'
  | 'codex'
  | 'timeline'
  | 'lab'
  | 'graph'
  | 'audit'
  | 'ai'
  | 'export';

export type EntityType =
  | 'character' // Персонаж
  | 'location' // Место / Географический объект
  | 'civilization' // Цивилизация
  | 'organization' // Организация / Общество / Фракция
  | 'technology' // Технология / Научная концепция
  | 'epoch' // Историческая эпоха
  | 'event' // Событие
  | 'artifact' // Артефакт
  | 'species' // Биологический вид
  | 'culture' // Культура / Религия
  | 'language' // Язык
  | 'concept' // Философская концепция
  | 'work' // Произведение
  | 'custom'; // Другое

export type CanonStatus =
  | 'canon' // Канон
  | 'hypothesis' // Гипотеза
  | 'alternative' // Альтернативная версия
  | 'rejected' // Отвергнутая идея (сохраняется в истории)
  | 'note'; // Внутренняя заметка

export type WorldCredibility =
  | 'fact' // Подтверждённый факт
  | 'disputed' // Спорное утверждение
  | 'myth' // Миф / Легенда
  | 'propaganda' // Пропаганда
  | 'lie' // Ложь персонажа
  | 'unknown'; // Неизвестно

export type DatePrecision =
  | 'exact' // Точная дата (например: 2450 г.)
  | 'range' // Диапазон (между 2400 и 2450 гг.)
  | 'approximate' // Приблизительно (ок. середины XXV века)
  | 'relative' // Относительная (через 3 года после Катастрофы)
  | 'unknown'; // Неизвестно

export interface TemporalDate {
  precision: DatePrecision;
  display: string;
  yearNum?: number; // Для сортировки на временной шкале
  endYearNum?: number; // Для диапазонов
  relativeToEventId?: string;
}

export interface EntityState {
  id: string;
  epochOrYear: string;
  yearNum?: number;
  title: string;
  physicalState: string;
  mentalState: string;
  abilities: string;
  goals: string;
  relationships: string;
  resources: string;
  notes?: string;
}

export interface EntityRelation {
  id: string;
  targetEntityId: string;
  relationType:
    | 'created_by' // создан кем
    | 'related_to' // связан с
    | 'part_of' // является частью
    | 'located_in' // находится в
    | 'participated_in' // участвовал в
    | 'occurred_during' // произошел во время
    | 'caused' // вызвал / привел к
    | 'contradicts' // противоречит
    | 'confirms' // подтверждает
    | 'refutes' // опровергает
    | 'appears_in_scene'; // появляется в сцене
  description?: string;
}

export interface CodexEntity {
  id: string;
  type: EntityType;
  title: string;
  altNames?: string[];
  description: string;
  canonStatus: CanonStatus;
  credibility: WorldCredibility;
  epistemicInfo?: {
    knownBy: string[]; // Кто из персонажей знает
    believedBy: string[]; // Кто предполагает
    misinformed: string[]; // Кто заблуждается
    hiddenBy: string[]; // Кто скрывает
  };
  timeBound?: TemporalDate;
  attributes: Record<string, string>;
  dynamicStates: EntityState[];
  relations: EntityRelation[];
  tags: string[];
  updatedAt: string;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  epochId?: string;
  // Три измерения времени:
  actualTime: TemporalDate; // 1. Фактическое время
  discoveryTime: string; // 2. Время обнаружения персонажами
  readerReveal: {
    // 3. Время раскрытия читателю
    bookTitle?: string;
    chapterScene?: string;
    description: string;
  };
  participatingEntityIds: string[];
  canonStatus: CanonStatus;
  isMilestone?: boolean;
}

export interface ScenePassport {
  povCharacterId?: string;
  locationId?: string;
  epochYear?: string;
  participatingCharacterIds: string[];
  characterGoal: string;
  conflictObstacle: string;
  initialState: string;
  finalState: string;
  relationshipShift: string;
  newInformationRevealed: string;
  dramaticTurn: string;
  hook: string;
  sceneFunction: string;
  storylineIds: string[];
  polarity: number; // -2 to +2 (динамика эмоционального заряда)
}

export interface SceneRevision {
  id: string;
  timestamp: string;
  label: string;
  text: string;
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  status: 'draft' | 'in_progress' | 'revised' | 'final';
  passport: ScenePassport;
  text: string;
  revisions: SceneRevision[];
  wordCount: number;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

export interface Act {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
}

export interface Storyline {
  id: string;
  title: string;
  color: string;
  description: string;
  focusCharacterIds: string[];
}

export interface ManuscriptProject {
  id: string;
  title: string;
  synopsis: string;
  acts: Act[];
  storylines: Storyline[];
  updatedAt: string;
}

export interface LabHypothesis {
  id: string;
  title: string;
  content: string;
  status:
    | 'rough_thought' // черновая мысль
    | 'hypothesis' // гипотеза
    | 'in_review' // на проверке
    | 'accepted_canon' // принята в канон
    | 'partially_accepted' // частично принята
    | 'postponed' // отложена
    | 'rejected' // отклонена (сохраняется в архиве)
    | 'superseded'; // заменена другой версией
  pros: string[];
  cons: string[];
  linkedEntityIds: string[];
  linkedSceneIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DecisionLogCard {
  id: string;
  title: string;
  question: string;
  problemDescription: string;
  initialIdea: string;
  alternatives: { option: string; consequences: string }[];
  pros: string[];
  cons: string[];
  chosenDecision: string;
  rationale: string;
  decisionDate: string;
  linkedEntityIds: string[];
  linkedSceneIds: string[];
}

export interface UnresolvedQuestion {
  id: string;
  title: string;
  description: string;
  linkedEntityIds: string[];
  linkedSceneIds: string[];
  possibleAnswers: string[];
  arguments: string[];
  status: 'open' | 'investigating' | 'resolved';
  impact: string;
  createdAt: string;
}

export interface ConsistencyIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'temporal' | 'epistemic' | 'canonical' | 'storyline';
  title: string;
  description: string;
  affectedEntityIds: string[];
  affectedSceneIds: string[];
  isIntentional: boolean; // Отмечено автором как намеренное
  authorComment?: string;
  intentReason?: 'character_lie' | 'unreliable_narrator' | 'myth_legend' | 'artistic_device' | 'alternate_version';
}

export interface UniverseData {
  id: string;
  universeName: string;
  version: string;
  tagline: string;
  entities: CodexEntity[];
  events: WorldEvent[];
  projects: ManuscriptProject[];
  hypotheses: LabHypothesis[];
  decisions: DecisionLogCard[];
  questions: UnresolvedQuestion[];
  consistencyIssues: ConsistencyIssue[];
  activeProjectId: string;
  activeSceneId?: string;
}
