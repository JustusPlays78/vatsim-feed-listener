import { useState } from 'react';
import { Container } from '../components/layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui';
import { Globe, Shield, Database, Eye, Clock, RefreshCcw } from 'lucide-react';

export default function PrivacyPage() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  const content = {
    en: {
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      lastUpdated: 'Last updated: October 8, 2025',
      sections: [
        {
          icon: Shield,
          title: '1. Data Collection',
          content: [
            'This application does NOT store any personal data permanently.',
            'All displayed flight data is fetched in real-time from public VATSIM APIs.',
            'Your browser may temporarily cache API responses for performance optimization (max. 5 minutes).',
            'No cookies are used for tracking purposes.',
          ],
        },
        {
          icon: Database,
          title: '2. Temporary Data Processing',
          content: [
            'We process personal data from VATSIM (pilot names, callsigns, CIDs) temporarily to display flight information.',
            'This data is retrieved from VATSIM Data Feed (data.vatsim.net) and VATSIM Events API (my.vatsim.net).',
            'Historical flight data is provided by STATSIM API (api.statsim.net).',
            'Event data is cached on our server for 72 hours to provide past event information (VATSIM API only returns upcoming events).',
            'All cached event data is automatically deleted after 72 hours.',
          ],
        },
        {
          icon: RefreshCcw,
          title: '3. Data Persistence',
          content: [
            'Pressing F5 (refresh) clears all temporarily cached data in your browser.',
            'Closing the browser tab removes all processed data from memory.',
            'Only your theme preference (dark/light mode) is saved in localStorage.',
            'Our server caches VATSIM event data for 72 hours in a local JSON file (event-cache.json).',
            'This cache survives server restarts and is automatically cleaned after 72 hours.',
            'No user accounts, login credentials, or personal information are stored.',
          ],
        },
        {
          icon: Eye,
          title: '4. Third-Party APIs',
          content: [
            'VATSIM Data API (data.vatsim.net): Live flight data',
            'VATSIM Events API (my.vatsim.net): Event information',
            'STATSIM API (api.statsim.net): Historical flight records',
            'These services have their own privacy policies. We recommend reviewing them.',
          ],
        },
        {
          icon: Clock,
          title: '5. Client-Side Caching',
          content: [
            'API responses are cached in your browser for 5 minutes to reduce server load.',
            'This cache is temporary and stored only in browser memory (not on disk).',
            'Cache is automatically cleared when you close the application.',
            'You can force-clear the cache by refreshing the page (F5).',
          ],
        },
        {
          icon: Globe,
          title: '6. Your Rights',
          content: [
            'Since we do not store personal data, there is no data to delete or export.',
            'All displayed data originates from VATSIM and STATSIM public APIs.',
            'For questions about your VATSIM data, contact VATSIM directly.',
            'This application is an independent tool and not officially affiliated with VATSIM.',
          ],
        },
      ],
      contact: {
        title: 'Contact',
        text: 'For questions about this privacy policy, please contact us via GitHub:',
        link: 'github.com/JustusPlays78/vatsim-feed-listener',
      },
    },
    de: {
      title: 'Datenschutzerklärung',
      subtitle: 'Wie wir mit Ihren Daten umgehen',
      lastUpdated: 'Zuletzt aktualisiert: 8. Oktober 2025',
      sections: [
        {
          icon: Shield,
          title: '1. Datenerfassung',
          content: [
            'Diese Anwendung speichert KEINE personenbezogenen Daten dauerhaft.',
            'Alle angezeigten Flugdaten werden in Echtzeit von öffentlichen VATSIM-APIs abgerufen.',
            'Ihr Browser kann API-Antworten temporär zwischenspeichern (max. 5 Minuten) zur Performance-Optimierung.',
            'Es werden keine Cookies für Tracking-Zwecke verwendet.',
          ],
        },
        {
          icon: Database,
          title: '2. Temporäre Datenverarbeitung',
          content: [
            'Wir verarbeiten personenbezogene Daten von VATSIM (Pilotennamen, Callsigns, CIDs) temporär zur Anzeige von Fluginformationen.',
            'Diese Daten werden von VATSIM Data Feed (data.vatsim.net) und VATSIM Events API (my.vatsim.net) abgerufen.',
            'Historische Flugdaten werden von der STATSIM API (api.statsim.net) bereitgestellt.',
            'Event-Daten werden auf unserem Server für 72 Stunden zwischengespeichert (VATSIM API liefert nur bevorstehende Events).',
            'Alle gecachten Event-Daten werden automatisch nach 72 Stunden gelöscht.',
          ],
        },
        {
          icon: RefreshCcw,
          title: '3. Datenpersistenz',
          content: [
            'Durch Drücken von F5 (Aktualisieren) werden alle temporär zwischengespeicherten Daten in Ihrem Browser gelöscht.',
            'Das Schließen des Browser-Tabs entfernt alle verarbeiteten Daten aus dem Speicher.',
            'Nur Ihre Theme-Einstellung (Dark/Light Mode) wird im localStorage gespeichert.',
            'Unser Server speichert VATSIM-Event-Daten für 72 Stunden in einer lokalen JSON-Datei (event-cache.json).',
            'Dieser Cache überlebt Server-Neustarts und wird automatisch nach 72 Stunden bereinigt.',
            'Keine Benutzerkonten, Anmeldedaten oder persönliche Informationen werden gespeichert.',
          ],
        },
        {
          icon: Eye,
          title: '4. Drittanbieter-APIs',
          content: [
            'VATSIM Data API (data.vatsim.net): Live-Flugdaten',
            'VATSIM Events API (my.vatsim.net): Event-Informationen',
            'STATSIM API (api.statsim.net): Historische Flugaufzeichnungen',
            'Diese Dienste haben eigene Datenschutzrichtlinien. Wir empfehlen, diese zu prüfen.',
          ],
        },
        {
          icon: Clock,
          title: '5. Clientseitiges Caching',
          content: [
            'API-Antworten werden 5 Minuten lang in Ihrem Browser zwischengespeichert, um Serverlast zu reduzieren.',
            'Dieser Cache ist temporär und wird nur im Browser-Speicher gehalten (nicht auf Festplatte).',
            'Der Cache wird automatisch gelöscht, wenn Sie die Anwendung schließen.',
            'Sie können den Cache durch Neuladen der Seite (F5) manuell löschen.',
          ],
        },
        {
          icon: Globe,
          title: '6. Ihre Rechte',
          content: [
            'Da wir keine personenbezogenen Daten speichern, gibt es keine Daten zum Löschen oder Exportieren.',
            'Alle angezeigten Daten stammen von öffentlichen VATSIM- und STATSIM-APIs.',
            'Für Fragen zu Ihren VATSIM-Daten kontaktieren Sie VATSIM direkt.',
            'Diese Anwendung ist ein unabhängiges Tool und nicht offiziell mit VATSIM verbunden.',
          ],
        },
      ],
      contact: {
        title: 'Kontakt',
        text: 'Für Fragen zu dieser Datenschutzerklärung kontaktieren Sie uns bitte über GitHub:',
        link: 'github.com/JustusPlays78/vatsim-feed-listener',
      },
    },
  };

  const currentContent = content[language];

  return (
    <Container size="xl">
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {currentContent.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {currentContent.subtitle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {currentContent.lastUpdated}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
              leftIcon={<Globe className="w-4 h-4" />}
            >
              English
            </Button>
            <Button
              variant={language === 'de' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLanguage('de')}
              leftIcon={<Globe className="w-4 h-4" />}
            >
              Deutsch
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {currentContent.sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} variant="bordered" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {section.title}
                    </h2>
                    <ul className="space-y-2">
                      {section.content.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-1">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contact */}
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {currentContent.contact.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentContent.contact.text}
            </p>
            <a
              href={`https://${currentContent.contact.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              {currentContent.contact.link}
            </a>
          </div>
        </Card>
      </div>
    </Container>
  );
}
