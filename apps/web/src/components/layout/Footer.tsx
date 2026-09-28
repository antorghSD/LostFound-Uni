import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-muted/30 py-6">
      <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} United International University</p>
        <p>{t('app.tagline')}</p>
      </div>
    </footer>
  );
}