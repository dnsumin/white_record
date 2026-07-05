import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';

const asset = (name: string) => `/assets/${name}`;

type ArchiveObject = {
  id: string;
  label: string;
  image: string;
  title: string;
};

type Locale = 'ko' | 'en';

const copy = {
  ko: {
    support:
      '본 사업은 2026년 부산광역시, 부산문화재단 <2026 청년 신진예술가 창작활동 지원사업>의 지원을 받았습니다.',
  },
  en: {
    support:
      'Supported by Busan Metropolitan City & Busan Cultural Foundation <2026 Emerging Young Artists Creative Support Program>',
  },
};

const archiveObjects: ArchiveObject[] = [
  { id: 'lp', label: 'LP archive', image: 'main-lp.png', title: 'White Record' },
  { id: 'camera', label: 'Camera archive', image: 'main-camera.png', title: 'Track Archive' },
  { id: 'jangma', label: 'Jangma microphone archive', image: 'main-jangma.png', title: 'Jangma' },
  { id: 'diary', label: 'Diary archive', image: 'main-diary.png', title: 'White Pages' },
];

const loadingLetters = ['L', 'o', 'a', 'd', 'i', 'n', 'g'];

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
        return { object, style: getObjectStyle(position) };
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
    dragStartX.current = event.clientX;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;
    setDragOffset(event.clientX - dragStartX.current);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;

    const finalOffset = event.clientX - dragStartX.current;
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);

    const stepCount = Math.round(-finalOffset / snapDistance);
    if (stepCount === 0) return;
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
      {visibleObjects.map(({ object, style }) => (
        <div
          className={`gallery-object asset-${object.id}`}
          aria-label={object.label}
          key={object.id}
          style={style}
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
    });
  };

  return (
    <>
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
      {isLoading ? <LoadingScreen /> : null}
    </>
  );
}
