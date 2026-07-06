import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  UserRound,
  Volume2,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { OriginalBackdrop, type BackdropMode } from './OriginalBackdrop';
import { DEFAULT_SCENE_ID, NVIDIA_ACCENT, type SceneId } from './originalSceneConfig';

const ACCENT = NVIDIA_ACCENT;
const PRELUDE_LINES = ['解构隐型人格', '看见平行人生', '照亮下一次选择', '把另一个自己拉到现实见一面'];
const ENTRY_STORAGE_KEY = 'entry:intake:v1';

const BIRTH_YEAR_MIN = 1940;
const BIRTH_YEAR_MAX = new Date().getFullYear();

const SHICHEN_OPTIONS = [
  { id: 'zi', label: '子时', range: '23:00-01:00' },
  { id: 'chou', label: '丑时', range: '01:00-03:00' },
  { id: 'yin', label: '寅时', range: '03:00-05:00' },
  { id: 'mao', label: '卯时', range: '05:00-07:00' },
  { id: 'chen', label: '辰时', range: '07:00-09:00' },
  { id: 'si', label: '巳时', range: '09:00-11:00' },
  { id: 'wu', label: '午时', range: '11:00-13:00' },
  { id: 'wei', label: '未时', range: '13:00-15:00' },
  { id: 'shen', label: '申时', range: '15:00-17:00' },
  { id: 'you', label: '酉时', range: '17:00-19:00' },
  { id: 'xu', label: '戌时', range: '19:00-21:00' },
  { id: 'hai', label: '亥时', range: '21:00-23:00' },
  { id: 'unknown', label: '不确定 / 未知', range: '记不清也没关系' },
] as const;

const MBTI_OPTIONS = [
  { id: 'INTJ', label: 'INTJ · 建筑师' },
  { id: 'INTP', label: 'INTP · 逻辑学家' },
  { id: 'ENTJ', label: 'ENTJ · 指挥官' },
  { id: 'ENTP', label: 'ENTP · 辩论家' },
  { id: 'INFJ', label: 'INFJ · 提倡者' },
  { id: 'INFP', label: 'INFP · 调停者' },
  { id: 'ENFJ', label: 'ENFJ · 主人公' },
  { id: 'ENFP', label: 'ENFP · 竞选者' },
  { id: 'ISTJ', label: 'ISTJ · 物流师' },
  { id: 'ISFJ', label: 'ISFJ · 守卫者' },
  { id: 'ESTJ', label: 'ESTJ · 总经理' },
  { id: 'ESFJ', label: 'ESFJ · 执政官' },
  { id: 'ISTP', label: 'ISTP · 鉴赏家' },
  { id: 'ISFP', label: 'ISFP · 探险家' },
  { id: 'ESTP', label: 'ESTP · 企业家' },
  { id: 'ESFP', label: 'ESFP · 表演者' },
  { id: 'unknown', label: '不清楚 / 没测过' },
] as const;

const INTAKE_FIELDS = [
  ['recent_pressure', '最近更明显的压力', '例如：节奏太快、机会变少、想证明自己'],
  ['desired_change', '最想改变的方向', '例如：更自由、被看见、稳定下来'],
  ['relationship_context', '关系牵引', '例如：家人期待、朋友邀约、团队协作'],
  ['creative_or_work_context', '创作 / 学习 / 工作语境', '例如：做内容、学新工具、项目冲刺'],
  ['city_and_lifestyle', '城市与生活线索', '例如：大城市、通勤、展会、老街区'],
] as const;

const generatingLines = [
  '正在读取你的玩家选择……',
  '正在提取你的隐藏驱动力……',
  '正在分裂三条平行人生副本……',
  '正在绘制隐型驱动力雷达……',
];

const TEASER_TEXT = '你是否曾经幻想过，平行宇宙里，另一个你，生活在哪里？';
const MAIN_AUDIO = '/audio/audio-main.mp3';
const INTERACTION_AUDIO = [
  '/audio/audio-interaction-a.mp3',
  '/audio/audio-interaction-c.mp3',
  '/audio/audio-interaction-d.mp3',
  '/audio/audio-interaction-e.mp3',
  '/audio/audio-interaction-f.mp3',
  '/audio/audio-interaction-g.mp3',
] as const;

function landscapeAudio(scene: SceneId) {
  return `/audio/audio-landscape-${scene}.mp3`;
}

function transitionAudio(scene: SceneId) {
  return `/audio/audio-transition-${scene}.mp3`;
}

const WORLD_OPTIONS = [
  { id: 'forest', label: '被自然包裹，慢慢生长', detail: '成长 · 被绿意与光斑环绕，按自己的节奏舒展' },
  { id: 'ocean', label: '辽阔、自由，想要远行', detail: '自由 · 海平线尽头，风与浪都在往前推你' },
  { id: 'cave', label: '向内探索，专注而神秘', detail: '内省 · 光束穿过岩壁，安静地照见自己' },
  { id: 'rocky-desert', label: '孤独但坚定，极简纯粹', detail: '韧性 · 一望无际的荒原，只剩下你和方向' },
] as const;

const RESTART_OPTIONS = [
  { id: 'career', label: '换工作' },
  { id: 'city', label: '换城市' },
  { id: 'relationship', label: '感情走向' },
  { id: 'major', label: '转赛道' },
  { id: 'expression', label: '开始表达' },
  { id: 'rhythm', label: '生活节奏' },
] as const;

