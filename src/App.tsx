import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

type ArchiveObject = {
  id: string;
  label: string;
  image: string;
  title: string;
};

type Locale = 'ko' | 'en';
type AppPage = 'main' | 'lp' | 'jangma' | 'track' | 'diary';
type JangmaWindow = 'profile' | 'playlist' | 'stills';
type TrackArchiveMode = 'mv' | 'lyric';
type WhiteRecordControlId = 'play' | 'pause' | 'stop' | 'record' | 'reset';
type WhiteRecordPadId = 'raindrop' | 'bird' | 'wind' | 'wave' | 'grasshopper';
type WhiteRecordChoiceId = 'sunset' | 'city' | 'mountain' | 'sea';
type JangmaWindowPosition = {
  left: number;
  top: number;
};

const copy = {
  ko: {
    support:
      '본 사업은 2026년 부산광역시, 부산문화재단 <2026 청년 신진예술가 창작활동 지원사업>의 지원을 받았습니다.',
    jangmaIntro: ['언젠가 모래의 일부가 될 수 있다면', '안녕하세요. 싱어송라이터 장마입니다.'],
  },
  en: {
    support:
      'Supported by Busan Metropolitan City & Busan Cultural Foundation <2026 Emerging Young Artists Creative Support Program>',
    jangmaIntro: ['If I Could Become a Grain of Sand, Someday.', "Hello, I'm Jangma, a singer-songwriter."],
  },
};

const archiveObjects: ArchiveObject[] = [
  { id: 'lp', label: 'LP archive', image: 'main-lp.png', title: 'White Record' },
  { id: 'camera', label: 'Camera archive', image: 'main-camera.png', title: 'Track Archive' },
  { id: 'jangma', label: 'Jangma microphone archive', image: 'main-jangma.png', title: 'Jangma' },
  { id: 'diary', label: 'Diary archive', image: 'main-diary.png', title: 'White Diary' },
];

const loadingLetters = ['L', 'o', 'a', 'd', 'i', 'n', 'g'];
const jangmaStills = [
  'KakaoTalk_Photo_2026-07-16-15-26-47 001.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-49 002.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-51 003.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-52 004.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-54 005.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-56 006.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-57 007.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-57 008.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-58 009.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-58 010.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-59 011.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-26-59 012.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-27-00 013.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-27-00 014.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-27-00 015.jpeg',
  'KakaoTalk_Photo_2026-07-16-15-27-00 016.jpeg',
];

const playlistItems = [
  {
    koTitle: '비비틱스',
    enTitle: 'vivitics',
    time: '4:01',
    image: 'playlist-vivitics.png',
    link: 'https://youtu.be/0ZzHRXLFu7k?si=HG9X2cxk-2ydrUq8',
  },
  {
    koTitle: '수마가 몰려와',
    enTitle: 'Nighty Night',
    time: '2:50',
    image: 'playlist-nighty-night.png',
    link: 'https://youtu.be/hbTIpGJcY2Y?si=Fd_u8X56edppcj-7',
  },
  {
    koTitle: '비보',
    enTitle: 'Dear.',
    time: '1:32',
    image: 'playlist-dear.png',
    link: 'https://youtu.be/_IEMR2eiYYA?si=ms-Uj1RMU1rvh4jt',
  },
  {
    koTitle: '사랑해',
    enTitle: 'Eternally',
    time: '3:13',
    image: 'playlist-eternally.png',
    link: 'https://youtu.be/gleFEoPHgOE?si=RPKPdHbXgJDNPcMX',
  },
  {
    koTitle: '26',
    enTitle: '26',
    time: '2:39',
    image: 'playlist-26.png',
    link: 'https://youtu.be/jEdoHGAi3lw?si=n-I93TQv5IAjVfcx',
  },
];

const slotLayouts = [
  { left: 452, top: 16, width: 456, height: 384, opacity: 1 },
  { left: 940, top: 44, width: 300, height: 280, opacity: 1 },
  { left: 578, top: 0, width: 101, height: 254, opacity: 0.98 },
  { left: 120, top: 60, width: 300, height: 280, opacity: 1 },
];
const snapDistance = 170;
const motionDuration = 420;
const titleChangeDelay = 180;
const minimumInitialLoadingMs = 2000;
const pageTransitionLoadingMs = 900;
const jangmaDesignWidth = 1920;
const jangmaDesignHeight = 1080;
const jangmaFitRatio = 0.94;
const jangmaContentCenterX = (149 + 1726) / 2;
const jangmaDragMinLeft = 420;
const stillFrameWidth = 924;
const mobileStillFrameWidth = 329;
const trackArchiveDesignWidth = 1920;
const trackArchiveDesignHeight = 1129;
const trackArchiveFitRatio = 0.98;
const whitePagesDesignWidth = 1920;
const whitePagesDesignHeight = 1080;
const whitePagesFitRatio = 1;
const whiteRecordDesignWidth = 1440;
const whiteRecordDesignHeight = 900;
const scrollToPageTop = () => {
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const whiteRecordObjects = [
  {
    id: 'tree',
    label: 'Tree',
    offImage: 'white-record-object-tree-off.png',
    onImage: 'white-record-object-tree-on.png',
    audio: 'object_tree.mp3',
    className: 'white-record-object-tree',
  },
  {
    id: 'watering-can',
    label: 'Watering can',
    offImage: 'white-record-object-watering-can-off.png',
    onImage: 'white-record-object-watering-can-on.png',
    audio: 'object-wateringcan.mp3',
    className: 'white-record-object-watering-can',
  },
  {
    id: 'bubble',
    label: 'Bubble',
    offImage: 'white-record-object-bubble-off.png',
    onImage: 'white-record-object-bubble-on.png',
    audio: 'object_bubble.mp3',
    className: 'white-record-object-bubble',
  },
  {
    id: 'ice',
    label: 'Ice',
    offImage: 'white-record-object-ice-off.png',
    onImage: 'white-record-object-ice-on.png',
    audio: 'object_ice.mp3',
    className: 'white-record-object-ice',
  },
  {
    id: 'glass-bottle',
    label: 'Glass bottle',
    offImage: 'white-record-object-glass-bottle-off.png',
    onImage: 'white-record-object-glass-bottle-on.png',
    audio: 'object_bottle.mp3',
    className: 'white-record-object-glass-bottle',
  },
  {
    id: 'camcorder',
    label: 'Camcorder',
    offImage: 'white-record-object-camcorder-off.png',
    onImage: 'white-record-object-camcorder-on.png',
    audio: 'object_camera.mp3',
    className: 'white-record-object-camcorder',
  },
] as const;

const whiteRecordChoices = [
  {
    id: 'sunset',
    label: 'Sunset record',
    image: 'white-record-lp-sunset-off.png',
    activeImage: 'white-record-lp-sunset-on.png',
    discImage: 'white-record-disc-sunset.png',
  },
  {
    id: 'city',
    label: 'City record',
    image: 'white-record-lp-city-off.png',
    activeImage: 'white-record-lp-city-on.png',
    discImage: 'white-record-disc-city.png',
  },
  {
    id: 'mountain',
    label: 'Mountain record',
    image: 'white-record-lp-mountain-off.png',
    activeImage: 'white-record-lp-mountain-on.png',
    discImage: 'white-record-disc-mountain.png',
  },
  {
    id: 'sea',
    label: 'Sea record',
    image: 'white-record-lp-sea-off.png',
    activeImage: 'white-record-lp-sea-on.png',
    discImage: 'white-record-disc-sea.png',
  },
] as const;

const whiteRecordControls = [
  { id: 'play', label: 'Play', image: 'white-record-control-play.png', activeImage: 'white-record-control-play-active.png' },
  { id: 'pause', label: 'Pause', image: 'white-record-control-pause.png', activeImage: 'white-record-control-pause-active.png' },
  { id: 'stop', label: 'Stop', image: 'white-record-control-stop.png', activeImage: 'white-record-control-stop-active.png' },
  { id: 'record', label: 'Record', image: 'white-record-control-record.png', activeImage: 'white-record-control-record-active.png' },
  { id: 'reset', label: 'Reset', image: 'white-record-control-reset.png', activeImage: 'white-record-control-reset-active.png' },
] as const;

const whiteRecordPads = [
  {
    id: 'grasshopper',
    label: 'Grasshopper noise',
    audio: 'em_grasshopper.mp3',
    image: 'white-record-pad-1-off.png',
    activeImage: 'white-record-pad-1-on.png',
  },
  {
    id: 'wind',
    label: 'Wind noise',
    audio: 'em_wind.mp3',
    image: 'white-record-pad-2-off.png',
    activeImage: 'white-record-pad-2-on.png',
  },
  {
    id: 'wave',
    label: 'Wave noise',
    audio: 'em_wave.mp3',
    image: 'white-record-pad-3-off.png',
    activeImage: 'white-record-pad-3-on.png',
  },
  {
    id: 'raindrop',
    label: 'Raindrop noise',
    audio: 'em_raindrop.mp3',
    image: 'white-record-pad-4-off.png',
    activeImage: 'white-record-pad-4-on.png',
  },
  {
    id: 'bird',
    label: 'Bird noise',
    audio: 'em_bird.mp3',
    image: 'white-record-pad-5-off.png',
    activeImage: 'white-record-pad-5-on.png',
  },
] as const;

const whiteRecordMaxSeconds = 30;
const whiteRecordPlaybackGain = 2.2;

const formatRecordTime = (seconds: number) => `0 : ${String(Math.max(0, seconds)).padStart(2, '0')}`;

type HomeButtonProps = {
  variant?: 'dark' | 'light';
  className?: string;
};

function HomeButton({ variant = 'dark', className = '' }: HomeButtonProps) {
  return (
    <button
      className={`home-button ${className}`.trim()}
      type="button"
      aria-label="Home"
      onClick={() => {
        window.location.hash = '';
      }}
    >
      <img src={asset(variant === 'light' ? 'home-light.svg' : 'home-dark.svg')} alt="" />
    </button>
  );
}

const jangmaInitialWindowPositions: Record<JangmaWindow, JangmaWindowPosition> = {
  profile: { left: 1199, top: 662 },
  playlist: { left: 430, top: 420 },
  stills: { left: 778, top: 59 },
};

const jangmaWindowSizes: Record<JangmaWindow, { width: number; height: number }> = {
  profile: { width: 620, height: 215 },
  playlist: { width: 419, height: 592 },
  stills: { width: 948, height: 568 },
};

const wrapPosition = (value: number) => ((value % archiveObjects.length) + archiveObjects.length) % archiveObjects.length;

const interpolate = (from: number, to: number, amount: number) => from + (to - from) * amount;

const getObjectStyle = (position: number): CSSProperties => {
  const startIndex = Math.floor(position);
  const endIndex = (startIndex + 1) % slotLayouts.length;
  const amount = position - startIndex;
  const start = slotLayouts[startIndex];
  const end = slotLayouts[endIndex];
  const centerDistance = Math.min(position, archiveObjects.length - position);

  return {
    left: interpolate(start.left, end.left, amount),
    top: interpolate(start.top, end.top, amount),
    width: interpolate(start.width, end.width, amount),
    height: interpolate(start.height, end.height, amount),
    opacity: interpolate(start.opacity, end.opacity, amount),
    zIndex: Math.round(40 - centerDistance * 8),
  };
};

type LanguageSwitchProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

function LanguageSwitch({ locale, onLocaleChange }: LanguageSwitchProps) {
  return (
    <nav className="language-switch" aria-label="Language">
      <button
        className={locale === 'en' ? 'is-active' : undefined}
        type="button"
        onClick={() => onLocaleChange('en')}
      >
        English
      </button>
      <button
        className={locale === 'ko' ? 'is-active' : undefined}
        type="button"
        onClick={() => onLocaleChange('ko')}
      >
        Korean
      </button>
    </nav>
  );
}

type HeroObjectsProps = {
  onNavigate: (href: string) => void;
};

function HeroObjects({ onNavigate }: HeroObjectsProps) {
  const [rotation, setRotation] = useState(0);
  const [activeTitle, setActiveTitle] = useState(archiveObjects[0].title);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const titleTimer = useRef<number | null>(null);
  const didDrag = useRef(false);
  const pressedObject = useRef<{ id: string; index: number; isCenter: boolean } | null>(null);
  const dragProgress = isDragging ? -dragOffset / snapDistance : 0;

  const scheduleTitleChange = (nextRotation: number) => {
    if (titleTimer.current) {
      window.clearTimeout(titleTimer.current);
    }

    titleTimer.current = window.setTimeout(() => {
      setActiveTitle(archiveObjects[nextRotation].title);
      titleTimer.current = null;
    }, titleChangeDelay);
  };

  const moveToRotation = (nextRotation: number) => {
    const normalizedRotation = (nextRotation + archiveObjects.length) % archiveObjects.length;
    setRotation(normalizedRotation);
    scheduleTitleChange(normalizedRotation);
  };

  const visibleObjects = useMemo(
    () =>
      archiveObjects.map((object, objectIndex) => {
        const position = wrapPosition(objectIndex - rotation - dragProgress);
        const centerDistance = Math.min(position, archiveObjects.length - position);
        return { object, style: getObjectStyle(position), isCenter: centerDistance < 0.2 };
      }),
    [dragProgress, rotation],
  );

  const rotatePrevious = () => {
    moveToRotation(rotation - 1);
  };

  const rotateNext = () => {
    moveToRotation(rotation + 1);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const objectElement = (event.target as HTMLElement).closest<HTMLElement>('.gallery-object');
    pressedObject.current = objectElement
      ? {
          id: objectElement.dataset.objectId ?? '',
          index: Number(objectElement.dataset.objectIndex ?? 0),
          isCenter: objectElement.dataset.isCenter === 'true',
        }
      : null;
    dragStartX.current = event.clientX;
    didDrag.current = false;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;
    const nextOffset = event.clientX - dragStartX.current;
    if (Math.abs(nextOffset) > 6) {
      didDrag.current = true;
    }
    setDragOffset(nextOffset);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;

    const finalOffset = event.clientX - dragStartX.current;
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);

    const stepCount = Math.round(-finalOffset / snapDistance);
    const clickTarget = pressedObject.current;
    pressedObject.current = null;

    if (stepCount === 0) {
      if (!didDrag.current && clickTarget?.isCenter && ['lp', 'camera', 'jangma', 'diary'].includes(clickTarget.id)) {
        onNavigate(`#${clickTarget.id}`);
      } else if (!didDrag.current && clickTarget && !clickTarget.isCenter) {
        moveToRotation(clickTarget.index);
      }
      return;
    }
    moveToRotation(rotation + stepCount);
  };

  return (
    <>
      <section
        className={`object-stage${isDragging ? ' is-dragging' : ''}`}
        aria-label="White Record archive objects"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
      {visibleObjects.map(({ object, style, isCenter }, objectIndex) => (
        <div
          className={`gallery-object asset-${object.id}${
            ['lp', 'camera', 'jangma', 'diary'].includes(object.id) ? ' is-clickable' : ''
          }`}
          aria-label={object.label}
          key={object.id}
          style={style}
          data-object-id={object.id}
          data-object-index={objectIndex}
          data-is-center={isCenter}
        >
          <img className="object-image" src={asset(object.image)} alt="" />
        </div>
      ))}

      <button
        className="stage-button stage-button-prev"
        aria-label="Previous object"
        onClick={rotatePrevious}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <img src={asset('button-next.svg')} alt="" />
      </button>
      <button
        className="stage-button stage-button-next"
        aria-label="Next object"
        onClick={rotateNext}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <img src={asset('button-next.svg')} alt="" />
      </button>
      </section>

      <a
        className="main-link"
        href={`#${archiveObjects[rotation].id}`}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(`#${archiveObjects[rotation].id}`);
        }}
      >
        {activeTitle}
      </a>
    </>
  );
}

