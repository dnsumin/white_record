import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

const asset = (name: string) => `/assets/${name}`;

type ArchiveObject = {
  id: string;
  label: string;
  image: string;
  title: string;
};

type Locale = 'ko' | 'en';
type AppPage = 'main' | 'jangma' | 'track';
type JangmaWindow = 'profile' | 'playlist' | 'stills';
type TrackArchiveMode = 'mv' | 'lyric';
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
  { id: 'diary', label: 'Diary archive', image: 'main-diary.png', title: 'White Pages' },
];

const loadingLetters = ['L', 'o', 'a', 'd', 'i', 'n', 'g'];
const jangmaStills = Array.from({ length: 15 }, (_, index) => `jangma-still-${String(index + 1).padStart(2, '0')}.png`);

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
const minimumInitialLoadingMs = 2000;
const pageTransitionLoadingMs = 900;
const jangmaDesignWidth = 1920;
const jangmaDesignHeight = 1080;
const jangmaFitRatio = 0.94;
const jangmaContentCenterX = (149 + 1726) / 2;
const jangmaDragMinLeft = 420;
const stillFrameWidth = 924;
const trackArchiveDesignWidth = 1920;
const trackArchiveDesignHeight = 1129;
const trackArchiveFitRatio = 0.98;

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
  const pressedObject = useRef<{ id: string; isCenter: boolean } | null>(null);
  const dragProgress = isDragging ? -dragOffset / snapDistance : 0;

  const scheduleTitleChange = (nextRotation: number) => {
    if (titleTimer.current) {
      window.clearTimeout(titleTimer.current);
    }

    titleTimer.current = window.setTimeout(() => {
      setActiveTitle(archiveObjects[nextRotation].title);
      titleTimer.current = null;
    }, motionDuration);
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
      if (!didDrag.current && clickTarget?.isCenter && ['camera', 'jangma'].includes(clickTarget.id)) {
        onNavigate(`#${clickTarget.id}`);
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
      {visibleObjects.map(({ object, style, isCenter }) => (
        <div
          className={`gallery-object asset-${object.id}${
            ['camera', 'jangma'].includes(object.id) && isCenter ? ' is-clickable' : ''
          }`}
          aria-label={object.label}
          key={object.id}
          style={style}
          data-object-id={object.id}
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
  const [openWindows, setOpenWindows] = useState<JangmaWindow[]>([]);
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

  return (
    <main className="jangma-page">
      <img className="jangma-bg" src={asset('jangma-bg.png')} alt="" />

      <button
        className="jangma-temp-back"
        type="button"
        aria-label="Back"
        onClick={() => {
          window.location.hash = '';
        }}
      >
        <img src={asset('button-next.svg')} alt="" />
      </button>

      <div className="jangma-scene" style={{ transform: `translateX(${sceneOffsetX}px) scale(${sceneScale})` }}>
        <aside className="jangma-sidebar" aria-label="Jangma controls">
          <div className="jangma-profile-card">
            <img src={asset('jangma-profile.png')} alt="Jangma profile" />
            <p>Jangma</p>
          </div>

          <nav className={`jangma-button-stack${activeWindow === null ? ' is-idle' : ''}`} aria-label="Jangma page sections">
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
  const [trackMode, setTrackMode] = useState<TrackArchiveMode>('mv');
  const [sceneScale, setSceneScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setSceneScale(Math.min(window.innerWidth / trackArchiveDesignWidth, 1) * trackArchiveFitRatio);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const trackArchiveCopy = {
    ko: {
      albumTitle: ['장마 1st EP', '‘ 화이트 레코드 ’'],
      tracks: ['하나 둘', '맨발로 걷는 하루', '나만의 반딧불', '황혼성 사냥', '나만의 반딧불'],
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
      trackDetails: [
        ['mic test', 'The song smokers'],
        ['Hop Step Jump', 'I think it wasn’t all for nothing'],
        ['fairytale', "Can't mail this letter"],
        ['Twilight hunting', 'Which way to go'],
      ],
    },
  };

  const pageCopy = trackArchiveCopy[locale];

  return (
    <main className="track-archive-page">
      <div
        className="track-archive-scale"
        style={{
          width: trackArchiveDesignWidth * sceneScale,
          height: trackArchiveDesignHeight * sceneScale,
        }}
      >
        <div className="track-archive-scene" style={{ transform: `scale(${sceneScale})` }}>
          <aside className="track-album-panel" aria-label="White Record album track list">
            <div className="track-sidebar-button">White Record</div>
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
                  onClick={() => setTrackMode('mv')}
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
                src="https://www.youtube.com/embed/jEdoHGAi3lw?si=yLAS_tk_Eiqf9eDn"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="track-card-grid" aria-label="Track descriptions">
              {pageCopy.trackDetails.map(([title, description]) => (
                <article className="track-info-card" key={title}>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
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

export default function App() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    if (window.location.hash === '#jangma') return 'jangma';
    if (window.location.hash === '#camera') return 'track';
    return 'main';
  });
  const loadingTimer = useRef<number | null>(null);

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
      if (window.location.hash === '#jangma') {
        setCurrentPage('jangma');
        return;
      }
      if (window.location.hash === '#camera') {
        setCurrentPage('track');
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
      window.location.hash = href;
      setCurrentPage(href === '#jangma' ? 'jangma' : href === '#camera' ? 'track' : 'main');
    });
  };

  return (
    <>
      {currentPage === 'jangma' ? (
        <JangmaPage locale={locale} />
      ) : currentPage === 'track' ? (
        <TrackArchivePage locale={locale} />
      ) : (
        <main className="page-shell" aria-busy={isLoading}>
          <div className="main-frame">
            <div className="hero-layout">
              <LanguageSwitch locale={locale} onLocaleChange={setLocale} />

              <header className="brand-header">
                <img src={asset('pixelated-white-record.png')} alt="White Record" />
                <p>Welcome to White Record!</p>
              </header>

              <HeroObjects onNavigate={handleInternalNavigation} />
            </div>

            <Footer locale={locale} />
          </div>
        </main>
      )}
      {isLoading ? <LoadingScreen /> : null}
    </>
  );
}