const RESTART_TO_AXIS = {
  career: 'job',
  major: 'job',
  city: 'city',
  relationship: 'relationship',
  expression: 'expression',
  rhythm: 'rhythm',
} as const;

const AXIS_LABELS = {
  job: '工作',
  city: '城市',
  relationship: '关系',
  expression: '表达',
  rhythm: '节奏',
} as const;

const DIRECTION_OPTIONS = {
  job: [
    { id: 'switch_job', label: '换一份工作' },
    { id: 'switch_track', label: '转一个赛道' },
    { id: 'go_solo', label: '试着独立接活' },
    { id: 'get_promoted', label: '在现处冲一把' },
  ],
  city: [
    { id: 'move_bigcity', label: '去更大的城市' },
    { id: 'move_home', label: '回到熟悉的地方' },
    { id: 'move_slowcity', label: '换一座慢节奏城市' },
    { id: 'move_abroad', label: '去更远的地方看看' },
  ],
  relationship: [
    { id: 'push_forward', label: '推进这段关系' },
    { id: 'define_it', label: '把关系讲清楚' },
    { id: 'restart_single', label: '先回到一个人' },
    { id: 'reconnect', label: '重新靠近某个人' },
  ],
  expression: [
    { id: 'go_public', label: '开始公开表达' },
    { id: 'make_content', label: '持续做内容' },
    { id: 'show_work', label: '把作品拿出来' },
    { id: 'find_voice', label: '找到自己的声音' },
  ],
  rhythm: [
    { id: 'slow_down', label: '把节奏慢下来' },
    { id: 'rebuild_routine', label: '重建作息' },
    { id: 'gap_break', label: '给自己一段留白' },
    { id: 'level_up', label: '换一种高效活法' },
  ],
} as const;

const CANNOT_LOSE_OPTIONS = [
  { id: 'stability', label: '稳定' },
  { id: 'freedom', label: '自由' },
  { id: 'being_understood', label: '被理解' },
  { id: 'growth_window', label: '成长窗口' },
  { id: 'relationship', label: '重要关系' },
  { id: 'self_respect', label: '自我尊重' },
] as const;

const PERSONA_QUESTIONS = [
  {
    key: 'persona_style',
    title: '面对一件你真正想做成的事，你更像哪种玩家？',
    options: [
      { id: 'architect', label: '布局型：先搭框架，稳稳推进', detail: '看清全局，把事情拆成能落地的步骤' },
      { id: 'striker', label: '爆发型：抓住窗口，全力冲一把', detail: '认准机会就出手，敢赌也扛得住结果' },
      { id: 'connector', label: '协作型：先连接人，一起把事搞定', detail: '在意队友与关系，是团队里的稳定器' },
      { id: 'explorer', label: '解法型：找一条没人走过的路', detail: '对新鲜与未知几乎没有门槛，先试再说' },
    ],
  },
  {
    key: 'persona_compass',
    title: '独自面对未知时，你的内在指南针更偏向？',
    options: [
      { id: 'order', label: '秩序：先理清规则和系统', detail: '喜欢把复杂的东西梳理得清晰有序' },
      { id: 'daring', label: '行动：先冲，边冲边调整', detail: '行动优先，不确定里也敢先迈一步' },
      { id: 'empath', label: '共情：先读懂人和情绪', detail: '对他人感受敏感，也在意彼此的连接' },
      { id: 'dreamer', label: '想象：让灵感与画面先行', detail: '习惯从画面和可能性里找答案' },
    ],
  },
] as const;

const DISCLAIMER_SECTIONS = [
  {
    title: '创意娱乐',
    items: ['生成内容不是心理诊断、职业预测、医疗建议或法律建议。', '所有身份、场景和人生分支都是虚构表达，不代表现实结论。'],
  },
  {
    title: '本地生成',
    items: ['你输入的昵称、状态和选择只用于生成虚构人生预演，不用于判断性格、身份或职业。', '现场输入与选择仅在本地 RTX 设备中处理，体验结束后自动清除。'],
  },
  {
    title: '自主判断',
    items: ['请不要只依据本体验内容做出现实重大决策。', '继续体验即表示你理解以上边界；未成年人建议在监护人陪同下参与。'],
  },
] as const;

const silhouetteDataUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
    <defs>
      <radialGradient id="g" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#caff6a" stop-opacity=".95"/>
        <stop offset="48%" stop-color="#3b82f6" stop-opacity=".42"/>
        <stop offset="100%" stop-color="#030712" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#f8fafc" stop-opacity=".86"/>
        <stop offset="1" stop-color="#76B900" stop-opacity=".34"/>
      </linearGradient>
    </defs>
    <rect width="320" height="320" fill="#050815"/>
    <circle cx="160" cy="160" r="142" fill="url(#g)" opacity=".38"/>
    <circle cx="160" cy="112" r="54" fill="url(#s)" opacity=".84"/>
    <path d="M64 280c17-72 62-108 96-108s79 36 96 108" fill="url(#s)" opacity=".72"/>
    <path d="M52 266c26-49 61-75 108-75s82 26 108 75" fill="none" stroke="#9BE421" stroke-opacity=".34" stroke-width="2"/>
  </svg>`);

type ShichenId = (typeof SHICHEN_OPTIONS)[number]['id'];
type MbtiId = (typeof MBTI_OPTIONS)[number]['id'];
type AvatarSource = 'camera' | 'upload' | 'silhouette';

type AvatarValue = {
  type: AvatarSource;
  dataUrl: string;
};

type IntakeState = Record<(typeof INTAKE_FIELDS)[number][0], string>;
type FlowPhase = 'prelude' | 'home' | 'teaser' | 'questions' | 'disclaimer' | 'choice' | 'deep' | 'generating' | 'result';
type EntryAnswers = Record<string, string | string[]>;
type DirectionAxis = keyof typeof DIRECTION_OPTIONS;
type EntryQuestion = {
  key: string;
  kind?: 'world' | 'restart' | 'directions' | 'cannotLose' | 'persona';
  eyebrow: string;
  title: string;
  columns: 1 | 2 | 3;
  multi?: boolean;
  options: ReadonlyArray<{ id: string; label: string; detail?: string }>;
};

function axisFromRestart(restartChoice: string): DirectionAxis {
  return (RESTART_TO_AXIS[restartChoice as keyof typeof RESTART_TO_AXIS] ?? 'job') as DirectionAxis;
}

function buildEntryQuestions(axis: DirectionAxis): EntryQuestion[] {
  const questions: Omit<EntryQuestion, 'eyebrow'>[] = [
    {
      key: 'world',
      kind: 'world',
      title: '那个"你"，住在什么样的世界？',
      columns: 2,
      options: WORLD_OPTIONS,
    },
    {
      key: 'restart',
      kind: 'restart',
      title: '这一年，你最想改变的是——',
      columns: 3,
      options: RESTART_OPTIONS,
    },
    {
      key: 'directions',
      kind: 'directions',
      title: `如果改变「${AXIS_LABELS[axis]}」，你会往哪走？`,
      columns: 2,
      multi: true,
      options: DIRECTION_OPTIONS[axis],
    },
    {
      key: 'cannotLose',
      kind: 'cannotLose',
      title: '有什么，是你无论如何都不想失去的？',
      columns: 3,
      options: CANNOT_LOSE_OPTIONS,
    },
    ...PERSONA_QUESTIONS.map((question) => ({
      key: question.key,
      kind: 'persona' as const,
      title: question.title,
      columns: 1 as const,
      options: question.options,
    })),
  ];
  return questions.map((question, index) => ({
    ...question,
    eyebrow: `Question ${String(index + 1).padStart(2, '0')}`,
  }));
}

function daysInMonth(year: number, month: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

function AnimatedTitle({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);

  return (
    <h1 className="deep-title" aria-label={text}>
      {chars.map((char, index) => (
        <motion.span
          aria-hidden="true"
          key={`${char}-${index}`}
          initial={reduced ? false : { opacity: 0, y: 22, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.58, delay: reduced ? 0 : index * 0.035, ease: [0.16, 1, 0.3, 1] }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  );
}

function GlassSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <label className="deep-select-shell">
      <select
        className="deep-input deep-select"
        value={value}
        data-filled={value ? 'true' : 'false'}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <span aria-hidden="true">▾</span>
    </label>
  );
}

function FieldLabel({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="deep-field">
      <span>
        {label}
        {optional ? <em>{optional}</em> : null}
      </span>
      {children}
    </label>
  );
}

function captureVideoFrame(video: HTMLVideoElement) {
  const size = 720;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return '';
  const sourceSize = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - sourceSize) / 2;
  const sy = (video.videoHeight - sourceSize) / 2;
  ctx.drawImage(video, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.86);
}

function fileToCompressedDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('image failed'));
      image.onload = () => {
        const size = 720;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas failed'));
          return;
        }
        const sourceSize = Math.min(image.width, image.height);
        const sx = (image.width - sourceSize) / 2;
        const sy = (image.height - sourceSize) / 2;
        ctx.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function AvatarCapture({
  value,
  onChange,
}: {
  value: AvatarValue | null;
  onChange: (value: AvatarValue | null) => void;
}) {
  const [tab, setTab] = useState<AvatarSource>('silhouette');
  const [streaming, setStreaming] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setCamError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('此设备/浏览器不支持摄像头，请改用「上传照片」或「默认剪影」。');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStreaming(true);
    } catch {
      setCamError('无法访问摄像头（权限被拒或设备不可用）。可改用「上传照片」或「默认剪影」。');
      stopCamera();
    }
  }, [stopCamera]);

  const selectTab = (next: AvatarSource) => {
    setTab(next);
    setCamError(null);
    if (next !== 'camera') stopCamera();
    if (next === 'silhouette') onChange({ type: 'silhouette', dataUrl: silhouetteDataUrl });
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const dataUrl = captureVideoFrame(video);
    if (!dataUrl) {
      setCamError('拍摄失败，请重试或改用上传/剪影。');
      return;
    }
    onChange({ type: 'camera', dataUrl });
    stopCamera();
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange({ type: 'upload', dataUrl });
    } catch {
      setCamError('图片读取失败，请换一张或改用默认剪影。');
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = value?.dataUrl ?? (tab === 'silhouette' ? silhouetteDataUrl : null);
  const tabs: Array<{ id: AvatarSource; label: string; icon: React.ReactNode }> = [
    { id: 'camera', label: '拍照', icon: <Camera size={16} /> },
    { id: 'upload', label: '上传照片', icon: <Upload size={16} /> },
    { id: 'silhouette', label: '默认剪影', icon: <UserRound size={16} /> },
  ];

  return (
    <div className="avatar-module">
      <div className="avatar-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className="avatar-tab"
            data-active={tab === item.id}
            onClick={() => selectTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="avatar-stage">
        <div className="avatar-preview" aria-live="polite">
          {tab === 'camera' && streaming ? (
            <video ref={videoRef} playsInline muted />
          ) : previewUrl ? (
            <img src={previewUrl} alt="人物形象预览" />
          ) : (
            <span>{tab === 'camera' ? '点击下方「开启摄像头」' : '尚未选择形象'}</span>
          )}
        </div>

        {tab === 'camera' ? (
          <div className="avatar-actions">
            {!streaming ? (
              <button type="button" className="deep-mini-button" onClick={startCamera}>
                开启摄像头
              </button>
            ) : (
              <>
                <button type="button" className="deep-mini-button" onClick={takePhoto}>
                  拍摄
                </button>
                <button type="button" className="deep-mini-button deep-mini-button--ghost" onClick={stopCamera}>
                  关闭
                </button>
              </>
            )}
            {value?.type === 'camera' && !streaming ? (
              <button type="button" className="deep-mini-button deep-mini-button--ghost" onClick={startCamera}>
                重拍
              </button>
            ) : null}
          </div>
        ) : null}

        {tab === 'upload' ? (
          <div className="avatar-actions">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden-input" onChange={onUpload} />
            <button
              type="button"
              disabled={busy}
              className="deep-mini-button"
              onClick={() => fileInputRef.current?.click()}
            >
              {busy ? '处理中…' : value?.type === 'upload' ? '重新选择' : '选择图片'}
            </button>
          </div>
        ) : null}

        {tab === 'silhouette' ? <p className="avatar-note">使用默认人物剪影即可继续，稍后可在结果页替换。</p> : null}
        {camError ? <p className="avatar-error">{camError}</p> : null}
        {value ? (
          <p className="avatar-picked">
            已选择形象：{value.type === 'camera' ? '拍照' : value.type === 'upload' ? '上传' : '默认剪影'} <Check size={13} />
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className="deep-stage"
      initial={{ opacity: 0, x: 44, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -44, filter: 'blur(10px)' }}
      transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="deep-stage__copy">
        <p className="deep-eyebrow">{eyebrow}</p>
        <AnimatedTitle text={title} />
        <p className="deep-description">{description}</p>
      </div>
      <div className="deep-stage__panel liquid-glass-strong">
        <div className="glass-content">{children}</div>
      </div>
    </motion.section>
  );
}

function GeneratingView({ line }: { line: string }) {
  return (
    <main className="generating-view">
      <section className="generating-panel liquid-glass-strong">
        <div className="glass-content">
          <div className="ai-orb">
            <div />
            <div />
            <span>AI</span>
          </div>
          <p className="deep-eyebrow">RTX LOCAL AI PIPELINE</p>
          <h1>{line}</h1>
          <p>本地推理进行中，请勿关闭页面</p>
        </div>
      </section>
    </main>
  );
}

function EntryCursor({ accent }: { accent: string }) {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return undefined;

    document.documentElement.classList.add('entry-cursor-none');
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let isVisible = false;
    let isHovering = false;
    let frame = 0;

    const move = (event: PointerEvent) => {
      isVisible = true;
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.opacity = '1';
      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      const eventTarget = event.target;
      isHovering = eventTarget instanceof Element && Boolean(eventTarget.closest('button, a, input, select, [data-cursor-hover]'));
    };
    const down = () => ring.classList.add('is-down');
    const up = () => ring.classList.remove('is-down');
    const animate = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${isHovering ? 1.8 : 1})`;
      ring.style.opacity = isVisible ? (isHovering ? '1' : '0.68') : '0';
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    frame = requestAnimationFrame(animate);
    return () => {
      document.documentElement.classList.remove('entry-cursor-none');
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="entry-cursor-ring" style={{ borderColor: accent }} aria-hidden="true" />
      <div ref={dotRef} className="entry-cursor-dot" style={{ background: accent }} aria-hidden="true" />
    </>
  );
}

