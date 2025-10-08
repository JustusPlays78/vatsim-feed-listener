import { useState } from 'react';
import { Container } from '../components/layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui';
import { Globe, Mail, Code, ExternalLink } from 'lucide-react';

export default function ImprintPage() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  const content = {
    en: {
      title: 'Imprint / Legal Notice',
      subtitle: 'Information according to § 5 TMG',
      sections: {
        responsible: {
          title: 'Responsible for Content',
          content: [
            'This is an independent, non-commercial open-source project.',
            'Project Owner: JustusPlays78',
            'GitHub: github.com/JustusPlays78/vatsim-feed-listener',
          ],
        },
        disclaimer: {
          title: 'Disclaimer',
          content: [
            'This application is NOT officially affiliated with VATSIM.net.',
            'All flight data is provided by VATSIM Data API and STATSIM API.',
            'We do not guarantee the accuracy, completeness, or timeliness of the displayed information.',
            'Use of this application is at your own risk.',
          ],
        },
        liability: {
          title: 'Liability for Links',
          content: [
            'This website contains links to external third-party websites.',
            'We have no influence on the content of these linked pages.',
            'We are not liable for the content of linked pages.',
            'The respective provider or operator is always responsible for the content of linked pages.',
          ],
        },
        copyright: {
          title: 'Copyright & License',
          content: [
            'This project is open-source and available under MIT License.',
            'You are free to use, modify, and distribute this software.',
            'VATSIM logo and trademarks are property of VATSIM.net.',
            'Flight data is provided by VATSIM Data Feed and STATSIM API.',
          ],
        },
        dataProtection: {
          title: 'Data Protection',
          content: [
            'We cache VATSIM event data on our server for 72 hours to provide past event history.',
            'All other flight data is fetched in real-time from public APIs and not permanently stored.',
            'The event cache is automatically cleaned after 72 hours.',
            'For more information, see our Privacy Policy.',
          ],
        },
      },
      apis: {
        title: 'Third-Party Services',
        items: [
          {
            name: 'VATSIM Data Feed',
            url: 'https://data.vatsim.net',
            description: 'Real-time flight data from VATSIM network',
          },
          {
            name: 'VATSIM Events API',
            url: 'https://my.vatsim.net/api',
            description: 'Event information and schedules',
          },
          {
            name: 'STATSIM API',
            url: 'https://api.statsim.net',
            description: 'Historical flight data and statistics',
          },
        ],
      },
    },
    de: {
      title: 'Impressum',
      subtitle: 'Angaben gemäß § 5 TMG',
      sections: {
        responsible: {
          title: 'Verantwortlich für den Inhalt',
          content: [
            'Dies ist ein unabhängiges, nicht-kommerzielles Open-Source-Projekt.',
            'Projektinhaber: JustusPlays78',
            'GitHub: github.com/JustusPlays78/vatsim-feed-listener',
          ],
        },
        disclaimer: {
          title: 'Haftungsausschluss',
          content: [
            'Diese Anwendung ist NICHT offiziell mit VATSIM.net verbunden.',
            'Alle Flugdaten werden von der VATSIM Data API und STATSIM API bereitgestellt.',
            'Wir übernehmen keine Garantie für die Richtigkeit, Vollständigkeit oder Aktualität der angezeigten Informationen.',
            'Die Nutzung dieser Anwendung erfolgt auf eigene Gefahr.',
          ],
        },
        liability: {
          title: 'Haftung für Links',
          content: [
            'Diese Webseite enthält Links zu externen Webseiten Dritter.',
            'Auf die Inhalte dieser verlinkten Seiten haben wir keinen Einfluss.',
            'Wir übernehmen keine Haftung für die Inhalte verlinkter Seiten.',
            'Für die Inhalte verlinkter Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.',
          ],
        },
        copyright: {
          title: 'Urheberrecht & Lizenz',
          content: [
            'Dieses Projekt ist Open-Source und unter MIT-Lizenz verfügbar.',
            'Sie dürfen diese Software frei nutzen, modifizieren und verteilen.',
            'VATSIM-Logo und Markenzeichen sind Eigentum von VATSIM.net.',
            'Flugdaten werden von VATSIM Data Feed und STATSIM API bereitgestellt.',
          ],
        },
        dataProtection: {
          title: 'Datenschutz',
          content: [
            'Wir speichern VATSIM-Event-Daten auf unserem Server für 72 Stunden zur Bereitstellung vergangener Event-Verläufe.',
            'Alle anderen Flugdaten werden in Echtzeit von öffentlichen APIs abgerufen und nicht dauerhaft gespeichert.',
            'Der Event-Cache wird automatisch nach 72 Stunden bereinigt.',
            'Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
          ],
        },
      },
      apis: {
        title: 'Drittanbieter-Dienste',
        items: [
          {
            name: 'VATSIM Data Feed',
            url: 'https://data.vatsim.net',
            description: 'Echtzeit-Flugdaten vom VATSIM-Netzwerk',
          },
          {
            name: 'VATSIM Events API',
            url: 'https://my.vatsim.net/api',
            description: 'Event-Informationen und Zeitpläne',
          },
          {
            name: 'STATSIM API',
            url: 'https://api.statsim.net',
            description: 'Historische Flugdaten und Statistiken',
          },
        ],
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(currentContent.sections).map(([key, section]) => (
            <Card key={key} variant="bordered" padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.content.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-1">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Third-Party APIs */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {currentContent.apis.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentContent.apis.items.map((api, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {api.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {api.description}
                </p>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Visit
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {language === 'en' ? 'Contact' : 'Kontakt'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {language === 'en'
                ? 'For questions or feedback, please contact us via GitHub:'
                : 'Für Fragen oder Feedback kontaktieren Sie uns bitte über GitHub:'}
            </p>
            <a
              href="https://github.com/JustusPlays78/vatsim-feed-listener"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <Code className="w-4 h-4" />
              github.com/JustusPlays78/vatsim-feed-listener
            </a>
          </div>
        </Card>
      </div>
    </Container>
  );
}