type WindowFrameProps = {
  id: JangmaWindow;
  title: string;
  className: string;
  order: number;
  position: JangmaWindowPosition;
  onClose: (id: JangmaWindow) => void;
  onFocus: (id: JangmaWindow) => void;
  onBarPointerDown: (id: JangmaWindow, event: PointerEvent<HTMLElement>) => void;
  onBarPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onBarPointerUp: (event: PointerEvent<HTMLElement>) => void;
  children: ReactNode;
};

function WindowFrame({
  id,
  title,
  className,
  order,
  position,
  onClose,
  onFocus,
  onBarPointerDown,
  onBarPointerMove,
  onBarPointerUp,
  children,
}: WindowFrameProps) {
  return (
    <section
      className={`jangma-window ${className}`}
      style={{ left: position.left, top: position.top, zIndex: 20 + order }}
      onPointerDown={() => onFocus(id)}
      aria-label={title}
    >
      <header
        className="jangma-window-bar"
        onPointerDown={(event) => onBarPointerDown(id, event)}
        onPointerMove={onBarPointerMove}
        onPointerUp={onBarPointerUp}
        onPointerCancel={onBarPointerUp}
      >
        <span>{title}</span>
        <button
          className="jangma-close"
          type="button"
          aria-label={`Close ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onClose(id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <img src={asset('window-close.svg')} alt="" />
        </button>
      </header>
      {children}
    </section>
  );
}

type JangmaPageProps = {
  locale: Locale;
};

function JangmaPage({ locale }: JangmaPageProps) {
  const [openWindows, setOpenWindows] = useState<JangmaWindow[]>(['stills', 'playlist', 'profile']);
  const [currentStill, setCurrentStill] = useState(0);
  const [sceneScale, setSceneScale] = useState(1);
  const [sceneOffsetX, setSceneOffsetX] = useState(0);
  const [stillDragOffset, setStillDragOffset] = useState(0);
  const [isStillDragging, setIsStillDragging] = useState(false);
  const stillDragStartX = useRef<number | null>(null);
  const stillDidDrag = useRef(false);
  const [windowPositions, setWindowPositions] = useState<Record<JangmaWindow, JangmaWindowPosition>>(jangmaInitialWindowPositions);
  const dragWindow = useRef<{
    id: JangmaWindow;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);
  const activeWindow = openWindows[openWindows.length - 1] ?? null;
  const isMobile = useIsMobileViewport();

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(window.innerWidth / jangmaDesignWidth, window.innerHeight / jangmaDesignHeight, 1);
      const fittedScale = nextScale * jangmaFitRatio;
      setSceneScale(fittedScale);
      setSceneOffsetX(window.innerWidth / 2 - jangmaContentCenterX * fittedScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const bringWindowToFront = (windowId: JangmaWindow) => {
    setOpenWindows((current) => [...current.filter((id) => id !== windowId), windowId]);
  };

  const closeWindow = (windowId: JangmaWindow) => {
    setOpenWindows((current) => current.filter((id) => id !== windowId));
  };

  const clampWindowPosition = (windowId: JangmaWindow, left: number, top: number): JangmaWindowPosition => {
    const size = jangmaWindowSizes[windowId];
    return {
      left: Math.min(Math.max(left, jangmaDragMinLeft), jangmaDesignWidth - size.width - 24),
      top: Math.min(Math.max(top, 24), jangmaDesignHeight - size.height - 24),
    };
  };

  const handleWindowDragStart = (windowId: JangmaWindow, event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const currentPosition = windowPositions[windowId];
    dragWindow.current = {
      id: windowId,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: currentPosition.left,
      startTop: currentPosition.top,
    };
    bringWindowToFront(windowId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleWindowDragMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragWindow.current;
    if (!drag) return;

    const nextLeft = drag.startLeft + (event.clientX - drag.startClientX) / sceneScale;
    const nextTop = drag.startTop + (event.clientY - drag.startClientY) / sceneScale;
    const nextPosition = clampWindowPosition(drag.id, nextLeft, nextTop);
    setWindowPositions((current) => ({ ...current, [drag.id]: nextPosition }));
  };

  const handleWindowDragEnd = (event: PointerEvent<HTMLElement>) => {
    if (!dragWindow.current) return;
    event.currentTarget.releasePointerCapture(dragWindow.current.pointerId);
    dragWindow.current = null;
  };

  const snapStillTo = (nextIndex: number) => {
    setCurrentStill(Math.min(Math.max(nextIndex, 0), jangmaStills.length - 1));
  };

  const handleStillPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    stillDragStartX.current = event.clientX;
    stillDidDrag.current = false;
    setStillDragOffset(0);
    setIsStillDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleStillPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (stillDragStartX.current === null) return;
    const nextOffset = (event.clientX - stillDragStartX.current) / sceneScale;
    if (Math.abs(nextOffset) > 8) {
      stillDidDrag.current = true;
    }
    setStillDragOffset(nextOffset);
  };

  const handleStillPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (stillDragStartX.current === null) return;
    const dragDistance = (event.clientX - stillDragStartX.current) / sceneScale;
    stillDragStartX.current = null;
    setStillDragOffset(0);
    setIsStillDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    const stepCount = Math.round(-dragDistance / stillFrameWidth);
    if (stepCount !== 0) {
      snapStillTo(currentStill + stepCount);
      return;
    }

    if (Math.abs(dragDistance) > 80) {
      snapStillTo(currentStill + (dragDistance > 0 ? -1 : 1));
    }
  };

  const handleMobileStillPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (stillDragStartX.current === null) return;
    const nextOffset = event.clientX - stillDragStartX.current;
    if (Math.abs(nextOffset) > 8) {
      stillDidDrag.current = true;
    }
    setStillDragOffset(nextOffset);
  };

  const handleMobileStillPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (stillDragStartX.current === null) return;
    const dragDistance = event.clientX - stillDragStartX.current;
    stillDragStartX.current = null;
    setStillDragOffset(0);
    setIsStillDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    const stepCount = Math.round(-dragDistance / mobileStillFrameWidth);
    if (stepCount !== 0) {
      snapStillTo(currentStill + stepCount);
      return;
    }

    if (Math.abs(dragDistance) > 48) {
      snapStillTo(currentStill + (dragDistance > 0 ? -1 : 1));
    }
  };

  if (isMobile) {
    return (
      <main className="jangma-mobile-page">
        <section className="jangma-mobile-scene" aria-label="Jangma">
          <img className="jangma-mobile-bg" src={asset('jangma-bg.png')} alt="" />
          <HomeButton className="home-button-jangma-mobile" variant="light" />

          <section className="jangma-mobile-profile-card" aria-label="Jangma profile">
            <img src={asset('jangma-profile.png')} alt="Jangma profile" />
            <p>Jangma</p>
          </section>

          <section className="jangma-mobile-window jangma-mobile-stills-window" aria-label="Music Video Stills">
            <header className="jangma-mobile-window-bar">
              <span>Muisic Video Stills</span>
            </header>
            <div
              className={`jangma-mobile-stills-body${isStillDragging ? ' is-dragging' : ''}`}
              onPointerDown={handleStillPointerDown}
              onPointerMove={handleMobileStillPointerMove}
              onPointerUp={handleMobileStillPointerEnd}
              onPointerCancel={handleMobileStillPointerEnd}
            >
              <div className="jangma-mobile-stills-viewport">
                <div
                  className="jangma-mobile-stills-track"
                  style={{ transform: `translateX(${-currentStill * mobileStillFrameWidth + stillDragOffset}px)` }}
                >
                  {jangmaStills.map((still) => (
                    <img src={asset(still)} alt="" key={still} />
                  ))}
                </div>
              </div>
              <div className="jangma-mobile-stills-dots" aria-hidden="true">
                {jangmaStills.map((still, index) => (
                  <span className={index === currentStill ? 'is-active' : ''} key={still} />
                ))}
              </div>
            </div>
          </section>

          <section className="jangma-mobile-window jangma-mobile-intro-window" aria-label="Jangma intro">
            <header className="jangma-mobile-window-bar">
              <span>Jangma</span>
            </header>
            <div className="jangma-mobile-intro-body">
              {copy[locale].jangmaIntro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="jangma-mobile-window jangma-mobile-playlist-window" aria-label="Playlist">
            <header className="jangma-mobile-window-bar">
              <span>Playlist</span>
            </header>
            <div className="jangma-mobile-playlist-body">
              {playlistItems.map((item) => (
                <a className="jangma-mobile-playlist-row" href={item.link} target="_blank" rel="noreferrer" key={item.enTitle}>
                  <span className="jangma-mobile-playlist-row-inner">
                    <span>
                      <img src={asset(item.image)} alt="" />
                      <span className="jangma-mobile-playlist-title">{item.koTitle}</span>
                    </span>
                    <span className="jangma-mobile-playlist-time">{item.time}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="jangma-page">
      <img className="jangma-bg" src={asset('jangma-bg.png')} alt="" />

      <div className="jangma-scene" style={{ transform: `translateX(${sceneOffsetX}px) scale(${sceneScale})` }}>
        <HomeButton className="home-button-jangma" variant="light" />

        <aside className="jangma-sidebar" aria-label="Jangma controls">
          <div className="jangma-profile-card">
            <img src={asset('jangma-profile.png')} alt="Jangma profile" />
            <p>Jangma</p>
          </div>

          <nav className="jangma-button-stack" aria-label="Jangma page sections">
            {[
              ['profile', 'Profile'],
              ['playlist', 'Playlist'],
              ['stills', 'Video Stills'],
            ].map(([id, label]) => (
              <button
                className={`jangma-menu-button ${activeWindow === id ? 'is-active' : ''}`}
                type="button"
                key={id}
                onClick={() => bringWindowToFront(id as JangmaWindow)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="jangma-window-layer">
          {openWindows.map((windowId, index) => {
            if (windowId === 'profile') {
              return (
                <WindowFrame
                  id="profile"
                title="Jangma"
                className="jangma-profile-window"
                order={index}
                position={windowPositions.profile}
                key={windowId}
                onClose={closeWindow}
                onFocus={bringWindowToFront}
                onBarPointerDown={handleWindowDragStart}
                onBarPointerMove={handleWindowDragMove}
                onBarPointerUp={handleWindowDragEnd}
                >
                  <div className="jangma-profile-copy">
                    {copy[locale].jangmaIntro.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </WindowFrame>
              );
            }

            if (windowId === 'playlist') {
              return (
                <WindowFrame
                  id="playlist"
                title="Playlist"
                className="jangma-playlist-window"
                order={index}
                position={windowPositions.playlist}
                key={windowId}
                onClose={closeWindow}
                onFocus={bringWindowToFront}
                onBarPointerDown={handleWindowDragStart}
                onBarPointerMove={handleWindowDragMove}
                onBarPointerUp={handleWindowDragEnd}
              >
                  <div className="jangma-playlist-list">
                    {playlistItems.map((item) => (
                      <a className="playlist-row" href={item.link} target="_blank" rel="noreferrer" key={item.enTitle}>
                        <span className="playlist-row-inner">
                          <img src={asset(item.image)} alt="" />
                          <span className="playlist-title">{locale === 'ko' ? item.koTitle : item.enTitle}</span>
                          <span className="playlist-time">{item.time}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </WindowFrame>
              );
            }

            return (
              <WindowFrame
                id="stills"
                title="Music Video Stills"
                className="jangma-stills-window"
                order={index}
                position={windowPositions.stills}
                key={windowId}
                onClose={closeWindow}
                onFocus={bringWindowToFront}
                onBarPointerDown={handleWindowDragStart}
                onBarPointerMove={handleWindowDragMove}
                onBarPointerUp={handleWindowDragEnd}
              >
                <div className="stills-content">
                  <div
                    className={`stills-media${isStillDragging ? ' is-dragging' : ''}`}
                    onPointerDown={handleStillPointerDown}
                    onPointerMove={handleStillPointerMove}
                    onPointerUp={handleStillPointerEnd}
                    onPointerCancel={handleStillPointerEnd}
                  >
                    <div
                      className="stills-track"
                      style={{ transform: `translateX(${-currentStill * stillFrameWidth + stillDragOffset}px)` }}
                    >
                      {jangmaStills.map((still) => (
                        <img src={asset(still)} alt="" key={still} />
                      ))}
                    </div>
                    <div className="stills-dots" aria-label="Music video stills">
                      {jangmaStills.map((still, index) => (
                        <button
                          className={currentStill === index ? 'is-active' : undefined}
                          type="button"
                          aria-label={`Show still ${index + 1}`}
                          key={still}
                          onClick={() => setCurrentStill(index)}
                          onPointerDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </WindowFrame>
            );
          })}
        </div>
      </div>
    </main>
  );
}

type TrackArchivePageProps = {
  locale: Locale;
};

function TrackArchivePage({ locale }: TrackArchivePageProps) {
  const isMobile = useIsMobileViewport();
  const [trackMode, setTrackMode] = useState<TrackArchiveMode>('mv');
  const [selectedLyricTrack, setSelectedLyricTrack] = useState('01');
  const [expandedLyricImageIndex, setExpandedLyricImageIndex] = useState<number | null>(null);
  const [sceneScale, setSceneScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setSceneScale(
        Math.min(window.innerWidth / trackArchiveDesignWidth, window.innerHeight / trackArchiveDesignHeight, 1) *
          trackArchiveFitRatio,
      );
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const trackArchiveCopy = {
    ko: {
      albumTitle: ['장마 1st EP', '‘ 화이트 레코드 ’'],
      tracks: ['하나 둘', '맨발로 걷는 하루', '나만의 반딧불', '황혼성 사냥', '나만의 반딧불'],
      mvPlaces: [
        {
          title: '용소웰빙공원',
          description:
            '호수처럼 잔잔한 저수지와 울창한 숲이 조화를 이루는 기장의 숨겨진 보석입니다. 나무 그림자, 호수에 떠 있는 배 등 마치 꿈속을 거니는 듯한 몽환적인 풍경을 마주할 수 있습니다.',
        },
        {
          title: '중앙공원 편백숲',
          description:
            '하늘을 향해 곧게 뻗은 편백나무들이 청량한 공기를 전합니다. 우거진 나뭇가지 사이로 부드러운 햇살이 조각조각 부서져 내리는 모습이 무척 아름답습니다. 바람에 숲이 일렁이는 소리와 짙은 녹음은 지친 마음을 차분하게 가라앉혀 줍니다.',
        },
      ],
      trackDetails: [
        ['하나 둘', '노래를 피우는 사람들'],
        ['맨발로 걷는 하루', '아무 의미 없지는\n않았다고 생각해'],
        ['나만의 반딧불', '편지를 부칠 수가 없네'],
        ['황혼성 사냥', '어느 쪽으로 갈까'],
      ],
    },
    en: {
      albumTitle: ['Jangma 1st EP', '‘ White Record ’'],
      tracks: ['mic test', 'Hop Step Jump', 'fairytale', 'Twilight hunting', 'fairytale'],
      mvPlaces: [
        {
          title: 'Yongso Wellbeing Park',
          description:
            'A hidden gem in Gijang where a lake-like reservoir and a dense forest harmonize. With the shadows of the trees and a small boat drifting on the water, you will encounter a dreamy landscape that feels like walking through a dream.',
        },
        {
          title: 'Jungang Park Cypress Forest',
          description:
            'Cypress trees stretching straight toward the sky deliver crisp refreshing air. The way the soft sunlight breaks into pieces through the thick canopy is incredibly beautiful. The sound of the woods swaying in the wind and the deep greenery gently calm a weary heart.',
        },
      ],
      trackDetails: [
        ['mic test', 'The song smokers'],
        ['Hop Step Jump', 'I think it wasn’t all for nothing'],
        ['fairytale', "Can't mail this letter"],
        ['Twilight hunting', 'Which way to go'],
      ],
    },
  };

  const pageCopy = trackArchiveCopy[locale];
  const videoSources = {
    mv: 'https://www.youtube.com/embed/mAQSh8NP_Y0?si=sh9jUIXzFMcMW37V',
    lyric: {
      '01': 'https://www.youtube.com/embed/MA_ngGO4_Ss?si=pcBtrr-Pwjm3WnVf',
      '02': 'https://www.youtube.com/embed/526UPWqRXVA?si=G9Tn1LIWM-QgIwzV',
      '04': 'https://www.youtube.com/embed/pzfrsOkinQU?si=9ehOqQ6K6bWkBTtZ',
    },
  };
  const mvImages = [
    'KakaoTalk_Photo_2026-07-16-15-26-49 002.jpeg',
    'KakaoTalk_Photo_2026-07-16-15-26-51 003.jpeg',
    'KakaoTalk_Photo_2026-07-16-15-26-52 004.jpeg',
    'KakaoTalk_Photo_2026-07-16-15-26-54 005.jpeg',
  ].map((image, index) => ({
    src: asset(image),
    alt: `MV still ${index + 1}`,
  }));
  const lyricTracks = [
    {
      id: '01',
      koTitle: '하나 둘',
      enTitle: 'mic test',
      imageCount: 4,
      places: [
        {
          koName: '청사포',
          enName: 'Cheongsapo',
          koDescription:
            '소박한 포구의 정취와 해변열차가 지나가는 철길, 푸른 바다가 어우러져 한 폭의 그림 같은 풍경을 자아내는 곳입니다. 붉고 하얀 쌍둥이 등대 사이로 밀려오는 파도 소리는 가만히 귀를 기울이게 만드는 매력이 있습니다.',
          enDescription:
            'A place where the quiet charm of a small port, a railway with passing beach trains, and the blue sea come together to create a scene straight out of a painting. The sound of waves rolling in between the red and white twin lighthouses holds a certain magic that makes you stop and listen closely.',
        },
      ],
    },
    {
      id: '02',
      koTitle: '맨발로 걷는 하루',
      enTitle: 'Hop Step Jump',
      imageCount: 2,
      places: [
        {
          koName: '임랑해수욕장',
          enName: 'Imrang Beach',
          koDescription:
            '부산의 다른 유명 해변들에 비해 한적하고 조용하여 오롯이 바다 자체에 집중할 수 있는 공간입니다. 넓게 펼쳐진 백사장 위로 하얗게 부서지는 파도를 보고 있으면 마음이 아늑하고 평온해집니다. 특히 해 질 무렵 밀려드는 고즈넉한 빛과 파도 소리는 오래도록 깊은 여운을 남깁니다.',
          enDescription:
            'Quieter and less crowded than other famous beaches in Busan, this space allows you to focus entirely on the sea itself. Watching the white waves break over the wide sandy shore brings a sense of warmth and peace to the mind. The serene light and the sound of the waves rolling in at dusk leave a deep lasting impression.',
        },
      ],
    },
    {
      id: '04',
      koTitle: '황혼성 사냥',
      enTitle: 'Twilight hunting',
      imageCount: 4,
      places: [
        {
          koName: '황령산 봉수대',
          enName: 'Hwangnyeongsan Beacon Fire Station',
          koDescription:
            '부산의 화려한 도심과 푸른 바다를 사방으로 시원하게 내려다볼 수 있는 공간입니다. 낮에는 탁 트인 풍경으로 해방감을 주고, 해가 저물면 하나둘 불빛이 켜지며 아늑한 야경으로 변합니다. 웅장함과 서글픈 아름다움이 공존하는 장소입니다.',
          enDescription:
            'A space that offers a sweeping panoramic view of Busan’s vibrant cityscape and blue ocean. The open scenery brings a sense of liberation during the day, and as the sun goes down, it transforms into a cozy night view as the lights flicker on one by one. It is a place where grandeur and a poignant beauty coexist.',
        },
      ],
    },
  ];
  const activeLyricTrack = lyricTracks.find((track) => track.id === selectedLyricTrack) ?? lyricTracks[0];
  const activeVideoSource = trackMode === 'mv' ? videoSources.mv : videoSources.lyric[selectedLyricTrack as keyof typeof videoSources.lyric];
  const activeLyricImages = Array.from({ length: activeLyricTrack.imageCount }, (_, index) => {
    const imageNumber = index + 1;
    const src = asset(`${activeLyricTrack.id}-${imageNumber}.jpg`);
    const isTopCrop = activeLyricTrack.id === '01' && imageNumber === 4;
    const isWideCrop = isTopCrop || (activeLyricTrack.id === '04' && imageNumber <= 2);
    return {
      src,
      alt: `${locale === 'ko' ? activeLyricTrack.koTitle : activeLyricTrack.enTitle} ${imageNumber}`,
      isTopCrop,
      isWideCrop,
    };
  });
  const sceneHeight = trackArchiveDesignHeight + 832;

  if (isMobile) {
    const isLyricMode = trackMode === 'lyric';
    const mobileLyricPhotoTop = 1034;
    const mobilePhotoGridHeight = activeLyricImages.length * 258 + Math.max(activeLyricImages.length - 1, 0) * 24;
    const mobileMvPhotoTop = 1994;
    const mobileMvPhotoGridHeight = mvImages.length * 258 + Math.max(mvImages.length - 1, 0) * 24;
    const mobileSceneHeight = isLyricMode
      ? mobileLyricPhotoTop + 43 + 24 + mobilePhotoGridHeight + 48
      : mobileMvPhotoTop + 43 + 24 + mobileMvPhotoGridHeight + 48;
    const activePlaceCards = isLyricMode
      ? activeLyricTrack.places.map((place) => ({
          title: locale === 'ko' ? place.koName : place.enName,
          description: locale === 'ko' ? place.koDescription : place.enDescription,
        }))
      : pageCopy.mvPlaces;

    return (
      <main className="track-archive-mobile-page">
        <section className="track-archive-mobile-scene" style={{ minHeight: mobileSceneHeight }} aria-label="Track Archive">
          <HomeButton className="home-button-track-mobile" />

          <div className="track-archive-mobile-title">
            <span>TRACK ARCHIVE</span>
          </div>

          <nav className="track-archive-mobile-tabs" aria-label="Track archive mode">
            <button
              className={`track-archive-mobile-tab ${trackMode === 'mv' ? 'is-active' : ''}`}
              type="button"
              onClick={() => {
                setTrackMode('mv');
                setExpandedLyricImageIndex(null);
              }}
            >
              MV
            </button>
            <button
              className={`track-archive-mobile-tab ${trackMode === 'lyric' ? 'is-active' : ''}`}
              type="button"
              onClick={() => setTrackMode('lyric')}
            >
              Lyric Video
            </button>
          </nav>

          <div className="track-archive-mobile-video">
            <iframe
              src={activeVideoSource}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          {isLyricMode ? (
            <>
              <nav className="track-archive-mobile-song-list" aria-label="Lyric video tracks">
                {lyricTracks.map((track) => (
                  <button
                    className={`track-archive-mobile-wide-button ${selectedLyricTrack === track.id ? 'is-active' : ''}`}
                    type="button"
                    key={track.id}
                    onClick={() => {
                      setSelectedLyricTrack(track.id);
                      setExpandedLyricImageIndex(null);
                    }}
                  >
                    {locale === 'ko' ? track.koTitle : track.enTitle}
                  </button>
                ))}
              </nav>

              <div className="track-archive-mobile-place-list track-archive-mobile-place-list-lyric">
                {activePlaceCards.map((place) => (
                  <section className="track-archive-mobile-card" key={place.title}>
                    <h2>{place.title}</h2>
                    <p>{place.description}</p>
                  </section>
                ))}
              </div>

              <section
                className="track-archive-mobile-photo-section"
                style={{ top: mobileLyricPhotoTop }}
                aria-label="Lyric video photos"
              >
                <h2>Photo</h2>
                <div className="track-archive-mobile-photo-list">
                  {activeLyricImages.map((image, index) => (
                    <button
                      className={`track-archive-mobile-photo${image.isWideCrop ? ' is-wide-crop' : ''}${
                        image.isTopCrop ? ' is-top-crop' : ''
                      }`}
                      type="button"
                      key={image.src}
                      onClick={() => setExpandedLyricImageIndex(index)}
                    >
                      <img src={image.src} alt={image.alt} />
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="track-archive-mobile-album">
                <h2>White Record</h2>
                <div>
                  <p>
                    {pageCopy.albumTitle[0]}
                    <br />
                    {pageCopy.albumTitle[1]}
                  </p>
                  <ol>
                    {pageCopy.tracks.slice(0, 4).map((track) => (
                      <li key={track}>{track}</li>
                    ))}
                    <li>
                      {pageCopy.tracks[4]}
                      <br />
                      <span>(Inst.)</span>
                    </li>
                  </ol>
                </div>
              </section>

              <section className="track-archive-mobile-track-detail-list" aria-label="Track list">
                {pageCopy.trackDetails.map(([title, description]) => (
                  <div className="track-archive-mobile-card track-archive-mobile-track-detail" key={title}>
                    <h2>{title}</h2>
                    <p>{description}</p>
                  </div>
                ))}
              </section>

              <div className="track-archive-mobile-place-list track-archive-mobile-place-list-mv">
                {activePlaceCards.map((place) => (
                  <section className="track-archive-mobile-card" key={place.title}>
                    <h2>{place.title}</h2>
                    <p>{place.description}</p>
                  </section>
                ))}
              </div>

              <section className="track-archive-mobile-photo-section track-archive-mobile-photo-section-mv" aria-label="Music video photos">
                <h2>Photo</h2>
                <div className="track-archive-mobile-photo-list">
                  {mvImages.map((image) => (
                    <div className="track-archive-mobile-photo" key={image.src}>
                      <img src={image.src} alt={image.alt} />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {expandedLyricImageIndex !== null ? (
            <div
              className="track-photo-modal track-photo-modal-mobile"
              role="dialog"
              aria-modal="true"
              aria-label="Enlarged lyric video photo"
              onClick={() => setExpandedLyricImageIndex(null)}
            >
              <div className="track-photo-modal-window" onClick={(event) => event.stopPropagation()}>
                <div className="track-photo-modal-bar">
                  <span>Photo</span>
                  <button type="button" aria-label="Close photo" onClick={() => setExpandedLyricImageIndex(null)}>
                    <img src={asset('window-close.svg')} alt="" />
                  </button>
                </div>
                <div className="track-photo-modal-body">
                  <div className="track-photo-modal-image-frame">
                    <img
                      className={`${activeLyricImages[expandedLyricImageIndex].isWideCrop ? 'is-wide-crop' : ''}${
                        activeLyricImages[expandedLyricImageIndex].isTopCrop ? ' is-top-crop' : ''
                      }`}
                      src={activeLyricImages[expandedLyricImageIndex].src}
                      alt={activeLyricImages[expandedLyricImageIndex].alt}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="track-archive-page">
      <div
        className="track-archive-scale"
        style={{
          width: trackArchiveDesignWidth * sceneScale,
          height: sceneHeight * sceneScale,
        }}
      >
        <div
          className={`track-archive-scene${trackMode === 'lyric' ? ' is-lyric' : ''}`}
          style={{ height: sceneHeight, transform: `scale(${sceneScale})` }}
        >
          <HomeButton className="home-button-track" />

          <aside className="track-album-panel" aria-label="White Record album track list">
            {trackMode === 'lyric' ? (
              <>
                <nav className="track-lyric-song-list" aria-label="Lyric video tracks">
                  {lyricTracks.map((track) => (
                    <button
                      className={`track-sidebar-button ${selectedLyricTrack === track.id ? 'is-active' : ''}`}
                      type="button"
                      key={track.id}
                      onClick={() => {
                        setSelectedLyricTrack(track.id);
                        setExpandedLyricImageIndex(null);
                      }}
                    >
                      {locale === 'ko' ? track.koTitle : track.enTitle}
                    </button>
                  ))}
                </nav>

                <div className="track-place-list">
                  {activeLyricTrack.places.map((place) => (
                    <section className="track-place-card" key={place.koName}>
                      <h2>{locale === 'ko' ? place.koName : place.enName}</h2>
                      <p>{locale === 'ko' ? place.koDescription : place.enDescription}</p>
                    </section>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="track-sidebar-button is-active">White Record</div>
                <div className="track-sidebar-copy">
                  <p>
                    {pageCopy.albumTitle[0]}
                    <br />
                    {pageCopy.albumTitle[1]}
                  </p>
                  <ol>
                    {pageCopy.tracks.slice(0, 4).map((track) => (
                      <li key={track}>{track}</li>
                    ))}
                    <li>
                      {pageCopy.tracks[4]}
                      <br />
                      <span>(Inst.)</span>
                    </li>
                  </ol>
                </div>
                <div className="track-place-list track-place-list-mv">
                  {pageCopy.mvPlaces.map((place) => (
                    <section className="track-place-card" key={place.title}>
                      <h2>{place.title}</h2>
                      <p>{place.description}</p>
                    </section>
                  ))}
                </div>
              </>
            )}
          </aside>

          <section className="track-content" aria-label="Track Archive music video">
            <header className="track-header">
              <div className="track-title-badge">
                <span>TRACK ARCHIVE</span>
              </div>
              <nav className="track-mode-tabs" aria-label="Track archive mode">
                <button
                  className={`track-mode-button ${trackMode === 'mv' ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    setTrackMode('mv');
                    setExpandedLyricImageIndex(null);
                  }}
                >
                  MV
                </button>
                <button
                  className={`track-mode-button ${trackMode === 'lyric' ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => setTrackMode('lyric')}
                >
                  Lyric Video
                </button>
              </nav>
            </header>

            <div className="track-video-frame">
              <iframe
                src={activeVideoSource}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {trackMode === 'lyric' ? (
              <div className="track-lyric-photo-grid" aria-label="Lyric video photos">
                {activeLyricImages.map((image, index) => (
                  <button
                    className={`track-lyric-photo${image.isWideCrop ? ' is-wide-crop' : ''}${
                      image.isTopCrop ? ' is-top-crop' : ''
                    }`}
                    type="button"
                    key={image.src}
                    onClick={() => setExpandedLyricImageIndex(index)}
                  >
                    <img src={image.src} alt={image.alt} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="track-lyric-photo-grid" aria-label="Music video photos">
                {mvImages.map((image) => (
                  <div className="track-lyric-photo" key={image.src}>
                    <img src={image.src} alt={image.alt} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {expandedLyricImageIndex !== null ? (
        <div
          className="track-photo-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged lyric video photo"
          onClick={() => setExpandedLyricImageIndex(null)}
        >
          <div className="track-photo-modal-window" onClick={(event) => event.stopPropagation()}>
            <div className="track-photo-modal-bar">
              <span>Photo</span>
              <button type="button" aria-label="Close photo" onClick={() => setExpandedLyricImageIndex(null)}>
                <img src={asset('window-close.svg')} alt="" />
              </button>
            </div>
            <div className="track-photo-modal-body">
              <div className="track-photo-modal-image-frame">
                <img
                  className={`${activeLyricImages[expandedLyricImageIndex].isWideCrop ? 'is-wide-crop' : ''}${
                    activeLyricImages[expandedLyricImageIndex].isTopCrop ? ' is-top-crop' : ''
                  }`}
                  src={activeLyricImages[expandedLyricImageIndex].src}
                  alt={activeLyricImages[expandedLyricImageIndex].alt}
                />
              </div>
              {expandedLyricImageIndex > 0 ? (
                <button
                  className="track-photo-arrow track-photo-arrow-prev"
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setExpandedLyricImageIndex(expandedLyricImageIndex - 1)}
                >
                  <img src={asset('button-next.svg')} alt="" />
                </button>
              ) : null}
              {expandedLyricImageIndex < activeLyricImages.length - 1 ? (
                <button
                  className="track-photo-arrow track-photo-arrow-next"
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setExpandedLyricImageIndex(expandedLyricImageIndex + 1)}
                >
                  <img src={asset('button-next.svg')} alt="" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

type WhiteDiaryPhoto = {
  src: string;
  className: string;
  side: 'left' | 'right';
  frame?: 'polaroid';
};

type WhiteDiarySticker = {
  className: string;
  side: 'left' | 'right';
};

type WhiteDiaryCopy = {
  side: 'left' | 'right';
  className?: string;
  lines: string[];
};

type WhiteDiaryEmbed = {
  side: 'left' | 'right';
  className: string;
  src: string;
  title: string;
};

type WhiteDiaryPage = {
  copySide: 'left' | 'right';
  copyClassName?: string;
  lines: string[];
  extraCopies?: WhiteDiaryCopy[];
  photos: WhiteDiaryPhoto[];
  stickers?: WhiteDiarySticker[];
  embeds?: WhiteDiaryEmbed[];
};

const whiteDiaryPages: WhiteDiaryPage[] = [
  {
    copySide: 'left',
    lines: [
      '시골 고택에 혼자 콕 박혀서',
      '여름을 보내고 싶다는 생각을 매년 해요.',
      '',
      '마룻바닥에 누워서 매미 소리, 바람에 숲이 와르르 흔들리는 소리 같은 걸 들으며',
      '시간을 보내는 거예요.',
      '눈 깜빡이는 것 외에는 아무것도 안 하면서.',
      '',
      '그러다 밖이 어스름해지면',
      '반딧불을 보러 밤 산책을 나가고요.',
      '',
      '반디 본 적 있으세요? 저는 없거든요...',
      '기억에 없으니까 없는 게 맞을 거예요.',
    ],
    photos: [
      { src: 'white-diary-photo-forest.jpg', className: 'white-diary-photo-forest', side: 'right' },
      { src: 'white-diary-photo-glass.jpg', className: 'white-diary-polaroid-page-1', side: 'right', frame: 'polaroid' },
    ],
    stickers: [{ className: 'white-diary-tape-pink-long', side: 'right' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-2',
    lines: [
      '늘 바라는데 한 번도 그런 식으로',
      '여름을 나본 적이 없어요.',
      '',
      '그래서 만들어 보려고요.',
      '',
      '기억은 사실이 아니어도',
      '만들 수 있다고 생각해요.',
    ],
    photos: [
      { src: 'white-diary-photo-meadow.jpg', className: 'white-diary-photo-meadow', side: 'left' },
      { src: 'white-diary-photo-bubbles.jpg', className: 'white-diary-photo-bubbles', side: 'left' },
    ],
    stickers: [
      { className: 'white-diary-tape-green-meadow', side: 'left' },
      { className: 'white-diary-tape-green-bubbles', side: 'left' },
      { className: 'white-diary-tape-green-bubbles-corner', side: 'left' },
    ],
  },
  {
    copySide: 'left',
    copyClassName: 'white-diary-copy-page-3',
    lines: [
      '언젠가 바라는 대로 있을 수 있게 되면',
      '이 앨범을 틀어놓고 비교해 보고 싶어요.',
      '',
      '상상하던 거랑 비슷한가 하고.',
      '',
      '',
      '2026.  7.  31.',
    ],
    photos: [{ src: 'white-diary-photo-pond.jpg', className: 'white-diary-photo-pond', side: 'right' }],
    stickers: [
      { className: 'white-diary-tape-green-pond-top', side: 'right' },
      { className: 'white-diary-tape-green-pond-bottom', side: 'right' },
    ],
  },
  {
    copySide: 'left',
    copyClassName: 'white-diary-copy-page-4',
    lines: [
      '안녕하세요.',
      ' ',
      '첫 EP라니 정말이지 감개가 무량합니다.',
      '몇 년 전까지만 해도 이런 날이 올 줄은',
      '몰랐...다는 말은 농담으로도 못 하겠고요.',
      '이런 날이 올 줄은 알고 있었죠 계속 음악을 해야겠다고 생각하며 살았으니까요~',
      '',
      '그런데도 지금이 유달리',
      '특별하게 느껴지는 건 대체 왜일까 싶습니다.',
      '두 번째, 세 번째에는 덜 특별할까요?',
      '그렇지도 않을 것 같은데.',
    ],
    photos: [],
    embeds: [{ side: 'right', className: 'white-diary-shorts-right-page-4', src: 'https://www.youtube.com/embed/BS-2oZrYJng', title: '간질간질 #shorts' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-5',
    lines: [
      '취향은 자주 바뀌잖아요.',
      '저는 파란색을 좋아했었는데, 지금은 초록이 더 좋아요. 밀크티를 싫어했었는데 좋아하게 됐고. 또 봄은 늘상 싫어요. 바람 한 번에 재채기를 열 번쯤 하게 돼서요...ㅋㅋㅋ',
      '봄볕도 왠지 속이 메슥거려서 별로던데요.',
      '',
      '한결같이 좋아하는 것도 많아요.',
      '그중 하나가 ‘영원’이에요. 그 말이 좋아요.',
    ],
    photos: [{ src: 'white-diary-photo-rivergrass.jpg', className: 'white-diary-photo-rivergrass', side: 'right' }],
    stickers: [{ className: 'white-diary-tape-gold-rivergrass', side: 'right' }],
    embeds: [{ side: 'left', className: 'white-diary-shorts-left', src: 'https://www.youtube.com/embed/JARChWvPmUo', title: '고양이 #shorts' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-6-right',
    lines: [
      '또 처음부터 완전한 걸 좋아하면 편할 텐데 하고 오만한 생각도 했어요 ㅋㅋㅋ',
      '막상 그러면 또 눈길이 안 가는 걸',
      '알면서도요. 이렇게 써 놓으니 제가 무슨',
      '약하고 불완전한 것만 사랑하는',
      '취향 고약한 사람으로 비칠까 걱정도 되는데',
      '그렇지도 않아요... 그렇게 보일 뿐이지 사실 강하더라고요. 걱정 따위는 필요 없을 만큼. 그러니까 불안하다고 생각한 건 전부 다',
      '제 착각이었던 거죠.',
    ],
    extraCopies: [
      {
        side: 'left',
        className: 'white-diary-copy-page-6-left',
        lines: [
          '영원을 믿으세요? 전 믿고 싶은 쪽이에요.',
          '믿는지, 안 믿는지만 따지면 어느 쪽인지',
          '솔직히 모르겠어요.',
          '그동안은 왜 믿고 싶은지도 잘 몰랐고요.',
          '',
          '어젯밤에 생각을 해 봤거든요?',
          '불 꺼진 방 침대 위에 가만히 누워서요.',
          '생각해 봤는데, 애정이 있어서 믿고 싶었나 봐요. 좋아서. 그런데 뭐가 됐든 제가 좋아하는 건 다 언젠가는 스러질 것 같이 보이더라고요.',
          '',
          '그게 무서워서 영원이 있다고 믿고 싶었나',
          '봐요. 그런다고 없는 게 있게 되고',
          '있는 게 없어지지 않을 텐데.',
        ],
      },
    ],
    photos: [{ src: 'white-diary-photo-branches.jpg', className: 'white-diary-photo-branches', side: 'right' }],
    stickers: [{ className: 'white-diary-tape-gold-branches', side: 'right' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-7-right',
    lines: [
      '저도 알죠. 사람이 꿈속에 살 수 없다는 걸. 숨만 쉬어도 해야 할 일이 턱턱 주어지는',
      '현실이잖아요.',
      '주어진다? 던져진다는 표현이 더 맞겠어요.',
      '',
      '아무튼 지금 것만 해도 머리 아파 죽겠는데 다음에는 뭘 해야 하고, 내년에는,',
      '십 년 뒤에는 어쩌고 저쩌고...',
    ],
    extraCopies: [
      {
        side: 'left',
        className: 'white-diary-copy-page-7-left',
        lines: [
          '하고 싶은 일만 하며 살 수 있으면 얼마나',
          '좋을까. 이것도 매번 하는 생각 중 하난데, 어른들은 그럴 수 없다고 그러잖아요.',
          '어떻게 좋아하는 일만 하며 살겠냐면서.',
          '',
          '정말 그런가? 그렇게 생각하세요? 제가 아직 덜 자라 반발심이라도 있는 건진 모르겠지만 왜 그럴 수 없겠어요?',
          '',
        ],
      },
    ],
    photos: [
      { src: 'white-diary-photo-water.jpg', className: 'white-diary-photo-water', side: 'left' },
      { src: 'white-diary-photo-curtain.jpg', className: 'white-diary-photo-curtain', side: 'right' },
    ],
    stickers: [
      { className: 'white-diary-tape-pink-water-left', side: 'left' },
      { className: 'white-diary-tape-pink-water-right', side: 'left' },
      { className: 'white-diary-tape-pink-curtain', side: 'right' },
    ],
  },
  {
    copySide: 'left',
    copyClassName: 'white-diary-copy-page-8',
    lines: [
      '그래도 선택지가 점점 더 늘어나서 언젠가 정말 싫은 건 고르지 않아도 되는 날이 오면 좋겠어요. 선택지가 하나밖에 없으면 그게 정말 정말 싫어도 고를 수밖에 없잖아요.',
      '아니면 멈추거나. 멈추는 것도 선택인가요. 무튼 전 그런 걸 받아들이기 싫다고요...',
      '',
      '그러니까 제가 하고 싶은 말은 딸기 케이크에 딸기만, 새우 파스타의 새우만 쏙쏙 뽑아먹는 그런 삶이 아니더라도 다들 정말 못 견디겠는 건 안 하며 살 수 있으면 좋겠다, 그 말이에요. 그럼 서로 미워하고 할퀼 일도 줄어들지 않겠어요. 그렇게 세계 평화,',
      '우주 평화가 이루어지고.',
      '',
      '가당찮은 소리죠? 압니다...',
    ],
    photos: [],
    embeds: [{ side: 'right', className: 'white-diary-shorts-right-page-8', src: 'https://www.youtube.com/embed/Y55GEgkmuS8', title: '누 #shorts' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-9-right',
    lines: [
      '그래도 소화하는 방법이 하나 더 생긴 셈이니 좋은 거죠. 이 태도가 오래 가주면 좋으련만.',
      '',
      '바람 중 하나인데 저는 제가 좀 덜 급하게',
      '살면 좋겠어요. 지레 겁먹는 것도 그만 좀',
      '하고. 근데 이렇게 스스로를 다그쳐봤자',
      '좋을 게 없겠죠? 이것도 제 욕심일까요.',
      '',
      '그럼 그냥 받아들여야 하나.',
      '그러긴 또 싫은데.',
    ],
    extraCopies: [
      {
        side: 'left',
        className: 'white-diary-copy-page-9-left',
        lines: [
          '저는 욕심이 정말 많은데, 감사하게도 지금은 그 욕심을 어느 정도 선까지는 해소하며 살고 있는 것 같아요. 일단 지금은요.',
          '',
          '내일은 또 어떻게 될지 모르겠네요.',
          '열망이란 말 없이는 제 인생을 설명할 수가',
          '없어요. 당연히 부러진 적도 많고, 잃은 것도 많은데 이제는 이유가 있었겠거니 생각하게 됐어요. 늘 그런 식으로 포장하지는 않고요,,',
          '',
        ],
      },
    ],
    photos: [{ src: 'white-diary-photo-sun-tree.jpg', className: 'white-diary-photo-sun-tree', side: 'left' }],
    stickers: [{ className: 'white-diary-tape-blue-sun-tree', side: 'left' }],
  },
  {
    copySide: 'right',
    copyClassName: 'white-diary-copy-page-10',
    lines: [
      '아주 멀리까지 가고 싶어요.',
      '모르는 게 너무 많아요.',
      '다 알고 싶지는 않은데 평생을 헤매더라도 다 알게 될 리 없고... 단정 짓지 말까요?',
      '',
      '이 글을 쓰고 있는 지금은 6월 22일입니다. 한동안 쭉 더웠는데, 요 며칠 비가 오더니 오늘은 또 서늘하네요. 더위 조심하시고, 냉방병 조심하시고. 덥지 않은 계절을 지나고 계시면 다른 걸 조심하시고요.',
      '',
      '가령... 뭘... 그래 건강을 챙기세요!',
      '건강해야 뭐든 할 수 있잖아요. 여유 될 때 제 노래도 들어주시면 더 더 좋고요 ㅋㅋㅋ',
      '',
      '긴 글 읽어주셔서 감사합니다.',
      '이만 줄일게요. 또 봐요!',
    ],
    photos: [
      { src: 'white-diary-photo-forest-wide.jpg', className: 'white-diary-photo-forest-wide', side: 'left' },
      { src: 'white-diary-photo-window-vine.jpg', className: 'white-diary-photo-window-vine', side: 'left' },
    ],
    stickers: [
      { className: 'white-diary-tape-green-forest-wide', side: 'left' },
      { className: 'white-diary-tape-green-window-left', side: 'left' },
      { className: 'white-diary-tape-green-window-right', side: 'left' },
    ],
  },
];

const whiteDiaryEnglishLines: Array<{ lines: string[]; extraCopies?: string[][] }> = [
  {
    lines: [
      'Every year, I find myself wishing',
      'I could just hide away all summer',
      'in an old countryside house.',
      '',
      'I picture myself',
      'lying on the wooden floor,',
      'passing the time',
      'listening to the hum of cicadas',
      'and the rush of the wind',
      'shaking through the forest.',
      'Doing nothing but blinking.',
      '',
      'Then, as twilight falls,',
      'I’d head out for a night walk',
      'to spot fireflies.',
      '',
      'Have you ever seen a firefly?',
      "I haven't.",
      'Or at least, I have no memory of it,',
      "which pretty much means I haven't.",
    ],
  },
  {
    lines: [
      'It’s something I always dream of,',
      'yet I’ve never',
      'spent a summer that way.',
      '',
      'So, I decided to create it.',
      '',
      'Even if it’s not based on a fact,',
      'I believe a memory is something',
      'you can build.',
    ],
  },
  {
    lines: [
      'If the day comes when I',
      'finally get to be in that place',
      'just as I’ve always wanted,',
      'I’d love to put this album on',
      'and compare.',
      '',
      'To see',
      'if it’s anything like I imagined.',
      '',
      '',
      '2026. 7. 31.',
    ],
  },
  {
    lines: [
      'Hello.',
      '',
      'I’m truly overwhelmed with emotion',
      'to finally release my first EP.',
      'If I were to say that, even just a',
      'few years ago, I never imagined',
      'this day would come...',
      'Well, I couldn’t say that',
      'even as a joke. I always knew',
      'this day would come, because I’ve',
      'spent my whole life thinking,',
      '"I have to keep making music"~',
      '',
      'Yet, I find myself wondering why',
      'this moment feels so exceptionally',
      'special. Will the second or third EP',
      'feel any less special?',
      "I don't think so, either.",
    ],
  },
  {
    lines: [
      "Taste changes so often, doesn't it?",
      'I used to love the color blue,',
      'but now I prefer green.',
      'I used to hate milk tea, but now',
      'I’ve grown to love it.',
      'And I always dislike spring.',
      'Just a single gust of wind makes me',
      'sneeze about ten times... haha',
      'And for some reason,',
      'the spring sunlight makes me feel',
      'a bit nauseous, so I’m not a fan.',
      '',
      'But there are also many things',
      'I love unconditionally.',
      'One of them is the word ‘eternity’.',
      'I just love that word.',
    ],
  },
  {
    lines: [
      'I even had the arrogant thought,',
      '"It would be so much easier if I',
      'just liked things that were',
      'perfect from the very start", haha',
      'Even though I know myself well enough',
      'to know that if they were perfect,',
      'they wouldn’t catch my eye in the first place.',
      'Writing it out like this makes me worry',
      'that I might seem like someone with a',
      'twisted taste who only loves weak and',
      "imperfect things, but that's",
      'not it at all...',
      'They just appear that way,',
      'but they are actually strong.',
      'Strong enough to need none of my worries.',
      'So, thinking that they were fragile was',
      'completely my own misconception.',
    ],
    extraCopies: [
      [
        'Do you believe in eternity?',
        "I'm on the side that wants to",
        'believe in it. If you ask me whether',
        'I actually believe in it or not,',
        "honestly, I don't know. And until",
        "recently, I didn't really know why",
        'I wanted to believe in it so badly,',
        'either.',
        '',
        'Last night, I gave it some thought.',
        'Just lying quietly on my bed',
        'in a dark room. And it hit me—I think',
        'I wanted to believe in it',
        'out of affection. Because I loved',
        'those things. But whatever it was,',
        'everything I loved seemed as though',
        'it would crumble away someday.',
        '',
        "Maybe that scared me, and that's why",
        'I wanted to believe that eternity exists.',
        'Not that believing would make something',
        'out of nothing, or keep what is',
        'already there from disappearing.',
      ],
    ],
  },
  {
    lines: [
      'I know it too. That a person can’t live',
      'inside a dream. We live in a reality',
      'where things you just have to do are',
      'constantly handed down to you, the moment',
      'you take a breath.',
      'Handed down? No, "thrown at you" would',
      'probably be a better way to put it.',
      '',
      'Anyway, dealing with what’s in front of me',
      'right now is already giving me a massive',
      'headache, but then people go on about',
      'what you need to do next,',
      'what about next year,',
      'what about ten years from now,',
      'blah blah blah...',
    ],
    extraCopies: [
      [
        'How wonderful would it be if we could',
        'live our lives doing only what we want',
        'to do?',
        'This is another thought I have all the',
        'time, but adults always say that’s',
        'impossible. They ask,',
        '"How can anyone live doing only',
        'the things they like?"',
        '',
        'Is that really true?',
        "Do you think so too? Maybe it's just",
        'my childish rebelliousness showing,',
        'but I mean,',
        "why shouldn't we be able to?",
      ],
    ],
  },
  {
    lines: [
      'Still, I hope that as choices expand',
      'over time, a day will come when we',
      "genuinely don't have to choose the things",
      'we absolutely hate. If there’s only one',
      'option, you have no choice but to pick it,',
      'even if you utterly detest it.',
      'Either that, or you stop.',
      'Is stopping a choice too?',
      'Either way, I just hate accepting things',
      'like that...',
      '',
      "So, what I'm trying to say is—even if it's",
      'not a life where we can just pick out',
      'the strawberries from a strawberry cake',
      'or the shrimp from a shrimp pasta',
      '—I hope everyone can live without having',
      'to do the things they truly cannot stand.',
      "Wouldn't that mean less hating and",
      'scratching at one another? And that’s how',
      'we achieve world peace,',
      'or even universe peace.',
      '',
      'Sounds ridiculous, right?',
      'I know...',
    ],
  },
  {
    lines: [
      'Still, it means I’ve gained one more way',
      'to process things, so I guess that’s a',
      'good thing. I just hope this attitude',
      'sticks around for a long time.',
      '',
      'If I were to name one of my wishes,',
      'it’s that I’d live my life with a bit',
      'less urgency. And maybe stop',
      'getting scared over nothing.',
      'But then again, there’s probably no point',
      'in pushing myself like this, right?',
      'I wonder if even this is just me being greedy.',
      '',
      'Then should I just accept it?',
      'But I really hate the thought of',
      'doing that, too.',
    ],
    extraCopies: [
      [
        'I am a deeply greedy person,',
        "but thankfully, I feel like I'm currently",
        'living my life satisfying that greed',
        'to a certain degree. At least for now.',
        '',
        'I have no idea what tomorrow will bring,',
        'though. I cannot explain my life without',
        "using the word 'aspiration.' Naturally,",
        "I've broken down many times and lost",
        'a lot along the way, but now I’ve come',
        'to think that there must have been',
        'a reason for it all. Though,',
        "I don't always try to",
        'sugarcoat it like that,,',
      ],
    ],
  },
  {
    lines: [
      'I want to go somewhere very far away.',
      "There is still so much I don't know.",
      "I don't necessarily want to know everything,",
      "and even if I wander my whole life, there's",
      "no way I'd ever figure it all out anyway...",
      'So maybe',
      "I shouldn't jump to conclusions?",
      '',
      "As I write this, it's June 22nd.",
      'It had been hot for a while, but after a',
      'few days of rain, it’s quite chilly today.',
      'Watch out for the heat,',
      'be careful not to catch a cold from the AC,',
      "and if you're passing through a season",
      "that isn't hot, please be careful",
      'of other things.',
      '',
      'Like... what... well, take care of your health!',
      'You have to be healthy to do anything, right?',
      'And if you have the time,',
      'it would be even better if you listened',
      'to my songs ˘◡˘',
      '',
      'Thank you for reading this long letter.',
      "I'll wrap it up here.",
      'See you again!',
    ],
  },
];

const whiteDiaryMobileKoreanLines: Record<string, string[]> = {
  '0-left': [
    '시골 고택에 혼자 콕 박혀서',
    '여름을 보내고 싶다는 생각을',
    '매년 해요.',
    '',
    '마룻바닥에 누워서 매미 소리, 바람에',
    '숲이 와르르 흔들리는 소리 같은 걸',
    '들으며 시간을 보내는 거예요. 눈 깜빡',
    '이는 것 외에는 아무것도 안 하면서.',
    '',
    '그러다 밖이 어스름해지면',
    '반딧불을 보러 밤 산책을 나가고요.',
    '',
    '반디 본 적 있으세요? 저는 없거든요...',
    '기억에 없으니까 없는 게 맞을 거예요.',
  ],
  '1-right': [
    '늘 바라는데 한 번도 그런 식으로',
    '여름을 나본 적이 없어요.',
    '',
    '그래서 만들어 보려고요.',
    '',
    '기억은 사실이 아니어도',
    '만들 수 있다고 생각해요.',
  ],
  '2-left': [
    '언젠가 바라는 대로 있을 수 있게 되면',
    '이 앨범을 틀어놓고 비교해 보고',
    '싶어요.',
    '',
    '상상하던 거랑 비슷한가 하고.',
    '',
    '',
    '2026.  7.  31.',
  ],
  '3-left': [
    '안녕하세요.',
    ' ',
    '첫 EP라니 정말이지 감개가 무량합니다.',
    '몇 년 전까지만 해도 이런 날이 올 줄은',
    '몰랐...다는 말은 농담으로도',
    '못 하겠고요.',
    '이런 날이 올 줄은 알고 있었죠',
    '계속 음악을 해야겠다고 생각하며',
    '살았으니까요~',
    '',
    '그런데도 지금이 유달리 특별하게',
    '느껴지는 건 대체 왜일까 싶습니다.',
    '두 번째, 세 번째에는 덜 특별할까요?',
    '그렇지도 않을 것 같은데.',
  ],
  '4-right': [
    '취향은 자주 바뀌잖아요.',
    '저는 파란색을 좋아했었는데,',
    '지금은 초록이 더 좋아요.',
    '밀크티를 싫어했었는데 좋아하게 됐고. 또 봄은 늘상 싫어요. 바람 한 번에',
    '재채기를 열 번쯤 하게 돼서요...ㅋㅋㅋ',
    '봄볕도 왠지 속이 메슥거려서',
    '별로던데요.',
    '',
    '한결같이 좋아하는 것도 많아요.',
    '그중 하나가 ‘영원’이에요.',
    '그 말이 좋아요.',
  ],
  '5-left': [
    '영원을 믿으세요?',
    '전 믿고 싶은 쪽이에요. 믿는지,',
    '안 믿는지만 따지면 어느 쪽인지 솔직히 모르겠어요. 그동안은 왜 믿고 싶은지도',
    '잘 몰랐고요.',
    '',
    '어젯밤에 생각을 해 봤거든요?',
    '불 꺼진 방 침대 위에 가만히 누워서요.',
    '생각해 봤는데, 애정이 있어서',
    '믿고 싶었나 봐요. 좋아서. 그런데',
    '뭐가 됐든 제가 좋아하는 건 다',
    '언젠가는 스러질 것 같이 보이더라고요.',
    '',
    '그게 무서워서 영원이 있다고',
    '믿고 싶었나 봐요.',
    '',
  ],
  '5-right': [
    '그런다고 없는 게 있게 되고',
    '있는 게 없어지지 않을 텐데.',
    '',
    '또 처음부터 완전한 걸 좋아하면',
    '편할 텐데 하고 오만한 생각도',
    '했어요 ㅋㅋㅋ막상 그러면 또 눈길이 안 가는 걸 알면서도요.',
    '',
    '이렇게 써 놓으니 제가 무슨 약하고 불완전한 것만 사랑하는 취향 고약한 사람으로 비칠까 걱정도 되는데',
    '그렇지도 않아요... 그렇게 보일',
    '뿐이지 사실 강하더라고요. 걱정',
    '따위는 필요 없을 만큼. 그러니까',
    '불안하다고 생각한 건 전부 다',
    '제 착각이었던 거죠.',
  ],
  '6-left': [
    '하고 싶은 일만 하며 살 수 있으면',
    '얼마나 좋을까. 이것도 매번 하는 생각 중 하난데, 어른들은 그럴 수 없다고',
    '그러잖아요. 어떻게 좋아하는 일만 하며 살겠냐면서.',
    '',
    '정말 그런가? 그렇게 생각하세요?',
    '제가 아직 덜 자라 반발심이라도',
    '있는 건진 모르겠지만 왜 그럴 수',
    '없겠어요?',
    '',
  ],
  '6-right': [
    '저도 알죠. 사람이 꿈속에 살 수 없다는 걸. 숨만 쉬어도 해야 할 일이 턱턱 주어지는 현실이잖아요.',
    '주어진다? 던져진다는 표현이',
    '더 맞겠어요.',
    '',
    '아무튼 지금 것만 해도 머리 아파',
    '죽겠는데 다음에는 뭘 해야 하고,',
    '내년에는, 십 년 뒤에는',
    '어쩌고 저쩌고... ',
  ],
  '7-left': [
    '그래도 선택지가 점점 더 늘어나서',
    '언젠가 정말 싫은 건 고르지 않아도',
    '되는 날이 오면 좋겠어요. 선택지가',
    '하나밖에 없으면 그게 정말 정말 싫어도 고를 수밖에 없잖아요.',
    '아니면 멈추거나. 멈추는 것도',
    '선택인가요. 무튼 전 그런 걸',
    '받아들이기 싫다고요...',
    '그러니까 제가 하고 싶은 말은',
    '딸기 케이크에 딸기만, 새우 파스타의 새우만 쏙쏙 뽑아먹는 그런 삶이',
    '아니더라도 다들 정말 못 견디겠는 건 안 하며 살 수 있으면 좋겠다,',
    '그 말이에요. 그럼 서로 미워하고',
    '할퀼 일도 줄어들지 않겠어요. 그렇게 세계 평화, 우주 평화가 이루어지고.',
    '가당찮은 소리죠? 압니다...',
  ],
  '8-left': [
    '저는 욕심이 정말 많은데, 감사하게도 지금은 그 욕심을 어느 정도 선까지는 해소하며 살고 있는 것 같아요.',
    '일단 지금은요.',
    '',
    '내일은 또 어떻게 될지 모르겠네요.',
    '열망이란 말 없이는 제 인생을',
    '설명할 수가 없어요.',
    '당연히 부러진 적도 많고, 잃은 것도',
    '많은데 이제는 이유가 있었겠거니',
    '생각하게 됐어요. 늘 그런 식으로',
    '포장하지는 않고요,,',
    '',
  ],
  '8-right': [
    '그래도 소화하는 방법이 하나 더',
    '생긴 셈이니 좋은 거죠. 이 태도가 오래 가주면 좋으련만.',
    '',
    '바람 중 하나인데 저는 제가 좀',
    '덜 급하게 살면 좋겠어요. 지레',
    '겁먹는 것도 그만 좀 하고.',
    '근데 이렇게 스스로를 다그쳐봤자',
    '좋을 게 없겠죠?',
    '이것도 제 욕심일까요.',
    '',
    '그럼 그냥 받아들여야 하나.',
    '그러긴 또 싫은데.',
  ],
  '9-right': [
    '아주 멀리까지 가고 싶어요.',
    '모르는 게 너무 많아요.',
    '다 알고 싶지는 않은데 평생을',
    '헤매더라도 다 알게 될 리 없고...',
    '단정 짓지 말까요?',
    '',
    '이 글을 쓰고 있는 지금은 6월 22일',
    '입니다. 한동안 쭉 더웠는데, 요 며칠 비가 오더니 오늘은 또 서늘하네요.',
    '더위 조심하시고, 냉방병 조심하시고. 덥지 않은 계절을 지나고 계시면',
    '다른 걸 조심하시고요.',
    '',
    '',
  ],
  '9-right-final': [
    '가령... 뭘... 그래 건강을',
    '챙기세요!',
    '건강해야 뭐든 할 수 있잖아요.',
    '여유 될 때 제 노래도 들어주시면',
    '더 더 좋고요 ㅋㅋㅋ',
    '',
    '긴 글 읽어주셔서 감사합니다.',
    '이만 줄일게요. 또 봐요!',
  ],
};

type WhiteDiaryArchivePageProps = {
  locale: Locale;
};

function WhiteDiaryArchivePage({ locale }: WhiteDiaryArchivePageProps) {
  const [sceneScale, setSceneScale] = useState(1);
  const [diaryPage, setDiaryPage] = useState(0);
  const [mobileDiaryPage, setMobileDiaryPage] = useState(0);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev'>('next');
  const isMobile = useIsMobileViewport();
  const [pageTransition, setPageTransition] = useState<{
    direction: 'next' | 'prev';
    nextPage: number;
    showIncomingSide: boolean;
    hideStableSide: boolean;
  } | null>(null);

  useEffect(() => {
    const updateScale = () => {
      setSceneScale(
        Math.min(window.innerWidth / whitePagesDesignWidth, window.innerHeight / whitePagesDesignHeight, 1) *
          whitePagesFitRatio,
      );
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const turnDiaryPage = (direction: 1 | -1) => {
    const nextPage = Math.min(Math.max(diaryPage + direction, 0), whiteDiaryPages.length - 1);
    if (nextPage === diaryPage || isPageTurning) return;

    setTurnDirection(direction > 0 ? 'next' : 'prev');
    setPageTransition({ direction: direction > 0 ? 'next' : 'prev', nextPage, showIncomingSide: false, hideStableSide: false });
    setIsPageTurning(true);
    window.setTimeout(() => {
      setPageTransition({ direction: direction > 0 ? 'next' : 'prev', nextPage, showIncomingSide: true, hideStableSide: true });
    }, 260);
    window.setTimeout(() => {
      setDiaryPage(nextPage);
      setPageTransition(null);
      setIsPageTurning(false);
    }, 560);
  };

  const renderDiaryContent = (page: WhiteDiaryPage, pageIndex: number, visibleSides: Array<'left' | 'right'>) => (
    <>
      {[{ side: page.copySide, className: page.copyClassName, lines: page.lines }, ...(page.extraCopies ?? [])]
        .filter((copyBlock) => visibleSides.includes(copyBlock.side))
        .map((copyBlock, copyIndex) => (
          <div
            className={`white-diary-copy ${locale === 'en' ? 'is-en' : ''} ${copyBlock.className ?? ''}`}
            key={`copy-${pageIndex}-${copyBlock.side}-${copyIndex}`}
          >
            {(locale === 'en'
              ? copyIndex === 0
                ? whiteDiaryEnglishLines[pageIndex]?.lines
                : whiteDiaryEnglishLines[pageIndex]?.extraCopies?.[copyIndex - 1]
              : copyBlock.lines
            )?.map((line, index) => (
              <p key={`${pageIndex}-${copyIndex}-${index}`}>{line || '\u00a0'}</p>
            ))}
          </div>
        ))}

      {page.photos
        .filter((photo) => visibleSides.includes(photo.side))
        .map((photo) =>
          photo.frame === 'polaroid' ? (
            <div className={`white-diary-polaroid ${photo.className}`} key={`photo-${pageIndex}-${photo.className}`}>
              <div className="white-diary-polaroid-photo">
                <img src={asset(photo.src)} alt="" />
              </div>
            </div>
          ) : (
            <div className={`white-diary-photo ${photo.className}`} key={`photo-${pageIndex}-${photo.className}`}>
              <img src={asset(photo.src)} alt="" />
            </div>
          ),
        )}

      {page.stickers
        ?.filter((sticker) => visibleSides.includes(sticker.side))
        .map((sticker) => (
          <span className={`white-diary-sticker ${sticker.className}`} aria-hidden="true" key={`sticker-${pageIndex}-${sticker.className}`} />
        ))}

      {page.embeds
        ?.filter((embed) => visibleSides.includes(embed.side))
        .map((embed) => (
          <div className={`white-diary-shorts ${embed.className}`} key={`embed-${pageIndex}-${embed.className}`}>
            <iframe
              width="409"
              height="727"
              src={embed.src}
              title={embed.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ))}
    </>
  );

  const clickedSide = pageTransition?.direction === 'prev' ? 'left' : 'right';
  const stableSide = pageTransition?.direction === 'prev' ? 'right' : 'left';

  if (isMobile) {
    const inlineMobileMedia: Record<
      string,
      {
        photos?: string[];
        stickers?: string[];
        embeds?: string[];
      }
    > = {
      '4-right': {
        photos: ['white-diary-photo-rivergrass'],
        stickers: ['white-diary-tape-gold-rivergrass'],
      },
      '6-left': {
        photos: ['white-diary-photo-water'],
        stickers: ['white-diary-tape-pink-water-left', 'white-diary-tape-pink-water-right'],
      },
      '6-right': {
        photos: ['white-diary-photo-curtain'],
        stickers: ['white-diary-tape-pink-curtain'],
      },
      '8-left': {
        photos: ['white-diary-photo-sun-tree'],
        stickers: ['white-diary-tape-blue-sun-tree'],
      },
      '9-right': {
        photos: ['white-diary-photo-forest-wide'],
        stickers: ['white-diary-tape-green-forest-wide'],
      },
      '9-right-final': {
        photos: ['white-diary-photo-window-vine'],
        stickers: ['white-diary-tape-green-window-left', 'white-diary-tape-green-window-right'],
      },
    };
    const inlinePhotoClasses = new Set(Object.values(inlineMobileMedia).flatMap((entry) => entry.photos ?? []));
    const inlineStickerClasses = new Set(Object.values(inlineMobileMedia).flatMap((entry) => entry.stickers ?? []));
    const inlineEmbedClasses = new Set(Object.values(inlineMobileMedia).flatMap((entry) => entry.embeds ?? []));
    const skippedMobilePhotoClasses = new Set(['white-diary-photo-branches']);
    const skippedMobileStickerClasses = new Set(['white-diary-tape-gold-branches']);
    type MobileDiaryEntry =
      | { kind: 'copy'; pageIndex: number; copyBlock: WhiteDiaryCopy; copyKey: string }
      | { kind: 'media'; pageIndex: number; side: 'left' | 'right' };
    const mobileEntries = whiteDiaryPages.flatMap<MobileDiaryEntry>((page, pageIndex) => {
      const copyBlocks = [
        { side: page.copySide, className: page.copyClassName, lines: page.lines },
        ...(page.extraCopies ?? []),
      ].sort((a, b) => (a.side === b.side ? 0 : a.side === 'left' ? -1 : 1));
      const copyEntries = copyBlocks.flatMap<MobileDiaryEntry>((copyBlock) => {
        const copyKey = `${pageIndex}-${copyBlock.side}`;
        if (copyKey === '9-right') {
          return [
            { kind: 'copy' as const, pageIndex, copyBlock, copyKey: '9-right' },
            { kind: 'copy' as const, pageIndex, copyBlock, copyKey: '9-right-final' },
          ];
        }
        return [{ kind: 'copy' as const, pageIndex, copyBlock, copyKey }];
      });
      const mediaSides = (['left', 'right'] as const).filter((side) => {
        const hasStandaloneMedia =
          page.photos.some((photo) => photo.side === side && !inlinePhotoClasses.has(photo.className) && !skippedMobilePhotoClasses.has(photo.className)) ||
          (page.stickers ?? []).some((sticker) => sticker.side === side && !inlineStickerClasses.has(sticker.className) && !skippedMobileStickerClasses.has(sticker.className)) ||
          (page.embeds ?? []).some((embed) => embed.side === side && !inlineEmbedClasses.has(embed.className));
        return hasStandaloneMedia;
      });

      return [
        ...copyEntries,
        ...mediaSides.map((side) => ({ kind: 'media' as const, pageIndex, side })),
      ];
    });
    const mobileTotalPages = mobileEntries.length;
    const mobileEntry = mobileEntries[Math.min(mobileDiaryPage, mobileTotalPages - 1)];
    const mobileSpreadIndex = mobileEntry.pageIndex;
    const mobileSide: 'left' | 'right' = mobileDiaryPage % 2 === 0 ? 'left' : 'right';
    const mobilePage = whiteDiaryPages[mobileSpreadIndex];
    const mobileCopies = mobileEntry.kind === 'copy' ? [mobileEntry.copyBlock] : [];
    const contentSide = mobileEntry.kind === 'copy' ? mobileEntry.copyBlock.side : mobileEntry.side;
    const inlineMedia = mobileEntry.kind === 'copy' ? inlineMobileMedia[mobileEntry.copyKey] : undefined;
    const mobilePhotos =
      mobileEntry.kind === 'copy'
        ? mobilePage.photos.filter((photo) => inlineMedia?.photos?.includes(photo.className))
        : mobilePage.photos.filter((photo) => photo.side === contentSide && !inlinePhotoClasses.has(photo.className) && !skippedMobilePhotoClasses.has(photo.className));
    const mobileStickers =
      mobileEntry.kind === 'copy'
        ? (mobilePage.stickers ?? []).filter((sticker) => inlineMedia?.stickers?.includes(sticker.className))
        : (mobilePage.stickers ?? []).filter((sticker) => sticker.side === contentSide && !inlineStickerClasses.has(sticker.className) && !skippedMobileStickerClasses.has(sticker.className));
    const mobileEmbeds =
      mobileEntry.kind === 'copy'
        ? (mobilePage.embeds ?? []).filter((embed) => inlineMedia?.embeds?.includes(embed.className))
        : (mobilePage.embeds ?? []).filter((embed) => embed.side === contentSide && !inlineEmbedClasses.has(embed.className));
    const changeMobileDiaryPage = (nextPage: number) => {
      setMobileDiaryPage(nextPage);
      scrollToPageTop();
    };

    return (
      <main className="white-diary-mobile-page">
        <section className={`white-diary-mobile-scene is-${mobileSide} mobile-diary-spread-${mobileSpreadIndex}`} aria-label="White Diary">
          <HomeButton className="home-button-white-diary-mobile" variant={mobileSide === 'left' ? 'light' : 'dark'} />

          <div className="white-diary-mobile-lp" aria-hidden="true">
            <img src={asset('white-diary-lp-a.png')} alt="" />
            <img src={asset('white-diary-lp-b.png')} alt="" />
          </div>

          <img className="white-diary-mobile-book" src={asset('white-diary-book.png')} alt="" />
          <div className="white-diary-mobile-paper">
            <img src={asset('white-diary-paper.png')} alt="" />
          </div>

          <div className="white-diary-mobile-title">
            <span>WHITE DIARY</span>
          </div>

          {mobileSide === 'left' ? <img className="white-diary-mobile-tape" src={asset('white-diary-tape.png')} alt="" /> : null}
          {mobileSide === 'right' ? (
            <>
              <div className="white-diary-mobile-pencil">
                <img src={asset('white-diary-pencil.png')} alt="" />
              </div>
              <div className="white-diary-mobile-pen">
                <img src={asset('white-diary-pen.png')} alt="" />
              </div>
              <div className="white-diary-mobile-eraser">
                <img src={asset('white-diary-eraser.png')} alt="" />
              </div>
            </>
          ) : null}

          {mobileCopies.map((copyBlock, copyIndex) => (
            <div className={`white-diary-mobile-copy ${locale === 'en' ? 'is-en' : ''}`} key={`mobile-copy-${mobileSpreadIndex}-${copyIndex}`}>
              {(locale === 'en'
                ? copyIndex === 0
                  ? whiteDiaryEnglishLines[mobileSpreadIndex]?.lines
                  : whiteDiaryEnglishLines[mobileSpreadIndex]?.extraCopies?.[copyIndex - 1]
                : copyIndex === 0
                  ? whiteDiaryMobileKoreanLines[mobileEntry.kind === 'copy' ? mobileEntry.copyKey : `${mobileSpreadIndex}-${copyBlock.side}`] ?? copyBlock.lines
                  : copyBlock.lines
              )?.map((line, index) => (
                <p key={`mobile-copy-line-${mobileSpreadIndex}-${copyIndex}-${index}`}>{line || '\u00a0'}</p>
              ))}
            </div>
          ))}

          <div className={`white-diary-mobile-media white-diary-mobile-media-${mobilePhotos.length}`}>
            {mobilePhotos.map((photo) =>
              photo.frame === 'polaroid' ? (
                <div className={`white-diary-mobile-polaroid ${photo.className}`} key={`mobile-photo-${mobileSpreadIndex}-${photo.className}`}>
                  <div>
                    <img src={asset(photo.src)} alt="" />
                  </div>
                </div>
              ) : (
                <div className={`white-diary-mobile-photo ${photo.className}`} key={`mobile-photo-${mobileSpreadIndex}-${photo.className}`}>
                  <img src={asset(photo.src)} alt="" />
                </div>
              ),
            )}
          </div>

          {mobileStickers.map((sticker) => (
            <span className={`white-diary-mobile-sticker ${sticker.className}`} aria-hidden="true" key={`mobile-sticker-${mobileSpreadIndex}-${sticker.className}`} />
          ))}

          {mobileEmbeds.map((embed) => (
            <div className="white-diary-mobile-embed" key={`mobile-embed-${mobileSpreadIndex}-${embed.className}`}>
              <iframe
                src={embed.src}
                title={embed.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ))}

          {mobileDiaryPage > 0 ? (
            <button className="white-diary-mobile-nav white-diary-mobile-nav-prev" type="button" aria-label="Previous diary page" onClick={() => changeMobileDiaryPage(mobileDiaryPage - 1)}>
              <img src={asset('white-diary-arrow-prev.svg')} alt="" />
            </button>
          ) : null}
          {mobileDiaryPage < mobileTotalPages - 1 ? (
            <button className="white-diary-mobile-nav white-diary-mobile-nav-next" type="button" aria-label="Next diary page" onClick={() => changeMobileDiaryPage(mobileDiaryPage + 1)}>
              <img src={asset('white-diary-arrow-next.svg')} alt="" />
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="white-diary-page">
      <div
        className="white-diary-scale"
        style={{
          width: whitePagesDesignWidth * sceneScale,
          height: whitePagesDesignHeight * sceneScale,
        }}
      >
        <section
          className={`white-diary-scene is-turning-${turnDirection}${isPageTurning ? ' is-turning' : ''}`}
          style={{ transform: `scale(${sceneScale})` }}
          aria-label="White Diary"
        >
          <HomeButton className="home-button-white-diary" />

          <img className="white-diary-book" src={asset('white-diary-book.png')} alt="" />
          <div className="white-diary-paper">
            <img src={asset('white-diary-paper.png')} alt="" />
          </div>

          <div className="white-diary-lp" aria-hidden="true">
            <img src={asset('white-diary-lp-a.png')} alt="" />
            <img src={asset('white-diary-lp-b.png')} alt="" />
          </div>

          <div className="white-diary-title">
            <span>WHITE DIARY</span>
          </div>

          {pageTransition
            ? pageTransition.hideStableSide
              ? null
              : renderDiaryContent(whiteDiaryPages[diaryPage], diaryPage, [stableSide])
            : renderDiaryContent(whiteDiaryPages[diaryPage], diaryPage, ['left', 'right'])}
          {pageTransition?.showIncomingSide
            ? renderDiaryContent(whiteDiaryPages[pageTransition.nextPage], pageTransition.nextPage, [clickedSide])
            : null}

          <img className="white-diary-tape" src={asset('white-diary-tape.png')} alt="" />
          <div className="white-diary-pencil">
            <img src={asset('white-diary-pencil.png')} alt="" />
          </div>
          <div className="white-diary-pen">
            <img src={asset('white-diary-pen.png')} alt="" />
          </div>
          <div className="white-diary-eraser">
            <img src={asset('white-diary-eraser.png')} alt="" />
          </div>

          <div className="white-diary-turn-sheet" aria-hidden="true" />

          {diaryPage > 0 ? (
            <button
              className="white-diary-nav white-diary-nav-prev"
              type="button"
              aria-label="Previous diary page"
              onClick={() => turnDiaryPage(-1)}
            >
              <span className="white-diary-nav-arrow">
                <img src={asset('white-diary-arrow-prev.svg')} alt="" />
              </span>
              <span className="white-diary-fold white-diary-fold-left">
                <img src={asset('white-diary-fold-paper.png')} alt="" />
              </span>
            </button>
          ) : null}
          {diaryPage < whiteDiaryPages.length - 1 ? (
            <button
              className="white-diary-nav white-diary-nav-next"
              type="button"
              aria-label="Next diary page"
              onClick={() => turnDiaryPage(1)}
            >
              <span className="white-diary-nav-arrow">
                <img src={asset('white-diary-arrow-next.svg')} alt="" />
              </span>
              <span className="white-diary-fold white-diary-fold-right">
                <img src={asset('white-diary-fold-paper.png')} alt="" />
              </span>
            </button>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function WhiteRecordPage() {
  const isMobile = useIsMobileViewport();
  const [sceneScale, setSceneScale] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(whiteRecordMaxSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pressedControl, setPressedControl] = useState<WhiteRecordControlId | null>(null);
  const [pressedObjectId, setPressedObjectId] = useState<string | null>(null);
  const [activeAmbientPad, setActiveAmbientPad] = useState<WhiteRecordPadId | null>(null);
  const [selectedRecordChoice, setSelectedRecordChoice] = useState<WhiteRecordChoiceId>('sunset');
  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlaybackContextRef = useRef<AudioContext | null>(null);
  const ambientPlaybackContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const objectAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const discImageRef = useRef<HTMLImageElement | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);
  const elapsedSecondsRef = useRef(0);
  const durationSecondsRef = useRef(whiteRecordMaxSeconds);
  const shouldSaveRecordingRef = useRef(false);
  const discAnimationFrameRef = useRef<number | null>(null);
  const discLastFrameTimeRef = useRef<number | null>(null);
  const discRotationRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopDiscSpin = () => {
    if (discAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(discAnimationFrameRef.current);
      discAnimationFrameRef.current = null;
    }
    discLastFrameTimeRef.current = null;
  };

  const applyDiscRotation = () => {
    if (discImageRef.current) {
      discImageRef.current.style.transform = `rotate(${discRotationRef.current}deg)`;
    }
  };

  const setElapsed = (seconds: number) => {
    const nextSeconds = Math.min(Math.max(0, seconds), durationSecondsRef.current);
    elapsedSecondsRef.current = nextSeconds;
    setElapsedSeconds(nextSeconds);
  };

  const setDuration = (seconds: number) => {
    const nextSeconds = Math.min(Math.max(0, seconds), whiteRecordMaxSeconds);
    durationSecondsRef.current = nextSeconds;
    setDurationSeconds(nextSeconds);
    if (elapsedSecondsRef.current > nextSeconds) {
      setElapsed(nextSeconds);
    }
  };

  const stopStreams = () => {
    streamsRef.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    streamsRef.current = [];
  };

  const closeAudioContext = () => {
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const closePlaybackContext = (contextRef: { current: AudioContext | null }) => {
    if (contextRef.current) {
      void contextRef.current.close();
      contextRef.current = null;
    }
  };

  const stopAudioElement = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    closePlaybackContext(audioPlaybackContextRef);
  };

  const stopAmbientAudio = () => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
      ambientAudioRef.current = null;
    }
    closePlaybackContext(ambientPlaybackContextRef);
  };

  const stopObjectAudio = (objectId: string) => {
    const audio = objectAudioRefs.current[objectId];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const stopAllObjectAudio = () => {
    Object.values(objectAudioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  const playObjectAudio = (object: (typeof whiteRecordObjects)[number]) => {
    let audio = objectAudioRefs.current[object.id];

    if (!audio) {
      audio = new Audio(asset(object.audio));
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 1;
      objectAudioRefs.current[object.id] = audio;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.loop = true;
    void audio.play().catch(() => {
      // Browsers can block audio until the first user gesture; the next hover/click will retry.
    });
  };

  const clearRecordedAudio = () => {
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = null;
    }
  };

  const stopRecorder = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const resetRecordState = () => {
    clearTimer();
    stopAudioElement();
    shouldSaveRecordingRef.current = false;
    stopRecorder();
    stopStreams();
    closeAudioContext();
    clearRecordedAudio();
    recorderChunksRef.current = [];
    mediaRecorderRef.current = null;
    setIsPlaying(false);
    setIsRecording(false);
    setDuration(whiteRecordMaxSeconds);
    setElapsed(0);
  };

  const cleanupWhiteRecordPage = () => {
    resetRecordState();
    stopAmbientAudio();
    stopAllObjectAudio();
    setActiveAmbientPad(null);
  };

  useEffect(() => {
    const updateScale = () => {
      setSceneScale(Math.min(window.innerWidth / whiteRecordDesignWidth, window.innerHeight / whiteRecordDesignHeight, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => cleanupWhiteRecordPage, []);

  useEffect(() => {
    whiteRecordObjects.forEach((object) => {
      const audio = new Audio(asset(object.audio));
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 1;
      objectAudioRefs.current[object.id] = audio;
      audio.load();
    });

    return () => {
      stopAllObjectAudio();
      objectAudioRefs.current = {};
    };
  }, []);

  useEffect(() => {
    if (!isPlaying && !isRecording) {
      stopDiscSpin();
      applyDiscRotation();
      return;
    }

    const spin = (timestamp: number) => {
      if (discLastFrameTimeRef.current !== null) {
        const elapsedMs = timestamp - discLastFrameTimeRef.current;
        discRotationRef.current = (discRotationRef.current + elapsedMs * 0.12) % 360;
        applyDiscRotation();
      }

      discLastFrameTimeRef.current = timestamp;
      discAnimationFrameRef.current = window.requestAnimationFrame(spin);
    };

    stopDiscSpin();
    discAnimationFrameRef.current = window.requestAnimationFrame(spin);
    return stopDiscSpin;
  }, [isPlaying, isRecording]);

  const startTimer = (limitSeconds: number, onComplete?: () => void) => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      const nextSeconds = elapsedSecondsRef.current + 1;
      if (nextSeconds >= limitSeconds) {
        setElapsed(limitSeconds);
        clearTimer();
        onComplete?.();
        return;
      }
      setElapsed(nextSeconds);
    }, 1000);
  };

  const playBoostedAudio = async (audio: HTMLAudioElement, contextRef: { current: AudioContext | null }) => {
    closePlaybackContext(contextRef);

    const AudioContextClass =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      await audio.play();
      return;
    }

    const playbackContext = new AudioContextClass();
    const source = playbackContext.createMediaElementSource(audio);
    const gainNode = playbackContext.createGain();
    gainNode.gain.value = whiteRecordPlaybackGain;
    source.connect(gainNode).connect(playbackContext.destination);
    contextRef.current = playbackContext;
    await playbackContext.resume();
    await audio.play();
  };

  const handlePlay = () => {
    if (isRecording) return;

    stopAudioElement();
    setIsPlaying(true);

    if (elapsedSecondsRef.current >= durationSecondsRef.current) {
      setElapsed(0);
    }

    if (recordedAudioUrlRef.current) {
      const audio = new Audio(recordedAudioUrlRef.current);
      audio.volume = 1;
      audio.currentTime = elapsedSecondsRef.current;
      audioElementRef.current = audio;
      void playBoostedAudio(audio, audioPlaybackContextRef);
    }

    startTimer(durationSecondsRef.current, () => {
      stopAudioElement();
      setIsPlaying(false);
    });
  };

  const handlePause = () => {
    clearTimer();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    stopAudioElement();
    setIsPlaying(false);
  };

  const finishRecording = (nextDuration: number) => {
    clearTimer();
    setDuration(nextDuration);
    setElapsed(0);
    setIsPlaying(false);
    setIsRecording(false);
    shouldSaveRecordingRef.current = true;
    stopRecorder();
    closeAudioContext();
  };

  const handleStop = () => {
    if (isRecording) {
      finishRecording(Math.max(1, elapsedSecondsRef.current));
    } else {
      clearTimer();
      stopAudioElement();
      setIsPlaying(false);
      setElapsed(0);
    }
  };

  const addStreamToDestination = (context: AudioContext, destination: MediaStreamAudioDestinationNode, stream: MediaStream) => {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return false;

    const audioOnlyStream = new MediaStream(audioTracks);
    context.createMediaStreamSource(audioOnlyStream).connect(destination);
    return true;
  };

  const handleRecord = async () => {
    if (isRecording) return;

    resetRecordState();

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamsRef.current.push(micStream);

      const systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      systemStream.getVideoTracks().forEach((track) => track.stop());
      streamsRef.current.push(systemStream);

      if (systemStream.getAudioTracks().length === 0) {
        throw new Error('화면 공유 창에서 오디오 공유를 켜주세요.');
      }

      const AudioContextClass =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext is not available in this browser.');
      }
      const audioContext = new AudioContextClass();
      const destination = audioContext.createMediaStreamDestination();
      audioContextRef.current = audioContext;

      const hasMicAudio = addStreamToDestination(audioContext, destination, micStream);
      const hasSystemAudio = addStreamToDestination(audioContext, destination, systemStream);

      if (!hasMicAudio && !hasSystemAudio) {
        throw new Error('No audio input was available.');
      }

      const recorder = new MediaRecorder(destination.stream);
      mediaRecorderRef.current = recorder;
      recorderChunksRef.current = [];

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener('stop', () => {
        if (shouldSaveRecordingRef.current && recorderChunksRef.current.length > 0) {
          clearRecordedAudio();
          const blob = new Blob(recorderChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          recordedAudioUrlRef.current = URL.createObjectURL(blob);
        }
        shouldSaveRecordingRef.current = false;
        stopStreams();
      });

      setDuration(whiteRecordMaxSeconds);
      setElapsed(0);
      setIsRecording(true);
      recorder.start();
      startTimer(whiteRecordMaxSeconds, () => finishRecording(whiteRecordMaxSeconds));
    } catch (error) {
      resetRecordState();
      window.alert(
        error instanceof Error
          ? `녹음을 시작할 수 없어요. 마이크 권한과 화면/시스템 오디오 공유를 확인해주세요.\n${error.message}`
          : '녹음을 시작할 수 없어요. 마이크 권한과 화면/시스템 오디오 공유를 확인해주세요.',
      );
    }
  };

  const handleReset = () => {
    resetRecordState();
  };

  const handleControlClick = (controlId: WhiteRecordControlId) => {
    if (controlId === 'play') handlePlay();
    if (controlId === 'pause') handlePause();
    if (controlId === 'stop') handleStop();
    if (controlId === 'record') void handleRecord();
    if (controlId === 'reset') handleReset();
  };

  const getControlImage = (control: (typeof whiteRecordControls)[number]) => {
    const isActive = control.id === 'record' ? isRecording : pressedControl === control.id;
    return isActive ? control.activeImage : control.image;
  };

  const selectedChoice = whiteRecordChoices.find((choice) => choice.id === selectedRecordChoice) ?? whiteRecordChoices[0];

  const handleAmbientPadClick = (pad: (typeof whiteRecordPads)[number]) => {
    if (activeAmbientPad === pad.id) {
      stopAmbientAudio();
      setActiveAmbientPad(null);
      return;
    }

    stopAmbientAudio();
    const audio = new Audio(asset(pad.audio));
    audio.loop = true;
    audio.volume = 1;
    audio.currentTime = 0;
    ambientAudioRef.current = audio;
    setActiveAmbientPad(pad.id);
    void playBoostedAudio(audio, ambientPlaybackContextRef).catch(() => {
      stopAmbientAudio();
      setActiveAmbientPad(null);
    });
  };

  const handleMobileObjectPress = (object: (typeof whiteRecordObjects)[number]) => {
    setPressedObjectId(object.id);
    playObjectAudio(object);
  };

  const handleMobileObjectRelease = (objectId: string) => {
    setPressedObjectId((current) => (current === objectId ? null : current));
    stopObjectAudio(objectId);
  };

  const renderControls = (className: string) => (
    <div className={className}>
      {whiteRecordControls.map((control) => (
        <button
          className="white-record-control"
          type="button"
          aria-label={control.label}
          aria-pressed={control.id === 'record' ? isRecording : undefined}
          key={control.id}
          onPointerDown={() => setPressedControl(control.id)}
          onPointerLeave={() => {
            if (control.id !== 'record') setPressedControl(null);
          }}
          onPointerUp={() => {
            if (control.id !== 'record') setPressedControl(null);
          }}
          onClick={() => handleControlClick(control.id)}
        >
          <img src={asset(getControlImage(control))} alt="" />
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <main className="white-record-mobile-page">
        <section className="white-record-mobile-scene" aria-label="White Record">
          <div className="white-record-mobile-inner">
            <HomeButton className="home-button-white-record-mobile" />

            <div className="white-record-mobile-title">
              <span>WHITE RECORD</span>
            </div>

            <div className="white-record-mobile-time" aria-label="Recording time">
              <span>{formatRecordTime(elapsedSeconds)}</span>
              <span>/</span>
              <span>{formatRecordTime(durationSeconds)}</span>
            </div>

            {renderControls('white-record-mobile-control-row')}

            <section className="white-record-mobile-player" aria-label="White Record main part">
              <img className="white-record-mobile-turntable-base" src={asset('white-record-turntable-base.png')} alt="" />
              <img className="white-record-mobile-disc" ref={discImageRef} src={asset(selectedChoice.discImage)} alt="" />
              <div className="white-record-mobile-tonearm">
                <img src={asset('white-record-tonearm.png')} alt="" />
              </div>
            </section>

            <div className="white-record-mobile-choice-panel" aria-label="Choose one">
              <div className="white-record-mobile-choice-title">Choose one!</div>
              <div className="white-record-mobile-choice-list">
                {whiteRecordChoices.map((choice) => {
                  const isSelected = selectedRecordChoice === choice.id;

                  return (
                    <button
                      className={`white-record-mobile-choice${isSelected ? ' is-active' : ''}`}
                      type="button"
                      aria-label={choice.label}
                      aria-pressed={isSelected}
                      key={choice.id}
                      onClick={() => setSelectedRecordChoice(choice.id)}
                    >
                      <img src={asset(isSelected ? choice.activeImage : choice.image)} alt="" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="white-record-mobile-pad-row" aria-label="White Record pads">
              {whiteRecordPads.map((pad, index) => {
                const isActive = activeAmbientPad === pad.id;

                return (
                  <button
                    className={`white-record-mobile-pad white-record-mobile-pad-${index + 1}${isActive ? ' is-active' : ''}`}
                    type="button"
                    aria-label={pad.label}
                    aria-pressed={isActive}
                    key={pad.id}
                    onClick={() => handleAmbientPadClick(pad)}
                  >
                    <img src={asset(isActive ? pad.activeImage : pad.image)} alt="" />
                  </button>
                );
              })}
            </div>
            <p className="white-record-mobile-object-hint">아래 아이템을 눌러 소리를 들어보세요</p>

            <div className="white-record-mobile-object-layer" aria-label="White Record objects">
              {whiteRecordObjects.map((object) => {
                const isPressed = pressedObjectId === object.id;

                return (
                  <button
                    className={`white-record-mobile-object ${object.className}${isPressed ? ' is-pressed' : ''}`}
                    type="button"
                    aria-label={object.label}
                    key={object.id}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      handleMobileObjectPress(object);
                    }}
                    onPointerUp={(event) => {
                      event.preventDefault();
                      event.currentTarget.releasePointerCapture(event.pointerId);
                      handleMobileObjectRelease(object.id);
                    }}
                    onPointerCancel={(event) => {
                      event.preventDefault();
                      handleMobileObjectRelease(object.id);
                    }}
                    onPointerLeave={(event) => {
                      event.preventDefault();
                      handleMobileObjectRelease(object.id);
                    }}
                    onContextMenu={(event) => event.preventDefault()}
                  >
                    <img className="white-record-object-image-off" src={asset(object.offImage)} alt="" />
                    <img className="white-record-object-image-on" src={asset(object.onImage)} alt="" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="white-record-page">
      <div
        className="white-record-scale"
        style={{
          width: whiteRecordDesignWidth * sceneScale,
          height: whiteRecordDesignHeight * sceneScale,
        }}
      >
        <section className="white-record-scene" style={{ transform: `scale(${sceneScale})` }} aria-label="White Record">
          <HomeButton className="home-button-white-record" />

          <div className="white-record-title-badge">
            <span>WHITE RECORD</span>
          </div>

          <div className="white-record-transport" aria-label="White Record player controls">
            <div className="white-record-time" aria-label="Recording time">
              <span>{formatRecordTime(elapsedSeconds)}</span>
              <span>/</span>
              <span>{formatRecordTime(durationSeconds)}</span>
            </div>
            <div className="white-record-control-group">
              {whiteRecordControls.map((control) => (
                <button
                  className="white-record-control"
                  type="button"
                  aria-label={control.label}
                  aria-pressed={control.id === 'record' ? isRecording : undefined}
                  key={control.id}
                  onPointerDown={() => setPressedControl(control.id)}
                  onPointerLeave={() => {
                    if (control.id !== 'record') setPressedControl(null);
                  }}
                  onPointerUp={() => {
                    if (control.id !== 'record') setPressedControl(null);
                  }}
                  onClick={() => handleControlClick(control.id)}
                >
                  <img src={asset(getControlImage(control))} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="white-record-object-layer" aria-label="White Record objects">
            {whiteRecordObjects.map((object) => (
              <button
                className={`white-record-object ${object.className}`}
                type="button"
                aria-label={object.label}
                key={object.id}
                onPointerEnter={() => playObjectAudio(object)}
                onPointerLeave={() => stopObjectAudio(object.id)}
                onFocus={() => playObjectAudio(object)}
                onBlur={() => stopObjectAudio(object.id)}
              >
                <img className="white-record-object-image-off" src={asset(object.offImage)} alt="" />
                <img className="white-record-object-image-on" src={asset(object.onImage)} alt="" />
              </button>
            ))}
          </div>

          <section className="white-record-player" aria-label="White Record main part">
            <img className="white-record-turntable-base" src={asset('white-record-turntable-base.png')} alt="" />
            <img
              className="white-record-disc"
              ref={discImageRef}
              src={asset(selectedChoice.discImage)}
              alt=""
            />
            <div className="white-record-tonearm">
              <img src={asset('white-record-tonearm.png')} alt="" />
            </div>
          </section>

          <div className="white-record-choice-panel" aria-label="Choose one">
            <div className="white-record-choice-title">Choose one!</div>
            <div className="white-record-choice-list">
              {whiteRecordChoices.map((choice) => {
                const isSelected = selectedRecordChoice === choice.id;

                return (
                  <button
                    className={`white-record-choice${isSelected ? ' is-active' : ''}`}
                    type="button"
                    aria-label={choice.label}
                    aria-pressed={isSelected}
                    key={choice.id}
                    onClick={() => setSelectedRecordChoice(choice.id)}
                  >
                    <img src={asset(isSelected ? choice.activeImage : choice.image)} alt="" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="white-record-pad-row" aria-label="White Record pads">
            {whiteRecordPads.map((pad, index) => {
              const isActive = activeAmbientPad === pad.id;

              return (
              <button
                className={`white-record-pad white-record-pad-${index + 1}${isActive ? ' is-active' : ''}`}
                type="button"
                aria-label={pad.label}
                aria-pressed={isActive}
                key={pad.id}
                onClick={() => handleAmbientPadClick(pad)}
              >
                <img src={asset(isActive ? pad.activeImage : pad.image)} alt="" />
              </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

type FooterProps = {
  locale: Locale;
};

function Footer({ locale }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="support">
        <img className="busan-logo" src={asset('busan-logo.png')} alt="Busan Metropolitan City" />
        <img className="footer-busan" src={asset('footer-busan.svg')} alt="Busan Cultural Foundation" />
        <strong>ACCORD</strong>
        <span>{copy[locale].support}</span>
        <address className="contact">
          <a href="https://www.youtube.com/@jangma.1515" className="contact-item" target="_blank" rel="noreferrer">
            <img src={asset('icon-person.svg')} alt="" />
            <span>Jangma</span>
          </a>
          <a href="mailto:1515accord@gmail.com" className="contact-item">
            <img src={asset('icon-mail.svg')} alt="" />
            <span>1515accord@gmail.com</span>
          </a>
        </address>
      </div>
    </footer>
  );
}

function MobileFooter({ locale }: FooterProps) {
  return (
    <footer className="mobile-main-footer">
      <div className="mobile-main-footer-logos">
        <img className="mobile-main-busan-logo" src={asset('busan-logo.png')} alt="Busan Metropolitan City" />
        <img className="mobile-main-foundation-logo" src={asset('footer-busan.svg')} alt="Busan Cultural Foundation" />
        <strong>ACCORD</strong>
      </div>
      <p className="mobile-main-support-copy">
        {locale === 'ko' ? (
          <>
            본 사업은 2026년 부산광역시, 부산문화재단
            <br />
            &lt;청년 신진예술가 창작활동 지원사업&gt;의 지원을 받았습니다.
          </>
        ) : (
          copy.en.support
        )}
      </p>
      <address className="mobile-main-contact">
        <a href="https://www.youtube.com/@jangma.1515" className="mobile-main-contact-item" target="_blank" rel="noreferrer">
          <img src={asset('icon-person.svg')} alt="" />
          <span>Jangma</span>
        </a>
        <a href="mailto:1515accord@gmail.com" className="mobile-main-contact-item">
          <img src={asset('icon-mail.svg')} alt="" />
          <span>1515accord@gmail.com</span>
        </a>
      </address>
    </footer>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-label="Loading">
      <div className="loading-stack">
        <div className="loading-lp">
          <img className="loading-lp-base" src={asset('loading-lp-base.png')} alt="" />
          <img className="loading-lp-disc" src={asset('loading-lp-disc.png')} alt="" />
        </div>
        <div className="loading-text" aria-label="Loading">
          <span className="loading-note">♪</span>
          {loadingLetters.map((letter, index) => (
            <span className="loading-letter" style={{ animationDelay: `${index * 0.12}s` }} key={letter + index}>
              {letter}
            </span>
          ))}
          <span className="loading-note">♪</span>
        </div>
      </div>
    </main>
  );
}

function useIsMobileViewport() {
  const getIsMobile = () => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const updateMobile = () => setIsMobile(mediaQuery.matches);

    updateMobile();
    mediaQuery.addEventListener('change', updateMobile);
    window.addEventListener('resize', updateMobile);
    return () => {
      mediaQuery.removeEventListener('change', updateMobile);
      window.removeEventListener('resize', updateMobile);
    };
  }, []);

  return isMobile;
}

type MobileMainProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onNavigate: (href: string) => void;
  isLoading: boolean;
};

function MobileMain({ locale, onLocaleChange, onNavigate, isLoading }: MobileMainProps) {
  const mobileLinks = [
    { id: 'lp', label: 'White Record', image: 'mobile-main-lp.png', className: 'mobile-main-lp' },
    { id: 'camera', label: 'Track Archive', image: 'mobile-main-camera.png', className: 'mobile-main-camera' },
    { id: 'jangma', label: 'Jangma', image: 'mobile-main-jangma.png', className: 'mobile-main-jangma' },
    { id: 'diary', label: 'White Diary', image: 'mobile-main-diary.png', className: 'mobile-main-diary' },
  ];

  return (
    <main className="mobile-main-page" aria-busy={isLoading}>
      <div className="mobile-main-scene">
        <LanguageSwitch locale={locale} onLocaleChange={onLocaleChange} />

        <header className="mobile-main-brand">
          <img src={asset('pixelated-white-record.png')} alt="White Record" />
          <p>Welcome to White Record!</p>
        </header>

        <nav className="mobile-main-object-list" aria-label="White Record archives">
          {mobileLinks.map((link) => (
            <a
              className={`mobile-main-object ${link.className}`}
              href={`#${link.id}`}
              key={link.id}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(`#${link.id}`);
              }}
            >
              <img src={asset(link.image)} alt="" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        <MobileFooter locale={locale} />
      </div>
    </main>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobileViewport();
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    if (window.location.hash === '#lp') return 'lp';
    if (window.location.hash === '#jangma') return 'jangma';
    if (window.location.hash === '#camera') return 'track';
    if (window.location.hash === '#diary') return 'diary';
    return 'main';
  });
  const loadingTimer = useRef<number | null>(null);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    scrollToPageTop();
  }, [currentPage]);

  useEffect(() => {
    const preventImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    };
    const preventTextSelection = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener('dragstart', preventImageDrag);
    document.addEventListener('selectstart', preventTextSelection);
    return () => {
      document.removeEventListener('dragstart', preventImageDrag);
      document.removeEventListener('selectstart', preventTextSelection);
    };
  }, []);

  useEffect(() => {
    const startedAt = Date.now();

    const finishInitialLoading = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minimumInitialLoadingMs - elapsed);
      loadingTimer.current = window.setTimeout(() => setIsLoading(false), remaining);
    };

    if (document.readyState === 'complete') {
      finishInitialLoading();
    } else {
      window.addEventListener('load', finishInitialLoading, { once: true });
    }

    return () => {
      window.removeEventListener('load', finishInitialLoading);
      if (loadingTimer.current) {
        window.clearTimeout(loadingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      scrollToPageTop();
      if (window.location.hash === '#lp') {
        setCurrentPage('lp');
        return;
      }
      if (window.location.hash === '#jangma') {
        setCurrentPage('jangma');
        return;
      }
      if (window.location.hash === '#camera') {
        setCurrentPage('track');
        return;
      }
      if (window.location.hash === '#diary') {
        setCurrentPage('diary');
        return;
      }
      setCurrentPage('main');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showPageLoading = (afterLoading: () => void) => {
    if (loadingTimer.current) {
      window.clearTimeout(loadingTimer.current);
    }

    setIsLoading(true);
    loadingTimer.current = window.setTimeout(() => {
      afterLoading();
      setIsLoading(false);
      loadingTimer.current = null;
    }, pageTransitionLoadingMs);
  };

  const handleInternalNavigation = (href: string) => {
    showPageLoading(() => {
      scrollToPageTop();
      window.location.hash = href;
      setCurrentPage(
        href === '#lp' ? 'lp' : href === '#jangma' ? 'jangma' : href === '#camera' ? 'track' : href === '#diary' ? 'diary' : 'main',
      );
    });
  };

  return (
    <>
      {currentPage === 'lp' ? (
        <WhiteRecordPage />
      ) : currentPage === 'jangma' ? (
        <JangmaPage locale={locale} />
      ) : currentPage === 'track' ? (
        <TrackArchivePage locale={locale} />
      ) : currentPage === 'diary' ? (
        <WhiteDiaryArchivePage locale={locale} />
      ) : isMobile ? (
        <MobileMain locale={locale} onLocaleChange={setLocale} onNavigate={handleInternalNavigation} isLoading={isLoading} />
      ) : (
        <main className="page-shell" aria-busy={isLoading}>
          <div className="main-frame">
            <div className="hero-layout">
              <LanguageSwitch locale={locale} onLocaleChange={setLocale} />

              <header className="brand-header">
                <img src={asset('pixelated-white-record.png')} alt="White Record" />
                <p>Welcome to White Record!</p>
              </header>

              <div className="hero-stage-center">
                <HeroObjects onNavigate={handleInternalNavigation} />
              </div>
            </div>

            <Footer locale={locale} />
          </div>
        </main>
      )}
      {isLoading ? <LoadingScreen /> : null}
    </>
  );
}