function PreludeView({ onIlluminate }: { onIlluminate: () => void }) {
  return (
    <main className="entry-prelude">
      <div className="entry-prelude__constellation" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>
      <motion.p
        className="entry-prelude__kicker"
        initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
      >
        MIRROR LIFE REHEARSAL
      </motion.p>
      <div className="entry-prelude__manifesto" aria-label="镜像人生开场">
        {PRELUDE_LINES.map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 28, letterSpacing: '0.38em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: index === PRELUDE_LINES.length - 1 ? '0.12em' : '0.22em' }}
            transition={{ duration: 1.1, delay: 0.16 + index * 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>
      <motion.button
        type="button"
        className="entry-illuminate"
        data-cursor-hover
        onClick={onIlluminate}
        initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>点亮入口</span>
        <i aria-hidden="true" />
      </motion.button>
      <p className="entry-prelude__hint">点击后点亮玻璃宇宙镜头，唤出你的镜像人生入口</p>
    </main>
  );
}

function HomeView({ onBegin }: { onBegin: () => void }) {
  return (
    <main className="entry-home">
      <header className="entry-topbar">
        <span>RTX LOCAL AI</span>
        <div>
          <span>BW · 镜像人生</span>
        </div>
      </header>
      <section className="entry-hero">
        <motion.p
          className="entry-kicker"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          MIRROR LIFE REHEARSAL
        </motion.p>
        <h1 className="entry-title" aria-label="镜像自我，人生预演">
          {['镜像自我', '人生预演'].map((line, lineIndex) => (
            <span className="entry-title-line" key={line}>
              {Array.from(line).map((char, charIndex) => (
                <motion.span
                  key={`${line}-${char}-${charIndex}`}
                  className="entry-title-glyph"
                  initial={{ opacity: 0, y: 26, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.8,
                    delay: 0.18 + lineIndex * 0.16 + charIndex * 0.055,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span>{char}</span>
                  <span>{char}</span>
                  <span>{char}</span>
                </motion.span>
              ))}
            </span>
          ))}
        </h1>
        <motion.p
          className="entry-subtitle"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          输入状态，做 5 个岔路选择，让 RTX Local AI 生成你的镜像人生预演。
        </motion.p>
      </section>
      <motion.div
        className="entry-actions"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
      >
        <button type="button" className="entry-begin-button" onClick={onBegin}>
          <span>BEGIN</span>
          <span>开启预演</span>
        </button>
        <p>移动鼠标探索玻璃宇宙镜头，点击 BEGIN 启动预演</p>
      </motion.div>
    </main>
  );
}

function TeaserView({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="entry-centered">
      <button type="button" className="teaser-copy" onClick={onContinue}>
        <AnimatedTitle text={TEASER_TEXT} />
        <span>轻触继续 →</span>
      </button>
    </main>
  );
}

function EntryQuestionView({
  questions,
  index,
  answers,
  onSelect,
  onConfirm,
}: {
  questions: EntryQuestion[];
  index: number;
  answers: EntryAnswers;
  onSelect: (questionKey: string, optionId: string, multi?: boolean) => void;
  onConfirm: () => void;
}) {
  const question = questions[index] as EntryQuestion;
  const selected = answers[question.key];
  const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const canConfirm = !question.multi || selectedArray.length > 0;
  const confirmLabel = question.multi ? (selectedArray.length > 0 ? '下一步 →' : '至少选 1 个方向') : '下一步 →';

  return (
    <main className="entry-centered">
      <motion.section
        key={question.key}
        className="entry-question-shell liquid-glass-strong"
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="glass-content">
          <div className="entry-progress">
            {questions.map((item, itemIndex) => (
              <span key={item.key} data-active={itemIndex === index} data-done={itemIndex < index} />
            ))}
          </div>
          <p className="deep-eyebrow">{question.eyebrow}</p>
          <AnimatedTitle text={question.title} />
          <div className={`entry-options entry-options--${question.columns}`}>
            {question.options.map((option) => {
              const active = selectedArray.includes(option.id);
              return (
                <button
                  type="button"
                  key={option.id}
                  data-active={active}
                  className="entry-option"
                  onClick={() => onSelect(question.key, option.id, Boolean(question.multi))}
                >
                  <span>{option.label}</span>
                  {option.detail ? <em>{option.detail}</em> : null}
                </button>
              );
            })}
          </div>
          {question.multi ? (
            <button type="button" className="liquid-action entry-confirm" disabled={!canConfirm} onClick={onConfirm}>
              {confirmLabel}
            </button>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}

function DisclaimerView({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <main className="entry-centered">
      <section className="entry-disclaimer liquid-glass-strong">
        <div className="glass-content">
          <p className="deep-eyebrow">Entry Check</p>
          <AnimatedTitle text="进入副本前，确认三件事" />
          <p className="entry-disclaimer-intro">
            本体验会根据你的主动选择生成虚构平行人生内容，用于 BW 现场娱乐与创意自我探索。
          </p>
          <div className="entry-disclaimer-grid">
            {DISCLAIMER_SECTIONS.map((section) => (
              <article key={section.title}>
                <h3>{section.title}</h3>
                {section.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </article>
            ))}
          </div>
          <p className="entry-disclaimer-note">现场工作人员可协助立即删除本地数据。</p>
          <div className="entry-disclaimer-actions">
            <button type="button" className="liquid-action liquid-action--ghost" onClick={onBack}>
              ← 上一步
            </button>
            <button type="button" className="liquid-action" onClick={onContinue}>
              我已了解，继续 →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ChoiceView({ onQuick, onDeep }: { onQuick: () => void; onDeep: () => void }) {
  return (
    <main className="entry-centered">
      <section className="entry-choice">
        <p className="deep-eyebrow">Counterfactual Rehearsal</p>
        <AnimatedTitle text="如果这一年，你换了它，会怎样？" />
        <p>
          选择都已答完。挑一种预演方式：快速体验几句描述即可生成；深度体验多聊几步，换来更丰富的推演。
        </p>
        <div className="entry-choice-actions">
          <button type="button" className="liquid-action liquid-action--ghost" onClick={onQuick}>
            快速体验 →
          </button>
          <button type="button" className="liquid-action" onClick={onDeep}>
            深度体验 →
          </button>
        </div>
        <p className="entry-choice-note">深度体验建设中，稍后开放更完整的沉浸预演。</p>
      </section>
    </main>
  );
}

function ResultPreview({ onRestart }: { onRestart: () => void }) {
  return (
    <main className="entry-centered">
      <section className="result-preview liquid-glass-strong">
        <div className="glass-content">
          <p className="deep-eyebrow">MIRROR LIFE RESULT · LOCAL PREVIEW</p>
          <AnimatedTitle text="三条平行人生副本已生成" />
          <div className="result-lines">
            {['能力发挥', '成长路径', '创意想象'].map((line, index) => (
              <article key={line}>
                <span>0{index + 1}</span>
                <h3>{line}</h3>
                <p>这里会承接真实结果页数据。本地预览先展示生成完成态，验证流程不会卡在推理页。</p>
              </article>
            ))}
          </div>
          <button type="button" className="liquid-action" onClick={onRestart}>
            返回首页
          </button>
        </div>
      </section>
    </main>
  );
}

export default function DeepRehearsal() {
  const years = useMemo(() => Array.from({ length: BIRTH_YEAR_MAX - BIRTH_YEAR_MIN + 1 }, (_, i) => BIRTH_YEAR_MAX - i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const [phase, setPhase] = useState<FlowPhase>('prelude');
  const [soundOn, setSoundOn] = useState(true);
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE_ID);
  const [entryQuestionIndex, setEntryQuestionIndex] = useState(0);
  const [entryAnswers, setEntryAnswers] = useState<EntryAnswers>({
    world: 'rocky-desert',
    restart: 'career',
    directions: [],
    cannotLose: 'stability',
    persona_style: 'architect',
    persona_compass: 'order',
  });
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lineIndex, setLineIndex] = useState(2);
  const [nickname, setNickname] = useState('');
  const [keywords, setKeywords] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>('');
  const [day, setDay] = useState<number | ''>('');
  const [shichen, setShichen] = useState<ShichenId | ''>('');
  const [mbti, setMbti] = useState<MbtiId>('unknown');
  const [avatar, setAvatar] = useState<AvatarValue | null>({ type: 'silhouette', dataUrl: silhouetteDataUrl });
  const [intake, setIntake] = useState<IntakeState>({
    recent_pressure: '',
    desired_change: '',
    relationship_context: '',
    creative_or_work_context: '',
    city_and_lifestyle: '',
  });
  const [situationLine, setSituationLine] = useState('');
  const [error, setError] = useState('');
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const landscapeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeLandscapeRef = useRef('');

  const restartChoice = typeof entryAnswers.restart === 'string' ? entryAnswers.restart : 'career';
  const directionAxis = axisFromRestart(restartChoice);
  const entryQuestions = useMemo(() => buildEntryQuestions(directionAxis), [directionAxis]);
  const selectedWorld = WORLD_OPTIONS.find((item) => item.id === sceneId) ?? WORLD_OPTIONS[3];
  const selectedDirections = Array.isArray(entryAnswers.directions) ? entryAnswers.directions : [];

  const dayCount = useMemo(
    () => (typeof year === 'number' && typeof month === 'number' ? daysInMonth(year, month) : 31),
    [year, month],
  );

  useEffect(() => {
    if (typeof day === 'number' && day > dayCount) setDay('');
  }, [day, dayCount]);

  useEffect(() => {
    if (!isGenerating) return undefined;
    const timer = window.setInterval(() => setLineIndex((value) => (value + 1) % generatingLines.length), 1600);
    const finish = window.setTimeout(() => {
      setIsGenerating(false);
      setPhase('result');
      window.history.replaceState(null, '', `/deep-rehearsal.html?session_id=local-preview&status=done`);
    }, 7600);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finish);
    };
  }, [isGenerating]);

  const ensureAudioNodes = useCallback(() => {
    if (!mainAudioRef.current) {
      const main = new Audio(MAIN_AUDIO);
      main.loop = true;
      main.volume = 0.34;
      main.preload = 'auto';
      mainAudioRef.current = main;
    }
    if (!landscapeAudioRef.current) {
      const landscape = new Audio();
      landscape.loop = true;
      landscape.volume = 0.42;
      landscape.preload = 'auto';
      landscapeAudioRef.current = landscape;
    }
  }, []);

  const pauseAudio = useCallback(() => {
    mainAudioRef.current?.pause();
    landscapeAudioRef.current?.pause();
  }, []);

  const playOneShot = useCallback(
    (src: string, volume = 0.55) => {
      if (!soundOn) return;
      const audio = new Audio(src);
      audio.volume = volume;
      void audio.play().catch(() => {});
    },
    [soundOn],
  );

  const startAudio = useCallback(
    (nextScene: SceneId = sceneId, force = false) => {
      if (!force && !soundOn) return;
      ensureAudioNodes();
      const main = mainAudioRef.current;
      const landscape = landscapeAudioRef.current;
      if (!main || !landscape) return;

      void main.play().catch(() => {});
      const nextLandscape = landscapeAudio(nextScene);
      if (activeLandscapeRef.current !== nextLandscape) {
        landscape.pause();
        landscape.src = nextLandscape;
        activeLandscapeRef.current = nextLandscape;
      }
      void landscape.play().catch(() => {});
    },
    [ensureAudioNodes, sceneId, soundOn],
  );

  useEffect(() => {
    if (!soundOn) {
      pauseAudio();
      return;
    }
    if (phase !== 'prelude' && phase !== 'home') startAudio(sceneId);
  }, [phase, sceneId, soundOn, pauseAudio, startAudio]);

  const birthOk =
    typeof year === 'number' &&
    typeof month === 'number' &&
    typeof day === 'number' &&
    typeof shichen === 'string' &&
    shichen.length > 0;

  const nextDisabled = step === 0 && !birthOk;

  const goNext = () => {
    if (step === 0 && !birthOk) {
      setError('请完整选择出生年、月、日与时辰（不确定时辰可选「未知」）。');
      return;
    }
    setError('');
    if (step < 2) {
      setStep((value) => value + 1);
      return;
    }
    setPhase('generating');
    setIsGenerating(true);
    window.history.replaceState(null, '', `/deep-rehearsal.html?session_id=local-preview`);
  };

  const handleEntrySelect = (questionKey: string, optionId: string, multi?: boolean) => {
    if (questionKey === 'world' && ['forest', 'ocean', 'cave', 'rocky-desert'].includes(optionId)) {
      setSceneId(optionId as SceneId);
      playOneShot(transitionAudio(optionId as SceneId), 0.48);
      startAudio(optionId as SceneId);
    } else {
      const interaction = INTERACTION_AUDIO[Math.floor(Math.random() * INTERACTION_AUDIO.length)];
      playOneShot(interaction, 0.42);
    }
    setEntryAnswers((value) => {
      if (!multi) {
        const next = { ...value, [questionKey]: optionId };
        if (questionKey === 'restart') next.directions = [];
        return next;
      }
      const current = Array.isArray(value[questionKey]) ? (value[questionKey] as string[]) : [];
      const next = current.includes(optionId)
        ? current.filter((item) => item !== optionId)
        : current.length >= 3
          ? current
          : [...current, optionId];
      return { ...value, [questionKey]: next };
    });
    if (!multi) {
      window.setTimeout(() => {
        setEntryQuestionIndex((value) => {
          if (value >= entryQuestions.length - 1) {
            setPhase('disclaimer');
            return value;
          }
          return value + 1;
        });
      }, 280);
    }
  };

  const confirmEntryQuestion = () => {
    playOneShot(INTERACTION_AUDIO[0], 0.42);
    if (entryQuestionIndex >= entryQuestions.length - 1) {
      setPhase('disclaimer');
      return;
    }
    setEntryQuestionIndex((value) => value + 1);
  };

  const enterDeep = (mode: 'quick' | 'deep') => {
    playOneShot(INTERACTION_AUDIO[1], 0.42);
    const entryPayload = {
      experienceMode: mode,
      worldSceneId: sceneId,
      worldTheme: selectedWorld.detail.split('·')[0].trim(),
      restartChoice,
      cannotLose: typeof entryAnswers.cannotLose === 'string' ? entryAnswers.cannotLose : 'stability',
      currentState: 'waiting',
      lifeStage: 'unknown',
      directions: selectedDirections.map((id) => {
        const item = DIRECTION_OPTIONS[directionAxis].find((option) => option.id === id);
        return { id, label: item?.label ?? id };
      }),
      savingsRunway: 'na',
      supportWeight: null,
      quizAnswers: [],
    };
    try {
      sessionStorage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(entryPayload));
      sessionStorage.setItem('entry:experience-mode:v1', mode);
    } catch {
      // Session storage is an enhancement for this local replica.
    }
    setPhase('deep');
  };

  const restart = () => {
    pauseAudio();
    setPhase('prelude');
    setSceneId(DEFAULT_SCENE_ID);
    setStep(0);
    setEntryQuestionIndex(0);
    setIsGenerating(false);
    setLineIndex(2);
    window.history.replaceState(null, '', '/deep-rehearsal.html');
  };

  const stageStyle = { '--accent': ACCENT } as CSSProperties;
  const toggleSound = () => {
    setSoundOn((value) => {
      const next = !value;
      if (!next) pauseAudio();
      else window.setTimeout(() => startAudio(sceneId, true), 0);
      return next;
    });
  };
  const backdropMode: BackdropMode =
    phase === 'prelude' || phase === 'home'
      ? 'entry-video'
      : phase === 'deep' || phase === 'generating' || phase === 'result'
        ? 'flow-video'
        : 'entry-scene';

  const stages = [
    <StageShell
      key="birth"
      eyebrow="DEEP REHEARSAL · PLAYER & BIRTH"
      title="先为这次深度副本命名"
      description="为副本取个名字，并留下出生刻度——出生年月日与时辰将用于更贴近你的镜像推演。"
    >
      <div className="deep-form-stack">
        <p className="entry-carryover-note">
          入口的沉浸式问答已记录你的全部选择（世界「{selectedWorld.detail.split('·')[0].trim()}」、想改变的维度、候选方向、性格题等）。深度体验将在此基础上多问几项，换一份更丰富的镜像人生预演。
        </p>
        <div className="deep-form-section">
          <p className="deep-section-label">玩家命名</p>
          <FieldLabel label="玩家昵称">
            <input
              className="deep-input"
              maxLength={24}
              placeholder="留空则使用「未命名玩家」"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="此刻关键词" optional="（可选）">
            <input
              className="deep-input"
              maxLength={60}
              placeholder="例如：新工具、旅行、创作"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
            />
          </FieldLabel>
        </div>

        <div className="deep-form-section deep-form-section--split">
          <p className="deep-section-label">
            出生刻度 <strong>*必填</strong>
          </p>
          <div className="birth-grid">
            <GlassSelect ariaLabel="出生年" value={year} onChange={(value) => setYear(value ? Number(value) : '')}>
              <option value="">年</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item} 年
                </option>
              ))}
            </GlassSelect>
            <GlassSelect ariaLabel="出生月" value={month} onChange={(value) => setMonth(value ? Number(value) : '')}>
              <option value="">月</option>
              {months.map((item) => (
                <option key={item} value={item}>
                  {item} 月
                </option>
              ))}
            </GlassSelect>
            <GlassSelect ariaLabel="出生日" value={day} onChange={(value) => setDay(value ? Number(value) : '')}>
              <option value="">日</option>
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((item) => (
                <option key={item} value={item}>
                  {item} 日
                </option>
              ))}
            </GlassSelect>
          </div>
          <GlassSelect ariaLabel="出生时辰" value={shichen} onChange={(value) => setShichen(value as ShichenId | '')}>
            <option value="">选择出生时辰</option>
            {SHICHEN_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id === 'unknown' ? `${item.label}（${item.range}）` : `${item.label} ${item.range}`}
              </option>
            ))}
          </GlassSelect>
          {!birthOk ? <p className="deep-helper">请完整选择出生年 / 月 / 日 与时辰后继续（不确定时辰可选「未知」）。</p> : null}
          {error ? <p className="deep-error">{error}</p> : null}
        </div>
      </div>
    </StageShell>,
    <StageShell
      key="persona"
      eyebrow="DEEP REHEARSAL · PERSONA"
      title="补全你的性格与形象"
      description="MBTI 可选（不清楚可留「没测过」）；人物形象在拍照 / 上传 / 默认剪影中三选一。"
    >
      <div className="deep-form-stack">
        <FieldLabel label="MBTI 类型" optional="（可选）">
          <GlassSelect ariaLabel="MBTI 类型" value={mbti} onChange={(value) => setMbti(value as MbtiId)}>
            {MBTI_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </GlassSelect>
        </FieldLabel>
        <div className="deep-form-section deep-form-section--split">
          <p className="deep-section-label deep-section-label--body">人物形象 <span>（拍照 / 上传 / 默认剪影，三选一）</span></p>
          <AvatarCapture value={avatar} onChange={setAvatar} />
        </div>
      </div>
    </StageShell>,
    <StageShell
      key="signals"
      eyebrow="DEEP REHEARSAL · SIGNAL DETAILS · 全部可选"
      title="留下一些线索"
      description="全部可选，留空也能生成。这些只用于让推演更贴近你，不会显示在公共屏幕。"
    >
      <div className="signals-grid">
        {INTAKE_FIELDS.map(([field, label, placeholder]) => (
          <FieldLabel key={field} label={label}>
            <input
              className="deep-input"
              maxLength={48}
              placeholder={placeholder}
              value={intake[field]}
              onChange={(event) => setIntake((value) => ({ ...value, [field]: event.target.value }))}
            />
          </FieldLabel>
        ))}
        <FieldLabel label="一句话现状" optional="（可选，≤40 字）">
          <input
            className="deep-input"
            maxLength={40}
            placeholder="例如：在大厂做了三年，最近总在想还要不要待下去"
            value={situationLine}
            onChange={(event) => setSituationLine(event.target.value)}
          />
        </FieldLabel>
      </div>
    </StageShell>,
  ];

  return (
    <div className="deep-app" style={stageStyle}>
        <OriginalBackdrop mode={backdropMode} sceneId={sceneId} />
      <EntryCursor accent={ACCENT} />
      <button className="sound-toggle" type="button" aria-label="切换背景音乐" onClick={toggleSound}>
        <Volume2 size={15} />
        <span>声音</span>
        <strong>{soundOn ? '开' : '关'}</strong>
      </button>

      {phase === 'prelude' ? (
        <PreludeView onIlluminate={() => {
          playOneShot(transitionAudio(DEFAULT_SCENE_ID), 0.44);
          setPhase('home');
        }} />
      ) : phase === 'home' ? (
        <HomeView onBegin={() => {
          startAudio(sceneId);
          playOneShot(INTERACTION_AUDIO[2], 0.44);
          setPhase('teaser');
        }} />
      ) : phase === 'teaser' ? (
        <TeaserView onContinue={() => {
          playOneShot(INTERACTION_AUDIO[3], 0.42);
          setPhase('questions');
        }} />
      ) : phase === 'questions' ? (
        <EntryQuestionView
          questions={entryQuestions}
          index={entryQuestionIndex}
          answers={entryAnswers}
          onSelect={handleEntrySelect}
          onConfirm={confirmEntryQuestion}
        />
      ) : phase === 'disclaimer' ? (
        <DisclaimerView
          onBack={() => {
            playOneShot(INTERACTION_AUDIO[4], 0.38);
            setPhase('questions');
          }}
          onContinue={() => {
            playOneShot(INTERACTION_AUDIO[5], 0.42);
            setPhase('choice');
          }}
        />
      ) : phase === 'choice' ? (
        <ChoiceView onQuick={() => enterDeep('quick')} onDeep={() => enterDeep('deep')} />
      ) : phase === 'generating' ? (
        <GeneratingView line={generatingLines[lineIndex]} />
      ) : phase === 'result' ? (
        <ResultPreview onRestart={restart} />
      ) : (
        <>
          <main className="deep-main">{stages[step]}</main>
          <footer className="deep-nav">
            <div className="deep-dots" role="tablist" aria-label="页面进度">
              {[0, 1, 2].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`第 ${item + 1} 页`}
                  aria-current={step === item}
                  data-active={step === item}
                  data-done={item < step}
                  onClick={() => item <= step && setStep(item)}
                />
              ))}
            </div>
            <div className="deep-nav-actions">
              {step > 0 ? (
                <button type="button" className="liquid-action liquid-action--ghost" onClick={() => setStep((value) => value - 1)}>
                  <ChevronLeft size={16} />
                  <span>上一步</span>
                </button>
              ) : null}
              <button type="button" className="liquid-action" disabled={nextDisabled} onClick={goNext}>
                <span>{step === 2 ? '完成，进入预演 →' : '下一步 →'}</span>
                {step === 2 ? null : <ChevronRight size={16} />}
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
